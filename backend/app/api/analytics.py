import io
import csv
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func

from app.db.database import get_db_session
from app.db.models import ExpenseItem, Receipt, ReceiptStatus

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary")
async def get_expense_summary(db: AsyncSession = Depends(get_db_session)):
    """
    Returns total expenses grouped by category.
    Ideal for populating a pie chart in the frontend dashboard.
    """
    # HARDCODED for this example (Replace with current_user.id from Auth)
    user_id = 1 
    
    # Query: SELECT category, SUM(amount) FROM expense_items 
    # JOIN receipts ON ... WHERE user_id = 1 AND status = 'completed' GROUP BY category
    query = (
        select(ExpenseItem.category, func.sum(ExpenseItem.amount).label("total_spent"))
        .join(Receipt)
        .where(Receipt.user_id == user_id)
        .where(Receipt.status == ReceiptStatus.COMPLETED)
        .group_by(ExpenseItem.category)
    )
    
    result = await db.execute(query)
    
    # Format the result into a clean dictionary or list of objects
    summary = [{"category": row[0], "total": float(row[1])} for row in result.all()]
    
    return {"data": summary}


@router.get("/export/csv")
async def export_expenses_csv(db: AsyncSession = Depends(get_db_session)):
    """
    Generates a CSV file of all expense items on the fly and streams it to the user.
    """
    user_id = 1 
    
    # Fetch all items linked to the user's completed receipts
    query = (
        select(Receipt.store_name, Receipt.receipt_date, ExpenseItem.description, ExpenseItem.category, ExpenseItem.amount)
        .join(ExpenseItem)
        .where(Receipt.user_id == user_id)
        .where(Receipt.status == ReceiptStatus.COMPLETED)
        .order_by(Receipt.receipt_date.desc())
    )
    
    result = await db.execute(query)
    rows = result.all()
    
    # Create an in-memory string buffer
    stream = io.StringIO()
    csv_writer = csv.writer(stream)
    
    # Write CSV Header
    csv_writer.writerow(["Store Name", "Date", "Item Description", "Category", "Amount ($)"])
    
    # Write data rows
    for row in rows:
        store_name, receipt_date, description, category, amount = row
        # Format date nicely if it exists
        date_str = receipt_date.strftime("%Y-%m-%d") if receipt_date else "N/A"
        csv_writer.writerow([store_name, date_str, description, category, f"{amount:.2f}"])
        
    # Reset stream cursor to the beginning before sending
    stream.seek(0)
    
    # Stream the response directly to the client browser
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=spendscope_report.csv"
    
    return response