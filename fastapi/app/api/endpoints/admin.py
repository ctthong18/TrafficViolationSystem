from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.schemas.user_schema import UserCreate, UserResponse, UserListResponse
from app.services.user_service import UserService
from app.api.dependencies import get_current_user, require_role
from app.models.user import User

router = APIRouter()

@router.get("/users", response_model=UserListResponse)
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    user_service = UserService(db)
    users = user_service.get_users(skip, limit, role, is_active)
    total = user_service.get_users_count()
    
    return UserListResponse(
        users=users,
        total=total,
        page=skip // limit + 1,
        size=limit
    )

@router.post("/users/officers", response_model=UserResponse)
def create_officer_account(
    officer_data: UserCreate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    user_service = UserService(db)
    return user_service.create_officer_account(officer_data, current_user.id)

@router.post("/users", response_model=UserResponse)
def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    user_service = UserService(db)
    return user_service.create_user(user_data, current_user.id)

@router.get("/dashboard/stats")
def get_admin_dashboard(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    # Thống kê tổng quan cho admin
    user_service = UserService(db)
    total_users = user_service.get_users_count()
    total_officers = user_service.db.query(User).filter(User.role == "officer").count()
    total_citizens = user_service.db.query(User).filter(User.role == "citizen").count()
    
    return {
        "total_users": total_users,
        "total_officers": total_officers,
        "total_citizens": total_citizens,
        "system_health": "normal"
    }