from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
import os
import jwt
from pydantic import BaseModel
from app.db.database import get_db_session
from app.db.models import User, UserSession
from app.schemas.user import UserCreate, UserResponse, TokenResponse
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.core.limiter import limiter

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LogoutRequest(BaseModel):
    refresh_token: str


# Definiamo dove si trova il login
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# --- IL NOSTRO BUTTAFUORI (Aggiornato per PyJWT) ---
async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db_session)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decodifichiamo usando PyJWT
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        
        # Estraiamo l'ID utente (nel tuo security.py dovresti averlo salvato come "sub")
        user_id = payload.get("sub")
        
        if user_id is None:
            raise credentials_exception
            
    except jwt.InvalidTokenError: # <-- Eccezione nativa di PyJWT!
        raise credentials_exception
        
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
        
    return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute") # Massimo 3 registrazioni al minuto per IP (Anti-Bot)
async def register_user(
    request: Request, # <-- Richiesto da SlowAPI
    user_data: UserCreate, 
    db: AsyncSession = Depends(get_db_session)
):
    query = select(User).where(User.email == user_data.email)
    result = await db.execute(query)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        email=user_data.email,
        full_name=user_data.full_name, # Salviamo il nome!
        hashed_password=get_password_hash(user_data.password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute") # Massimo 5 tentativi di login al minuto per IP (Anti Brute-Force)
async def login_user(
    request: Request, # <-- Ci serve per l'IP e il Browser!
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db_session)
):
    query = select(User).where(User.email == form_data.username)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    
    # --- TRACCIAMENTO DEL DISPOSITIVO (ENTERPRISE FEATURE) ---
    # Catturiamo l'IP e il tipo di browser/dispositivo (User-Agent) dall'header della richiesta HTTP
    client_ip = request.client.host if request.client else "Unknown"
    user_agent = request.headers.get("user-agent", "Unknown Device")

    new_session = UserSession(
        user_id=user.id,
        refresh_token=refresh_token,
        ip_address=client_ip,
        user_agent=user_agent
    )
    db.add(new_session)
    await db.commit()
    # ---------------------------------------------------------

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

@router.post("/logout")
async def logout_user(
    logout_req: LogoutRequest, # <-- Ora chiediamo il token specifico!
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db_session)
):
    """Spegne SOLO la sessione del dispositivo corrente."""
    # Cerchiamo esattamente la sessione legata a questo refresh_token
    query = select(UserSession).where(
        (UserSession.user_id == current_user.id) & 
        (UserSession.refresh_token == logout_req.refresh_token) &
        (UserSession.is_active == True)
    )
    result = await db.execute(query)
    session = result.scalar_one_or_none()
    
    # Se la troviamo, spegniamo SOLO quella
    if session:
        session.is_active = False
        await db.commit()
        
    return {"message": "Successfully logged out from this device"}