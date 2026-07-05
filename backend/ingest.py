import sys
import os
import uuid
import ssl

try:
    import certifi
    ca_bundle = certifi.where()
    os.environ["SSL_CERT_FILE"] = ca_bundle
    os.environ["REQUESTS_CA_BUNDLE"] = ca_bundle
    os.environ["GRPC_DEFAULT_SSL_ROOTS_FILE_PATH"] = ca_bundle
except ImportError:
    pass

# Đảm bảo import đúng từ thư mục hiện tại (backend)
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from document_processor import process_pdf
from database import get_db, Document, create_tables

create_tables()
db = next(get_db())

file_path = "uploads_auto/hcmus_chi_tiet_tat_ca_nganh_hoc.pdf"
doc_id = str(uuid.uuid4())
filename = "hcmus_chi_tiet_tat_ca_nganh_hoc.pdf"

doc = Document(
    id=doc_id,
    filename=filename,
    original_filename=filename,
    category="major",
    status="processing",
    file_size=os.path.getsize(file_path),
)
db.add(doc)
db.commit()

try:
    chunk_count = process_pdf(file_path, doc_id, filename, "major")
    doc.chunk_count = chunk_count
    doc.status = "ready"
    db.commit()
    print(f"Success! Processed {chunk_count} chunks.")
except Exception as e:
    doc.status = "error"
    db.commit()
    print(f"Failed! Error: {e}")
