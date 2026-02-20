from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

# Importiamo l'engine e TUTTI i modelli affinché SQLModel li "veda" prima di creare le tabelle
from app.db.database import engine
from app.db.models import User, Receipt, UserSession, ExpenseItem, ChatSession, ChatMessage

from app.api import auth, receipts, chat, analytics
# --- 1. Importa lo scudo e il gestore errori ---
from app.core.limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# --- 2. Definiamo l'evento di avvio (Lifespan) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Eseguito all'avvio del server:
    print("⏳ Controllo e creazione tabelle mancanti nel database...")
    async with engine.begin() as conn:
        # run_sync serve per eseguire il comando sincrono 'create_all' in un contesto asincrono
        await conn.run_sync(SQLModel.metadata.create_all)
    print("✅ Database pronto!")
    
    yield # Il server ora è in esecuzione e accetta richieste
    
    # (Codice opzionale qui verrà eseguito allo spegnimento del server)

# Passiamo il lifespan a FastAPI
app = FastAPI(title="SpendScope API", lifespan=lifespan)

# --- 3. Attacca lo scudo all'app ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(receipts.router)
app.include_router(chat.router)
app.include_router(analytics.router)