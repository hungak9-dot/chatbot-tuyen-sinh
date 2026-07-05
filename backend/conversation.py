import json
from sqlalchemy.orm import Session
from database import ChatSession, Message
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


def get_or_create_session(db: Session, session_id: str = None) -> ChatSession:
    if session_id:
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if session:
            return session
    session = ChatSession()
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_session_history(db: Session, session_id: str, limit: int = 20) -> list:
    messages = (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.created_at)
        .limit(limit)
        .all()
    )
    return [
        {
            "role": m.role,
            "content": m.content,
            "sources": json.loads(m.sources) if m.sources else [],
            "created_at": m.created_at.isoformat(),
            "id": m.id,
        }
        for m in messages
    ]


def save_message(
    db: Session,
    session_id: str,
    role: str,
    content: str,
    sources: list = None,
) -> Message:
    message = Message(
        session_id=session_id,
        role=role,
        content=content,
        sources=json.dumps(sources or [], ensure_ascii=False),
        created_at=datetime.utcnow(),
    )
    db.add(message)

    # Auto-title session from first user message
    if role == "user":
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if session and session.title == "Cuộc trò chuyện mới":
            session.title = content[:60] + ("..." if len(content) > 60 else "")
        if session:
            session.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(message)
    return message
