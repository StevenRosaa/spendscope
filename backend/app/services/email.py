# app/services/email.py
import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

# Forziamo il caricamento del file .env per essere sicuri al 100%
load_dotenv()

def send_reset_password_email(to_email: str, token: str):
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    reset_link = f"{frontend_url}/reset-password?token={token}"
    
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = os.getenv("SMTP_PORT", 465) # Aruba usa la 465
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    # MOCK MODE
    if not smtp_server or not smtp_user:
        print("\n" + "="*50)
        print("📧 MOCK EMAIL INTERCEPTED! (Le variabili .env non sono state caricate)")
        print(f"To: {to_email}")
        print("Subject: Reset your SpendScope Password")
        print(f"Click here to reset: {reset_link}")
        print("="*50 + "\n")
        return

    # REAL MODE: Invia una vera email con Aruba (SSL Puro)
    msg = EmailMessage()
    msg['Subject'] = "Reset your SpendScope Password"
    msg['From'] = f"SpendScope <{smtp_user}>" # Fa comparire il nome "SpendScope"
    msg['To'] = to_email
    
    msg.set_content(f"""
Hi there,

You requested to reset your password for SpendScope.
Click the link below to choose a new password. This link will expire in 15 minutes.

{reset_link}

If you did not request this, please ignore this email.
    """)

    try:
        print("⏳ Sto contattando il server Aruba...")
        # Usiamo SMTP_SSL per la porta 465!
        with smtplib.SMTP_SSL(smtp_server, int(smtp_port)) as server:
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        print("✅ Email inviata con successo tramite Aruba!")
    except Exception as e:
        print(f"❌ Failed to send email via Aruba: {e}")