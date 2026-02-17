from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, receipts
# --- 1. Importa lo scudo e il gestore errori ---
from app.core.limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

app = FastAPI(title="SpendScope API")

# --- 2. Attacca lo scudo all'app ---
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