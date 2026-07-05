from sqlalchemy import create_engine, Column, String, Integer, DateTime, Text, event
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid

from config import get_settings

settings = get_settings()
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class ChatSession(Base):
    __tablename__ = "sessions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, default="Cuộc trò chuyện mới")
    user_name = Column(String, default="Khách")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, nullable=False)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    sources = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)


class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    category = Column(String, default="general")
    chunk_count = Column(Integer, default=0)
    status = Column(String, default="processing")
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    file_size = Column(Integer, default=0)


def create_tables():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
