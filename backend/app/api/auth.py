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
from app.schemas.user import ForgotPasswordRequest, ResetPasswordRequest, LogoutOtherDevicesRequest, RefreshTokenRequest
from app.core.security import create_password_reset_token, verify_password_reset_token
from app.services.email import send_reset_password_email
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LogoutRequest(BaseModel):
    refresh_token: str


# Definiamo dove si trova il login
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# --- IL NOSTRO BUTTAFUORI (Aggiornato per PyJWT) ---
async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db_session)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        user_id = payload.get("sub")
        session_id = payload.get("session_id") # <-- Leggiamo il microchip!
        
        if user_id is None or session_id is None:
            raise credentials_exception
    except jwt.InvalidTokenError:
        raise credentials_exception
        
    # --- IL BLOCCO ISTANTANEO (STATEFUL) ---
    # Controlliamo nel DB se questa SPECIFICA sessione è ancora viva
    session = await db.get(UserSession, session_id)
    if not session or not session.is_active:
        raise credentials_exception
        
    # Se la sessione è viva, recuperiamo l'utente
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
    await db.refresh(new_session) # IMPORTANTE: Serve per far generare l'ID al database!
    
    # Passiamo il session_id appena nato!
    access_token = create_access_token(subject=user.id, session_id=new_session.id)
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

@router.post("/forgot-password")
@limiter.limit("3/minute") # Massimo 3 richieste al minuto per IP
async def forgot_password(
    request: Request, 
    request_data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db_session)
):
    # 1. Cerchiamo l'utente
    query = select(User).where(User.email == request_data.email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    # 2. Se l'utente esiste, generiamo il token e inviamo l'email
    if user:
        reset_token = create_password_reset_token(email=user.email)
        # Eseguiamo l'invio dell'email in modo sincrono (o con BackgroundTasks in futuro)
        send_reset_password_email(to_email=user.email, token=reset_token)
        
    # 3. Rispondiamo SEMPRE con successo per sicurezza (Anti-Enumeration)
    return {"message": "If that email is in our database, we've sent a password reset link."}

@router.post("/reset-password")
@limiter.limit("5/minute") # Massimo 5 tentativi di reset al minuto
async def reset_password(
    request: Request,
    request_data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db_session)
):
    # 1. Verifichiamo il token
    email = verify_password_reset_token(request_data.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
        
    # 2. Troviamo l'utente
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # 3. Aggiorniamo la password!
    user.hashed_password = get_password_hash(request_data.new_password)
    
    # 4. Spegniamo TUTTE le sessioni attive (sicurezza: se perdi la password, buttiamo fuori i dispositivi)
    session_query = select(UserSession).where((UserSession.user_id == user.id) & (UserSession.is_active == True))
    active_sessions = (await db.execute(session_query)).scalars().all()
    for session in active_sessions:
        session.is_active = False
        
    await db.commit()
    
    return {"message": "Password successfully reset. All devices have been logged out."}

@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Restituisce i dati dell'utente attualmente loggato."""
    return current_user

@router.post("/logout-other-devices")
async def logout_other_devices(
    data: LogoutOtherDevicesRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Scollega tutti i dispositivi dell'utente tranne quello attuale.
    """
    # 1. Cerchiamo tutte le sessioni attive di questo utente
    query = select(UserSession).where(
        (UserSession.user_id == current_user.id) & 
        (UserSession.is_active == True)
    )
    result = await db.execute(query)
    active_sessions = result.scalars().all()
    
    devices_logged_out = 0
    
    # 2. Le spegniamo tutte, tranne quella che corrisponde al token corrente
    for session in active_sessions:
        if session.refresh_token != data.refresh_token:
            session.is_active = False
            devices_logged_out += 1
            
    await db.commit()
    
    return {
        "message": "Other devices successfully logged out.",
        "devices_logged_out": devices_logged_out
    }

@router.post("/refresh")
async def refresh_access_token(
    data: RefreshTokenRequest, 
    db: AsyncSession = Depends(get_db_session)
):
    # 1. Cerchiamo la sessione nel DB usando il refresh_token
    query = select(UserSession).where(UserSession.refresh_token == data.refresh_token)
    result = await db.execute(query)
    session = result.scalar_one_or_none()
    
    # 2. IL MOMENTO DELLA VERITA': La sessione esiste ed è attiva?
    if not session or not session.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired, revoked, or invalid"
        )
        
    # 3. La sessione è valida (non è stata killata dall'altro PC), diamo un nuovo token!
    # Nota: Assicurati di passare l'identificativo corretto (es. str(session.user_id))
    new_access_token = create_access_token(subject=session.user_id, session_id=session.id)
    
    return {"access_token": new_access_token, "token_type": "bearer"}