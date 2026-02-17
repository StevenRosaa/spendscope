import os
from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext

# Retrieve from environment variables in production!
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-for-local-dev")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the hashed version."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashes a plain text password."""
    return pwd_context.hash(password)

def create_access_token(subject: str | int, session_id: int | None = None) -> str:
    # Usiamo 30 minuti di default (ora non ci importa più, il blocco è istantaneo)
    expire_mins = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    expire = datetime.utcnow() + timedelta(minutes=expire_mins)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    
    # Inseriamo l'ID della sessione come "microchip" nel token
    if session_id:
        to_encode["session_id"] = session_id
        
    return jwt.encode(to_encode, os.getenv("SECRET_KEY"), algorithm="HS256")

def create_refresh_token(subject: str | int) -> str:
    """Generates a long-lived JWT refresh token."""
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_password_reset_token(email: str) -> str:
    """Crea un token valido solo per 15 minuti per il reset della password."""
    expire = datetime.utcnow() + timedelta(minutes=15)
    # Aggiungiamo un "type" per distinguerlo dai normali token di login
    to_encode = {"exp": expire, "sub": email, "type": "reset"}
    
    encoded_jwt = jwt.encode(to_encode, os.getenv("SECRET_KEY"), algorithm="HS256")
    return encoded_jwt

def verify_password_reset_token(token: str) -> str | None:
    """Verifica il token e restituisce l'email se è valido."""
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        if payload.get("type") != "reset":
            return None
        return payload.get("sub")
    except jwt.InvalidTokenError:
        return None