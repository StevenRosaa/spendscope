from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from sqlalchemy.orm import selectinload
from app.db.database import get_db_session
from app.db.models import Receipt, ReceiptStatus, ExpenseItem
from app.core.storage import upload_file_to_s3
from app.services.ocr import process_receipt_image
import boto3
from botocore.client import Config
import os
from fastapi import HTTPException
from app.api.auth import get_current_user # Importiamo il buttafuori
from app.db.models import User
import csv
import io
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/receipts", tags=["Receipts"])

async def extract_and_save_data(receipt_id: int, file_url: str, db: AsyncSession):
    """
    Background task: Runs the OCR processing and updates the database.
    This runs after the HTTP response has been sent to the user.
    """
    try:
        # 1. Run the OCR extraction
        extracted_data = await process_receipt_image(file_url)
        
        # 2. Fetch the pending receipt from the database
        receipt = await db.get(Receipt, receipt_id)
        if not receipt:
            return # Receipt was deleted before processing finished
        
        # 3. Update metadata and change status to COMPLETED
        receipt.store_name = extracted_data["store_name"]
        receipt.receipt_date = extracted_data["receipt_date"]
        receipt.total_amount = extracted_data["total_amount"]
        receipt.status = ReceiptStatus.COMPLETED
        
        # 4. Create and attach the individual expense items
        for item_data in extracted_data["items"]:
            expense_item = ExpenseItem(
                receipt_id=receipt.id,
                description=item_data["description"],
                amount=item_data["amount"],
                category=item_data["category"]
            )
            db.add(expense_item)
            
        await db.commit()
        
    except Exception as e:
        # In case of failure (e.g., OCR API is down), mark as FAILED
        receipt = await db.get(Receipt, receipt_id)
        if receipt:
            receipt.status = ReceiptStatus.FAILED
            await db.commit()
        print(f"Error processing receipt {receipt_id}: {e}")


@router.post("/upload", status_code=status.HTTP_202_ACCEPTED)
async def upload_receipt(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db_session)
    # Note: In reality, we'd inject the current_user here via Auth dependency
):
    """
    Uploads a receipt image, saves initial DB record, and starts background processing.
    """
    # Basic validation
    if not file.content_type.startswith(("image/", "application/pdf")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid file type. Only images and PDFs are allowed."
        )
    
    # HARDCODED for this example (Replace with current_user.id)
    user_id = 1 
    
    # 1. Upload the physical file to S3
    file_url = await upload_file_to_s3(file, user_id)
    
    # 2. Create the initial database record with PENDING status
    new_receipt = Receipt(
        user_id=user_id,
        file_url=file_url,
        status=ReceiptStatus.PENDING
    )
    db.add(new_receipt)
    await db.commit()
    await db.refresh(new_receipt)
    
    # 3. Hand off the heavy lifting to the background task
    background_tasks.add_task(extract_and_save_data, new_receipt.id, file_url, db)
    
    # 4. Return immediately! 
    return {
        "message": "Receipt uploaded successfully. Processing started.",
        "receipt_id": new_receipt.id,
        "status": new_receipt.status
    }

@router.get("")
async def get_all_receipts(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user) # <-- ECCO LA MAGIA!
):
    # PRENDIAMO SOLO GLI SCONTRINI DELL'UTENTE AUTENTICATO! Addio user_id = 1!
    query = (
        select(Receipt)
        .where(Receipt.user_id == current_user.id) 
        .options(selectinload(Receipt.items))
        .order_by(Receipt.created_at.desc())
    )
    result = await db.execute(query)
    receipts = result.scalars().all()
    
    return [
        {**r.model_dump(), "items": [i.model_dump() for i in r.items]}
        for r in receipts
    ]

@router.get("/{receipt_id}/download")
async def get_receipt_download_url(receipt_id: int, db: AsyncSession = Depends(get_db_session)):
    """Genera un link temporaneo Cloudflare R2 (S3v4) per visualizzare l'immagine originale."""
    receipt = await db.get(Receipt, receipt_id)
    if not receipt:
        raise HTTPException(status_code=404, detail="Scontrino non trovato")

    bucket_name = os.getenv("S3_BUCKET_NAME")
    file_key = receipt.file_url.split(f"/{bucket_name}/")[-1]

    # Configurazione speciale per Cloudflare R2 per evitare l'errore XML!
    s3_client = boto3.client(
        's3',
        endpoint_url=os.getenv("S3_ENDPOINT_URL"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name="auto", # Richiesto da R2
        config=Config(signature_version='s3v4') # Fondamentale per l'errore XML
    )

    presigned_url = s3_client.generate_presigned_url(
        'get_object',
        Params={'Bucket': bucket_name, 'Key': file_key},
        ExpiresIn=3600 # 1 Ora
    )
    
    return {"url": presigned_url}

@router.get("/export")
async def export_receipts_csv(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Genera e scarica un file CSV con tutti gli scontrini dell'utente."""
    
    # 1. Usiamo receipt_date per ordinare!
    query = select(Receipt).where(Receipt.user_id == current_user.id).order_by(Receipt.receipt_date.desc())
    result = await db.execute(query)
    receipts = result.scalars().all()

    stream = io.StringIO()
    writer = csv.writer(stream)

    # 2. Aggiorniamo le intestazioni per il file Excel
    writer.writerow(["ID", "Store Name", "Date", "Total Amount", "Status", "Uploaded At"])

    # 3. Usiamo le proprietà ESATTE del tuo database
    for r in receipts:
        writer.writerow([
            r.id,
            r.store_name or "N/A",
            r.receipt_date.strftime("%Y-%m-%d") if r.receipt_date else "N/A",
            f"{r.total_amount:.2f}" if r.total_amount else "0.00",
            r.status or "N/A", # Usiamo status dato che category non esiste nello schema
            r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else "N/A"
        ])

    stream.seek(0)

    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=spendscope_export.csv"
    
    return response