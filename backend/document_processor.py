import fitz  # PyMuPDF
import logging
from pathlib import Path
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document as LangchainDocument
from vector_store import get_vectorstore

logger = logging.getLogger(__name__)

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200


def process_pdf(file_path: str, doc_id: str, filename: str, category: str = "general") -> int:
    """Process a PDF and add to vector store. Returns chunk count."""
    pdf_document = fitz.open(file_path)
    pages_content = []

    for page_num in range(len(pdf_document)):
        page = pdf_document[page_num]
        text = page.get_text()
        if text.strip():
            pages_content.append({"text": text, "page": page_num + 1})

    pdf_document.close()

    if not pages_content:
        raise ValueError("PDF không có nội dung text có thể đọc được")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""],
    )

    documents = []
    for page_data in pages_content:
        chunks = splitter.split_text(page_data["text"])
        for i, chunk in enumerate(chunks):
            if chunk.strip():
                doc = LangchainDocument(
                    page_content=chunk,
                    metadata={
                        "doc_id": doc_id,
                        "filename": filename,
                        "category": category,
                        "page": page_data["page"],
                        "chunk_index": i,
                        "source": f"{filename} (trang {page_data['page']})",
                    }
                )
                documents.append(doc)

    if not documents:
        raise ValueError("Không tách được chunk từ PDF")

    vectorstore = get_vectorstore()
    batch_size = 50
    for i in range(0, len(documents), batch_size):
        batch = documents[i: i + batch_size]
        vectorstore.add_documents(batch)
        
    from vector_store import save_vectorstore
    save_vectorstore()

    logger.info(f"Processed '{filename}': {len(documents)} chunks, category={category}")
    return len(documents)
