from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from sqlalchemy import or_
from app.schemas.auth_schema import LoginRequest, RegisterRequest
from app.core.security import verify_password, get_password_hash, create_access_token
from datetime import timedelta
from app.core.config import settings

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def authenticate_user(self, login_data: LoginRequest) -> User:
        # Tìm user theo username hoặc email
        user = (
            self.db.query(User)
            .filter(
                (User.username == login_data.username_or_email)
                | (User.email == login_data.username_or_email)
            )
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Tên đăng nhập hoặc email không tồn tại"
            )

        # Kiểm tra mật khẩu
        if not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Mật khẩu không đúng"
            )

        # Kiểm tra CCCD nếu role là citizen
        if user.role == "citizen":
            if not login_data.identification_number:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Người dân cần nhập số CCCD để đăng nhập"
                )
            if user.identification_number != login_data.identification_number:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Số CCCD không khớp"
                )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Tài khoản đã bị vô hiệu hóa"
            )

        return user

    def register_user(self, user_data: RegisterRequest) -> User:
        # Check if username exists
        if self.db.query(User).filter(User.username == user_data.username).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tên đăng nhập đã tồn tại"
            )
        
        # Check if email exists
        if self.db.query(User).filter(User.email == user_data.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email đã được sử dụng"
            )
        
        # Create new user
        user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=get_password_hash(user_data.password),
            full_name=user_data.full_name,
            phone_number=user_data.phone_number,
            role="citizen",  # Default role for self-registration
            identification_number=user_data.identification_number
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        return user

    def create_access_token_for_user(self, user: User):
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            subject=user.username, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}