from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session as DBSession
from pathlib import Path
import uuid
import logging

from database import get_db, Document, ChatSession, Message
from document_processor import process_pdf
from vector_store import delete_document_chunks
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()
router = APIRouter(prefix="/api/admin", tags=["admin"])
security = HTTPBearer()

UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

CATEGORIES = {
    "general": "Tổng quát",
    "admission": "Tuyển sinh",
    "major": "Ngành học",
    "tuition": "Học phí",
    "dormitory": "Ký túc xá",
    "scholarship": "Học bổng",
}


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != settings.admin_token:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")
    return credentials.credentials


@router.get("/documents")
def get_documents(db: DBSession = Depends(get_db), _=Depends(verify_token)):
    docs = db.query(Document).order_by(Document.uploaded_at.desc()).all()
    return [
        {
            "id": d.id,
            "filename": d.original_filename,
            "category": d.category,
            "category_label": CATEGORIES.get(d.category, d.category),
            "chunk_count": d.chunk_count,
            "status": d.status,
            "uploaded_at": d.uploaded_at.isoformat(),
            "file_size": d.file_size,
        }
        for d in docs
    ]


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form(default="general"),
    db: DBSession = Depends(get_db),
    _=Depends(verify_token),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ file PDF")

    if category not in CATEGORIES:
        category = "general"

    doc_id = str(uuid.uuid4())
    safe_filename = f"{doc_id}_{file.filename}"
    file_path = UPLOAD_DIR / safe_filename

    content = await file.read()
    if len(content) > 50 * 1024 * 1024:  # 50MB limit
        raise HTTPException(status_code=400, detail="File quá lớn (tối đa 50MB)")

    with open(file_path, "wb") as f:
        f.write(content)

    doc = Document(
        id=doc_id,
        filename=safe_filename,
        original_filename=file.filename,
        category=category,
        status="processing",
        file_size=len(content),
    )
    db.add(doc)
    db.commit()

    try:
        chunk_count = process_pdf(str(file_path), doc_id, file.filename, category)
        doc.chunk_count = chunk_count
        doc.status = "ready"
        db.commit()
        logger.info(f"Document '{file.filename}' processed: {chunk_count} chunks")
    except Exception as e:
        doc.status = "error"
        db.commit()
        logger.error(f"Error processing '{file.filename}': {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý PDF: {str(e)}")

    return {
        "id": doc_id,
        "filename": file.filename,
        "chunk_count": chunk_count,
        "status": "ready",
        "category": category,
    }


@router.delete("/documents/{doc_id}")
def delete_document(
    doc_id: str,
    db: DBSession = Depends(get_db),
    _=Depends(verify_token),
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Tài liệu không tồn tại")

    deleted_count = delete_document_chunks(doc_id)

    file_path = UPLOAD_DIR / doc.filename
    if file_path.exists():
        file_path.unlink()

    db.delete(doc)
    db.commit()

    return {"message": f"Đã xóa tài liệu và {deleted_count} đoạn văn bản"}


@router.get("/stats")
def get_stats(db: DBSession = Depends(get_db), _=Depends(verify_token)):
    doc_count = db.query(Document).filter(Document.status == "ready").count()
    session_count = db.query(ChatSession).count()
    message_count = db.query(Message).count()
    total_chunks = db.query(Document).with_entities(
        Document.chunk_count
    ).all()
    chunk_sum = sum(c[0] for c in total_chunks if c[0])

    return {
        "documents": doc_count,
        "sessions": session_count,
        "messages": message_count,
        "total_chunks": chunk_sum,
    }


@router.get("/categories")
def get_categories(_=Depends(verify_token)):
    return [{"value": k, "label": v} for k, v in CATEGORIES.items()]
