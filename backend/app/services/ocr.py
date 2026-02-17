import json
from pydantic import BaseModel, Field, field_validator
import boto3
import os
from datetime import datetime
from typing import Dict, Any, List
from google import genai
from google.genai import types

class ExpenseItem(BaseModel):
    description: str = Field(description="Nome del prodotto o servizio")
    amount: float = Field(description="Prezzo del singolo prodotto")
    category: str = Field(
        description="Categorizza la spesa. Scegli SOLO tra: FOOD_AND_GROCERIES, TRANSPORTATION, UTILITIES, ENTERTAINMENT, HEALTHCARE, OTHER"
    )

    @field_validator('category', mode='before')
    @classmethod
    def format_category(cls, v: str) -> str:
        val = v.upper().strip()
        if val == "OTHERS": return "OTHER"
        if val == "HEALTH": return "HEALTHCARE"
        return val

# --- SCHEMA AGGIORNATO PER GEMINI ---
class ReceiptData(BaseModel):
    store_name: str = Field(description="Il nome del negozio, ristorante o azienda")
    receipt_date: str = Field(description="Data dello scontrino nel formato YYYY-MM-DD")
    total_amount: float = Field(description="Il costo totale finale pagato nello scontrino")
    
    # I NUOVI CAMPI
    currency: str = Field(
        description="Il codice valuta ISO di 3 lettere (es. USD, EUR, GBP, JPY). Dedurlo dai simboli ($, €, £) o dal testo. Se incerto, usa USD."
    )
    country: str = Field(
        description="Il paese in cui si trova il negozio (es. Italy, United States, UK). Dedurlo dall'indirizzo, città, o formato della Partita IVA/VAT."
    )
    
    items: List[ExpenseItem] = Field(description="La lista dei singoli prodotti acquistati")


async def process_receipt_image(file_url: str) -> Dict[str, Any]:
    """
    Servizio OCR reale alimentato da Google Gemini.
    Scarica l'immagine dal bucket e usa l'AI per estrarre i dati strutturati.
    """
    bucket_name = os.getenv("S3_BUCKET_NAME")
    file_key = file_url.split(f"/{bucket_name}/")[-1]

    s3_client = boto3.client(
        's3',
        endpoint_url=os.getenv("S3_ENDPOINT_URL"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )

    response = s3_client.get_object(Bucket=bucket_name, Key=file_key)
    file_bytes = response['Body'].read()

    client = genai.Client()

    mime_type = "image/jpeg"
    file_url_lower = file_url.lower()
    if file_url_lower.endswith(".png"):
        mime_type = "image/png"
    elif file_url_lower.endswith(".pdf"):
        mime_type = "application/pdf"

    # --- PROMPT POTENZIATO ---
    prompt = (
        "Sei un contabile esperto e un revisore finanziario internazionale. "
        "Analizza attentamente questo scontrino/fattura ed estrai i dati richiesti. "
        "Regole fondamentali:\n"
        "1. Trova il nome del negozio.\n"
        "2. Estrai la data. Se non c'è, usa la data odierna.\n"
        "3. Estrai l'importo totale.\n"
        "4. Cerca attentamente simboli di valuta ($, €, £) o codici testuali (USD, EUR) per valorizzare il campo 'currency'.\n"
        "5. Analizza l'indirizzo, la città o il formato delle tasse (es. IVA, VAT) per capire il 'country' di origine dello scontrino (es. Italy, France, USA).\n"
        "Fai del tuo meglio anche se l'immagine è sfocata."
    )
    
    ai_response = await client.aio.models.generate_content(
        model='gemini-3-flash-preview',
        contents=[
            types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
            prompt
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ReceiptData,
            temperature=0.1,
        )
    )

    data = json.loads(ai_response.text)
    
    try:
        parsed_date = datetime.strptime(data["receipt_date"], "%Y-%m-%d")
    except ValueError:
        parsed_date = datetime.utcnow()
        
    data["receipt_date"] = parsed_date

    # Assicuriamoci che currency sia sempre 3 lettere maiuscole e country non sia nullo
    data["currency"] = str(data.get("currency", "USD")).upper()[:3]
    if not data.get("country"):
        data["country"] = "Unknown"

    return data