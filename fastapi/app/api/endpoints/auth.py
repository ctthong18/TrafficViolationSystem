from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth_schema import (
    ChangePasswordRequest,
    LoginRequest,
    RegisterRequest,
    Token,
)
from app.services.auth_service import AuthService
from app.services.user_service import UserService

router = APIRouter()


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user = auth_service.authenticate_user(login_data)
    return auth_service.create_access_token_for_user(user)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(register_data: RegisterRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user = auth_service.register_user(register_data)
    return {"message": "Đăng ký thành công", "user_id": user.id}


@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "phone_number": current_user.phone_number,
        "identification_number": current_user.identification_number,
        "is_active": current_user.is_active,
    }
