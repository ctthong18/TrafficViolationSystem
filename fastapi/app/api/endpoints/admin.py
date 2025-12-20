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

@router.get("/officers/stats")
def get_officers_stats(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """Lấy thống kê hoạt động của cán bộ"""
    user_service = UserService(db)
    
    # Mock data cho officers stats - có thể thay thế bằng logic thực tế
    officers_stats = {
        "systemStats": [
            {
                "title": "Tổng vi phạm đã xử lý",
                "value": "1,234",
                "change": "+12%",
                "trend": "up",
                "description": "so với tháng trước"
            },
            {
                "title": "Thời gian xử lý trung bình",
                "value": "2.5 ngày",
                "change": "-8%",
                "trend": "up",
                "description": "cải thiện"
            },
            {
                "title": "Tỷ lệ hoàn thành",
                "value": "94.2%",
                "change": "+3%",
                "trend": "up",
                "description": "tăng so với tháng trước"
            },
            {
                "title": "Cán bộ đang hoạt động",
                "value": f"{user_service.db.query(User).filter(User.role == 'officer', User.is_active == True).count()}/18",
                "change": "0%",
                "trend": "neutral",
                "description": "ổn định"
            }
        ],
        "officerActivities": [
            {
                "officerId": "1",
                "officerName": "Nguyễn Văn A",
                "position": "Cán bộ xử lý",
                "totalProcessed": 156,
                "totalAssigned": 180,
                "completionRate": 86.7,
                "avgProcessingTime": 2.1,
                "recentActivities": 12,
                "status": "active"
            },
            {
                "officerId": "2", 
                "officerName": "Trần Thị B",
                "position": "Cán bộ xử lý",
                "totalProcessed": 142,
                "totalAssigned": 160,
                "completionRate": 88.8,
                "avgProcessingTime": 1.9,
                "recentActivities": 8,
                "status": "active"
            },
            {
                "officerId": "3",
                "officerName": "Lê Văn C", 
                "position": "Trưởng phòng",
                "totalProcessed": 98,
                "totalAssigned": 110,
                "completionRate": 89.1,
                "avgProcessingTime": 1.5,
                "recentActivities": 15,
                "status": "active"
            }
        ],
        "topPerformers": [
            {
                "officerId": "3",
                "officerName": "Lê Văn C", 
                "position": "Trưởng phòng",
                "completionRate": 89.1
            },
            {
                "officerId": "2", 
                "officerName": "Trần Thị B",
                "position": "Cán bộ xử lý",
                "completionRate": 88.8
            },
            {
                "officerId": "1",
                "officerName": "Nguyễn Văn A",
                "position": "Cán bộ xử lý",
                "completionRate": 86.7
            }
        ],
        "dailyProcessing": [
            {"date": "2024-01-01", "totalProcessed": 45, "totalAssigned": 52},
            {"date": "2024-01-02", "totalProcessed": 38, "totalAssigned": 45},
            {"date": "2024-01-03", "totalProcessed": 52, "totalAssigned": 58},
            {"date": "2024-01-04", "totalProcessed": 41, "totalAssigned": 48},
            {"date": "2024-01-05", "totalProcessed": 47, "totalAssigned": 51},
            {"date": "2024-01-06", "totalProcessed": 39, "totalAssigned": 44},
            {"date": "2024-01-07", "totalProcessed": 44, "totalAssigned": 49}
        ]
    }
    
    return officers_stats