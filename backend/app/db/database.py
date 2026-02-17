import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel.ext.asyncio.session import AsyncSession
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Example: postgresql+asyncpg://user:password@localhost:5432/receipt_radar
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Create the async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,      # Controlla se la connessione è viva prima di usarla
    pool_recycle=300,        # Ricrea la connessione ogni 5 minuti
    pool_size=5,             # Numero di connessioni stabili
    max_overflow=10          # Connessioni extra se c'è traffico
)

async def get_db_session() -> AsyncSession:
    """
    Dependency function to yield a database session.
    To be used in FastAPI endpoints.
    """
    async_session = sessionmaker(
        bind=engine, 
        class_=AsyncSession, 
        expire_on_commit=False
    )
    async with async_session() as session:
        yield session