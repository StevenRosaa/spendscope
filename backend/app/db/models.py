from datetime import datetime
from typing import List, Optional
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship

# --- ENUMS ---

class ReceiptStatus(str, Enum):
    """Tracks the background processing status of the receipt."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ExpenseCategory(str, Enum):
    """Standard categories for AI classification."""
    FOOD_AND_GROCERIES = "food_and_groceries"
    TRANSPORTATION = "transportation"
    UTILITIES = "utilities"
    ENTERTAINMENT = "entertainment"
    HEALTHCARE = "healthcare"
    OTHER = "other"

# --- MODELS ---

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    full_name: Optional[str] = None  # <-- NUOVO CAMPO!
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relazioni
    receipts: List["Receipt"] = Relationship(back_populates="user")
    sessions: List["UserSession"] = Relationship(back_populates="user")

class UserSession(SQLModel, table=True):
    __tablename__ = "user_sessions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    refresh_token: str = Field(index=True)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None  # Salverà se è un iPhone, un PC Windows, ecc.
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relazione verso l'utente
    user: Optional["User"] = Relationship(back_populates="sessions")

class Receipt(SQLModel, table=True):
    __tablename__ = "receipts"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    
    # Extracted metadata
    store_name: Optional[str] = Field(default=None)
    receipt_date: Optional[datetime] = Field(default=None)
    total_amount: float = Field(default=0.0)
    
    # --- NUOVI CAMPI MULTI-VALUTA E GEOLOCALIZZAZIONE ---
    currency: str = Field(default="USD") # Codice ISO (es: USD, EUR, GBP)
    country: Optional[str] = Field(default=None) # Es: Italy, United Kingdom, USA
    
    # Cloud Storage reference
    file_url: str = Field(nullable=False) 
    
    status: ReceiptStatus = Field(default=ReceiptStatus.PENDING)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: User = Relationship(back_populates="receipts")
    items: List["ExpenseItem"] = Relationship(
        back_populates="receipt", 
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

class ExpenseItem(SQLModel, table=True):
    __tablename__ = "expense_items"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    receipt_id: int = Field(foreign_key="receipts.id", nullable=False)
    
    description: str = Field(nullable=False)
    amount: float = Field(nullable=False)
    category: ExpenseCategory = Field(default=ExpenseCategory.OTHER)
    
    # Relationships
    receipt: Receipt = Relationship(back_populates="items")