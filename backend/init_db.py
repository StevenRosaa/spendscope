# backend/init_db.py
import asyncio
from app.db.database import engine
from app.db.models import SQLModel
# Importiamo esplicitamente i modelli così SQLModel li "vede"
from app.db.models import User, Receipt, ExpenseItem 

async def create_tables():
    print("Connessione al database Neon in corso...")
    async with engine.begin() as conn:
        # Questo comando legge le classi SQLModel e crea le tabelle nel DB
        await conn.run_sync(SQLModel.metadata.create_all)
    print("Tabelle create con successo! 🎉")

if __name__ == "__main__":
    asyncio.run(create_tables())