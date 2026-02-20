from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from sqlalchemy.orm import selectinload # <-- NUOVO: Serve per caricare gli item degli scontrini
from pydantic import BaseModel
from typing import List, Optional
from google import genai
from google.genai import types
import uuid

from app.api.auth import get_current_user
from app.db.database import get_db_session
from app.db.models import User, Receipt, ChatSession, ChatMessage

router = APIRouter(prefix="/ai", tags=["AI Chat"])

class ChatRequest(BaseModel):
    message: str = ""
    model: str = "gemini-3-flash"
    session_id: Optional[str] = None
    use_global_memory: bool = True       # <-- ORA È SEMPRE TRUE DI DEFAULT
    tone: str = "professional"
    format: str = "text"
    regenerate: bool = False             
    edit_message_id: Optional[str] = None 

BASE_SYSTEM_PROMPT = """
You are SpendScope AI, an expert financial assistant integrated directly into the user's expense tracking app.

CRITICAL RULES:
1. YOU ALREADY HAVE THE DATA: Look at the "USER RECEIPTS DATA" section below. This is the live database of the user's expenses. DO NOT ever tell the user that you don't have access to their bank or receipts.
2. IF DATA IS MISSING: If the user asks about something not present in the "USER RECEIPTS DATA", tell them: "I checked your uploaded receipts, but I don't see any expenses matching that description."
3. BOUNDARIES: ONLY answer questions related to their expenses, finance, accounting, and budgeting based on the data provided.
4. CHAIN OF THOUGHT: Before writing your final answer, you MUST write down your internal reasoning process inside <thinking>...</thinking> XML tags. Use this space to plan your answer, calculate totals, and analyze the user's data. After closing the </thinking> tag, write your final user-facing response.

USER PREFERENCES:
- Persona/Tone: {tone_instruction}
- Output Format: {format_instruction}

---
USER RECEIPTS DATA:
{user_data}

---
PREVIOUS CHAT CONTEXT (Global Memory):
{global_memory}
"""

@router.get("/sessions")
async def get_sessions(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db_session)):
    query = select(ChatSession).where(ChatSession.user_id == current_user.id).order_by(ChatSession.updated_at.desc())
    result = await db.execute(query)
    sessions = result.scalars().all()
    return [{"id": s.id, "title": s.title, "created_at": s.created_at.isoformat()} for s in sessions]

@router.get("/sessions/{session_id}")
async def get_session_messages(session_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db_session)):
    query = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc())
    result = await db.execute(query)
    messages = result.scalars().all()
    return [{"id": m.id, "role": "user" if m.role == "user" else "assistant", "content": m.content} for m in messages]

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db_session)):
    query = select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
    result = await db.execute(query)
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    await db.delete(session)
    await db.commit()
    return {"success": True}

@router.post("/chat")
async def ai_chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    try:
        session_id = request.session_id
        if not session_id:
            session_id = str(uuid.uuid4())
            title = request.message[:20] + "..." if len(request.message) > 20 else request.message
            new_session = ChatSession(id=session_id, user_id=current_user.id, title=title)
            db.add(new_session)
            await db.commit()

        # --- 1. LOGICA DI MODIFICA (EDIT) ---
        if request.edit_message_id:
            msg_query = select(ChatMessage).where(ChatMessage.id == request.edit_message_id, ChatMessage.session_id == session_id)
            msg_result = await db.execute(msg_query)
            target_msg = msg_result.scalar_one_or_none()
            if target_msg:
                # Aggiorniamo il testo del messaggio ESISTENTE
                target_msg.content = request.message
                # Cancelliamo solo la vecchia risposta dell'IA (quella successiva a questo messaggio)
                del_query = delete(ChatMessage).where(
                    ChatMessage.session_id == session_id, 
                    ChatMessage.created_at > target_msg.created_at # Nota: Usa il simbolo Maggiore (>)
                )
                await db.execute(del_query)
                await db.commit()

        # --- 2. LOGICA DI RIGENERAZIONE ---
        elif request.regenerate: # Nota: Aggiunto 'elif'
            last_msg_query = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.desc()).limit(1)
            last_msg_result = await db.execute(last_msg_query)
            last_msg = last_msg_result.scalar_one_or_none()
            
            if last_msg and last_msg.role == "model":
                await db.delete(last_msg)
                await db.commit()
                
            new_last_query = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.desc()).limit(1)
            new_last_result = await db.execute(new_last_query)
            user_msg_record = new_last_result.scalar_one_or_none()
            if user_msg_record:
                request.message = user_msg_record.content

        # --- 3. NUOVO MESSAGGIO NORMALE ---
        else:
            # Creiamo un nuovo messaggio SOLO se non stiamo modificando né rigenerando
            user_msg = ChatMessage(id=str(uuid.uuid4()), session_id=session_id, role="user", content=request.message)
            db.add(user_msg)
            await db.commit()

        # --- CARICHIAMO SCONTRINI E GLI OGGETTI COMPRATI (ITEMS) ---
        receipts_query = select(Receipt).options(selectinload(Receipt.items)).where(Receipt.user_id == current_user.id)
        result = await db.execute(receipts_query)
        receipts = result.scalars().all()
        
        user_data_string = ""
        if not receipts:
            user_data_string = "No receipts uploaded yet."
        else:
            for r in receipts:
                date_str = r.receipt_date.strftime("%Y-%m-%d") if r.receipt_date else "Unknown Date"
                # Estraiamo anche la lista dei prodotti
                items_str = ", ".join([f"{item.description} ({item.amount}{r.currency})" for item in r.items]) if r.items else "No specific items detailed"
                user_data_string += f"- Date: {date_str} | Store: {r.store_name} | Total: {r.total_amount} {r.currency} | Items bought: {items_str}\n"

        global_memory_string = "No global memory requested."
        if request.use_global_memory:
            mem_query = select(ChatMessage).where(
                ChatMessage.session_id != session_id,
                ChatMessage.session.has(user_id=current_user.id)
            ).order_by(ChatMessage.created_at.desc()).limit(10)
            mem_result = await db.execute(mem_query)
            old_messages = mem_result.scalars().all()
            if old_messages:
                old_messages.reverse()
                global_memory_string = "\n".join([f"{m.role.upper()}: {m.content}" for m in old_messages])
            else:
                global_memory_string = "No previous conversations found."

        tone_map = {
            "professional": "Act as a strict, objective, and highly professional accountant. Focus strictly on numbers and facts.",
            "friendly": "Act as a friendly, encouraging financial advisor. Use simple terms and occasionally use emojis.",
            "roast": "Act as a brutally honest and sarcastic financial critic. Lightly mock bad spending habits, but provide accurate data."
        }
        format_map = {
            "text": "Answer using natural, conversational paragraphs.",
            "bullet": "Always structure your answer using concise bullet points for maximum readability.",
            "table": "Whenever comparing numbers, categories, or dates, format your output as a Markdown table."
        }

        dynamic_system_prompt = BASE_SYSTEM_PROMPT.format(
            user_data=user_data_string, 
            global_memory=global_memory_string,
            tone_instruction=tone_map.get(request.tone, tone_map["professional"]),
            format_instruction=format_map.get(request.format, format_map["text"])
        )

        chat_history_query = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc())
        history_result = await db.execute(chat_history_query)
        history_msgs = history_result.scalars().all()

        client = genai.Client()
        target_model = 'gemini-3-pro-preview' if request.model == 'gemini-3-pro' else 'gemini-3-flash-preview'
        
        history = [
            types.Content(role=m.role, parts=[types.Part.from_text(text=m.content)]) 
            for m in history_msgs[:-1]
        ]

        chat = client.chats.create(
            model=target_model,
            history=history,
            config=types.GenerateContentConfig(
                system_instruction=dynamic_system_prompt,
                temperature=0.3,
            )
        )
        
        response = chat.send_message(request.message)
        
        ai_msg = ChatMessage(id=str(uuid.uuid4()), session_id=session_id, role="model", content=response.text)
        db.add(ai_msg)
        await db.commit()
        
        return {
            "reply": response.text, 
            "session_id": session_id,
            "title": request.message[:20] + "..." if len(request.message) > 20 else request.message
        }

    except Exception as e:
        await db.rollback()
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect to SpendScope AI.")