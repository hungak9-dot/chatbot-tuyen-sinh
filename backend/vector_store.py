import os
import logging
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_vectorstore = None


def get_embeddings():
    return GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-2",
        google_api_key=settings.google_api_key
    )


def get_vectorstore():
    global _vectorstore
    if _vectorstore is None:
        index_path = os.path.join(settings.faiss_persist_dir, "faiss_index")
        embeddings = get_embeddings()
        if os.path.exists(index_path):
            try:
                _vectorstore = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
            except Exception as e:
                logger.error(f"Error loading FAISS index: {e}")
                _vectorstore = FAISS.from_texts(["HCMUS Initialization"], embeddings, metadatas=[{"source": "init"}])
        else:
            os.makedirs(settings.faiss_persist_dir, exist_ok=True)
            _vectorstore = FAISS.from_texts(["HCMUS Initialization"], embeddings, metadatas=[{"source": "init"}])
            _vectorstore.save_local(index_path)
    return _vectorstore


def save_vectorstore():
    global _vectorstore
    if _vectorstore is not None:
        index_path = os.path.join(settings.faiss_persist_dir, "faiss_index")
        _vectorstore.save_local(index_path)


def delete_document_chunks(doc_id: str) -> int:
    """Delete all chunks for a document. Returns deleted count."""
    global _vectorstore
    if _vectorstore is None:
        get_vectorstore()

    try:
        docstore = _vectorstore.docstore._dict
        ids_to_delete = []
        for id, doc in docstore.items():
            if doc.metadata.get("doc_id") == doc_id:
                ids_to_delete.append(id)

        if ids_to_delete:
            _vectorstore.delete(ids_to_delete)
            save_vectorstore()
            logger.info(f"Deleted {len(ids_to_delete)} chunks for doc_id={doc_id}")
            return len(ids_to_delete)
    except Exception as e:
        logger.error(f"Error deleting chunks: {e}")
    return 0
