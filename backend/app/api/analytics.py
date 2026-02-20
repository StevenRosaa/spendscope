from fastapi import APIRouter, Depends, Query
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from datetime import date
from pydantic import BaseModel
from typing import List

# Importiamo la TUA sessione e i TUOI modelli
from app.db.database import get_db_session
from app.db.models import Receipt, User

# NOTA: Assumo che tu abbia una funzione per ottenere l'utente corrente dal token.
# Se si trova da un'altra parte, correggi questo import (es. from app.core.security import get_current_user)
# from app.api.deps import get_current_user 

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

# --- 1. Schemi di Risposta ---
class ChartDataPoint(BaseModel):
    label: str
    value: float

class CategoryDataPoint(ChartDataPoint):
    percentage: float

class AnalyticsResponse(BaseModel):
    total_spent: float
    spending_over_time: List[ChartDataPoint]
    top_categories: List[CategoryDataPoint]

# --- 2. Endpoint ---
@router.get("/", response_model=AnalyticsResponse)
async def get_analytics(
    start_date: date = Query(..., description="Inizio del range (YYYY-MM-DD)"),
    end_date: date = Query(..., description="Fine del range (YYYY-MM-DD)"),
    session: AsyncSession = Depends(get_db_session),
    # current_user: User = Depends(get_current_user) # Scommenta quando hai la dipendenza di auth!
):
    # TEMPORANEO: finché non scommenti get_current_user, simuliamo l'utente 1
    # Quando sblocchi auth, usa: user_id = current_user.id
    user_id = 1 

    # Filtri base per SQLModel
    # NOTA SUI NOMI DEI CAMPI: 
    # Sto assumendo che il tuo modello Receipt abbia i campi: `date`, `total` e `category`.
    # Se il totale si chiama in un altro modo (es. `amount` o `total_amount`), cambialo qui sotto.
    base_filters = [
        Receipt.user_id == user_id,
        func.date(Receipt.date) >= start_date,
        func.date(Receipt.date) <= end_date
    ]

    # --- Query 1: Totale Speso ---
    total_query = select(func.sum(Receipt.total)).where(*base_filters)
    result_total = await session.execute(total_query)
    total_spent = result_total.scalar() or 0.0

    # --- Query 2: Andamento nel tempo (BarChart) ---
    time_query = (
        select(
            func.date(Receipt.date).label("day"),
            func.sum(Receipt.total).label("daily_total")
        )
        .where(*base_filters)
        .group_by(func.date(Receipt.date))
        .order_by("day")
    )
    result_time = await session.execute(time_query)
    time_results = result_time.all()
    
    spending_over_time = [
        ChartDataPoint(label=str(row.day), value=float(row.daily_total))
        for row in time_results
    ]

    # --- Query 3: Categorie Top ---
    cat_query = (
        select(
            Receipt.category,
            func.sum(Receipt.total).label("cat_total")
        )
        .where(*base_filters)
        .group_by(Receipt.category)
        .order_by(func.sum(Receipt.total).desc())
        .limit(5)
    )
    result_cat = await session.execute(cat_query)
    cat_results = result_cat.all()

    top_categories = []
    for row in cat_results:
        cat_total = float(row.cat_total)
        perc = (cat_total / float(total_spent) * 100) if total_spent > 0 else 0
        top_categories.append(
            CategoryDataPoint(
                label=row.category or "Uncategorized", 
                value=cat_total, 
                percentage=round(perc, 1)
            )
        )

    return AnalyticsResponse(
        total_spent=round(float(total_spent), 2),
        spending_over_time=spending_over_time,
        top_categories=top_categories
    )