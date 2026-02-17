# app/core/limiter.py
from slowapi import Limiter
from slowapi.util import get_remote_address

# Questo limiter usa l'indirizzo IP dell'utente per contare le sue richieste
limiter = Limiter(key_func=get_remote_address)