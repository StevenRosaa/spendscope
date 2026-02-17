from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None  # Ora il frontend può inviare il nome

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    """Schema for the login response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"