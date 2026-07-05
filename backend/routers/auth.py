from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config import get_settings

settings = get_settings()
router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(request: LoginRequest):
    if (
        request.username == settings.admin_username
        and request.password == settings.admin_password
    ):
        return {
            "token": settings.admin_token,
            "username": request.username,
            "message": "Đăng nhập thành công",
        }
    raise HTTPException(status_code=401, detail="Sai tên đăng nhập hoặc mật khẩu")
