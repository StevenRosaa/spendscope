import json
from pydantic import BaseModel, Field, field_validator
import boto3
import os
from datetime import datetime
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

# 1. Definiamo la struttura JSON esatta che l'AI deve rispettare (Structured Output)
class ExpenseItem(BaseModel):
    description: str = Field(description="Nome del prodotto o servizio")
    amount: float = Field(description="Prezzo del singolo prodotto")
    category: str = Field(
        # Ora la lista combacia ESATTAMENTE con il tuo ENUM del database!
        description="Categorizza la spesa. Scegli SOLO tra: FOOD_AND_GROCERIES, TRANSPORTATION, UTILITIES, ENTERTAINMENT, HEALTHCARE, OTHER"
    )

    @field_validator('category', mode='before')
    @classmethod
    def format_category(cls, v: str) -> str:
        # Forza la parola in MAIUSCOLO per il DB
        val = v.upper().strip()
        
        # Super-sicurezza: se l'AI dovesse comunque sbagliare e aggiungere una 'S', la correggiamo noi
        if val == "OTHERS":
            return "OTHER"
        if val == "HEALTH":
            return "HEALTHCARE"
            
        return val

class ReceiptData(BaseModel):
    store_name: str = Field(description="Il nome del negozio, ristorante o azienda")
    receipt_date: str = Field(description="Data dello scontrino nel formato YYYY-MM-DD")
    total_amount: float = Field(description="Il costo totale finale pagato nello scontrino")
    items: List[ExpenseItem] = Field(description="La lista dei singoli prodotti acquistati")

# 2. La funzione principale asincrona
async def process_receipt_image(file_url: str) -> Dict[str, Any]:
    """
    Servizio OCR reale alimentato da Google Gemini.
    Scarica l'immagine dal bucket e usa l'AI per estrarre i dati strutturati.
    """
    # A. Scarichiamo l'immagine usando le nostre credenziali (Boto3)
    bucket_name = os.getenv("S3_BUCKET_NAME")
    
    # Estraiamo il percorso esatto del file dall'URL (es: "users/1/scontrino.jpg")
    file_key = file_url.split(f"/{bucket_name}/")[-1]

    # Usiamo le nostre chiavi segrete del file .env per entrare
    s3_client = boto3.client(
        's3',
        endpoint_url=os.getenv("S3_ENDPOINT_URL"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )

    # Preleviamo i byte dell'immagine con i permessi da proprietario
    response = s3_client.get_object(Bucket=bucket_name, Key=file_key)
    file_bytes = response['Body'].read()

    # B. Inizializziamo il client (legge in automatico GEMINI_API_KEY dal file .env)
    client = genai.Client()

    # C. Capiamo il formato del file dall'URL (Gemini supporta immagini e PDF)
    mime_type = "image/jpeg"
    file_url_lower = file_url.lower()
    if file_url_lower.endswith(".png"):
        mime_type = "image/png"
    elif file_url_lower.endswith(".pdf"):
        mime_type = "application/pdf"

    # D. Chiediamo a Gemini di analizzare il file
    prompt = (
        "Sei un contabile esperto. Analizza questo scontrino/fattura ed estrai i dati richiesti. "
        "Se non riesci a trovare una data chiara, usa la data di oggi. "
        "Se il documento è illeggibile, cerca di fare del tuo meglio per dedurre i costi."
    )
    
    # Usiamo il client.aio per non bloccare FastAPI mentre l'AI pensa
    ai_response = await client.aio.models.generate_content(
        model='gemini-3-flash-preview',
        contents=[
            types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
            prompt
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ReceiptData,  # L'AI è forzata a seguire il nostro schema Pydantic!
            temperature=0.1,              # Temperatura bassa = massima precisione, zero fantasia
        )
    )

    # E. Gemini ci restituisce una stringa JSON perfetta, la convertiamo in Dizionario Python
    data = json.loads(ai_response.text)
    
    # Convertiamo la data da formato testo a oggetto 'datetime', come si aspetta il tuo Database
    try:
        parsed_date = datetime.strptime(data["receipt_date"], "%Y-%m-%d")
    except ValueError:
        parsed_date = datetime.utcnow()
        
    data["receipt_date"] = parsed_date

    return data