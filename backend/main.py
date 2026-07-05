import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import certifi
os.environ['GRPC_DEFAULT_SSL_ROOTS_FILE_PATH'] = certifi.where()

from database import create_tables
from routers import chat, admin, auth

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    logging.getLogger(__name__).info("HCMUS Admission AI started")
    yield
    logging.getLogger(__name__).info("HCMUS Admission AI shutting down")


app = FastAPI(
    title="HCMUS Admission AI API",
    description="Hệ thống AI tư vấn tuyển sinh Đại học Khoa học Tự nhiên - ĐHQG HCM",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(admin.router)
app.include_router(auth.router)

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{catchall:path}")
    def serve_frontend(catchall: str):
        if catchall.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
            
        file_path = os.path.join(frontend_dist, catchall)
        if catchall and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {"message": "HCMUS Admission AI API", "status": "running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}
