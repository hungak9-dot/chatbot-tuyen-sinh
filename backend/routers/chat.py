from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from pydantic import BaseModel
from typing import Optional, List

from database import get_db, ChatSession, Message
from conversation import get_or_create_session, get_session_history, save_message
from rag_pipeline import generate_response
from admission_predictor import predict_admission, career_orientation

router = APIRouter(prefix="/api", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    lang: str = "vi"


class NewSessionRequest(BaseModel):
    user_name: Optional[str] = "Khách"


@router.post("/chat")
async def chat(request: ChatRequest, db: DBSession = Depends(get_db)):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Tin nhắn không được để trống")

    session = get_or_create_session(db, request.session_id)

    history = get_session_history(db, session.id, limit=20)
    history_for_llm = [{"role": m["role"], "content": m["content"]} for m in history]

    save_message(db, session.id, "user", request.message)

    try:
        response_text, sources = generate_response(request.message, history_for_llm, lang=request.lang)
    except Exception as e:
        error_msg = str(e).lower()
        if "429" in error_msg or "quota" in error_msg or "exhausted" in error_msg:
            friendly_msg = "Hệ thống đang phục vụ quá nhiều yêu cầu cùng lúc nên AI cần nghỉ vài giây. Bạn vui lòng đợi 15 giây rồi gửi lại câu hỏi nhé!"
            raise HTTPException(status_code=429, detail=friendly_msg)
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý AI: {str(e)}")

    save_message(db, session.id, "assistant", response_text, sources)

    return {
        "session_id": session.id,
        "message": response_text,
        "sources": sources,
    }





@router.get("/sessions")
def get_sessions(db: DBSession = Depends(get_db)):
    sessions = (
        db.query(ChatSession)
        .order_by(ChatSession.updated_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": s.id,
            "title": s.title,
            "user_name": s.user_name,
            "created_at": s.created_at.isoformat(),
            "updated_at": (s.updated_at or s.created_at).isoformat(),
        }
        for s in sessions
    ]


@router.post("/sessions")
def create_session(request: NewSessionRequest, db: DBSession = Depends(get_db)):
    session = get_or_create_session(db)
    session.user_name = request.user_name
    db.commit()
    return {"id": session.id, "title": session.title, "user_name": session.user_name}


@router.get("/sessions/{session_id}/messages")
def get_messages(session_id: str, db: DBSession = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Phiên không tồn tại")
    return get_session_history(db, session_id)


@router.delete("/sessions/{session_id}")
def delete_session(session_id: str, db: DBSession = Depends(get_db)):
    db.query(Message).filter(Message.session_id == session_id).delete()
    result = db.query(ChatSession).filter(ChatSession.id == session_id).delete()
    db.commit()
    if not result:
        raise HTTPException(status_code=404, detail="Phiên không tồn tại")
    return {"message": "Đã xóa phiên trò chuyện"}


# =====================================================
# Tính năng đặc biệt: Dự đoán & Định hướng
# =====================================================

class PredictRequest(BaseModel):
    score: float
    method: str = "A00"
    major: str


class OrientRequest(BaseModel):
    interests: List[str] = []
    personality: List[str] = []
    budget: Optional[float] = None
    strengths: List[str] = []


@router.post("/predict")
async def predict_endpoint(request: PredictRequest):
    """Dự đoán tỷ lệ đậu ngành."""
    try:
        result = predict_admission(request.score, request.method, request.major)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi dự đoán: {str(e)}")


@router.post("/orient")
async def orient_endpoint(request: OrientRequest):
    """Gợi ý ngành học phù hợp."""
    try:
        result = career_orientation(
            interests=request.interests,
            personality=request.personality,
            budget=request.budget,
            strengths=request.strengths,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi định hướng: {str(e)}")

