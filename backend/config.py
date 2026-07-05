from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    google_api_key: str = ""
    gemini_api_keys: str = ""
    admin_username: str = "admin"
    admin_password: str = "hcmus2024"
    admin_token: str = "hcmus-admin-secret-token-2024"
    database_url: str = "sqlite:///./hcmus_admission.db"
    faiss_persist_dir: str = "./faiss_db"
    max_history_messages: int = 30
    top_k_results: int = 15
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
