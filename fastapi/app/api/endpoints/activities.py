from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies import require_roles
from app.models.user import User
from app.models.activity import Activity

router = APIRouter()

@router.get("/recent")
def get_recent_activities(
    limit: int = Query(10, le=50),
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db)
):
    """Lấy danh sách hoạt động gần đây cho dashboard"""
    from datetime import datetime, timedelta
    
    activities = db.query(Activity).order_by(
        Activity.created_at.desc()
    ).limit(limit).all()
    
    result = []
    for activity in activities:
        # Calculate relative time
        time_diff = datetime.now() - activity.created_at
        if time_diff < timedelta(minutes=1):
            time_str = "Vừa xong"
        elif time_diff < timedelta(hours=1):
            minutes = int(time_diff.total_seconds() / 60)
            time_str = f"{minutes} phút trước"
        elif time_diff < timedelta(days=1):
            hours = int(time_diff.total_seconds() / 3600)
            time_str = f"{hours} giờ trước"
        else:
            days = time_diff.days
            time_str = f"{days} ngày trước"
        
        result.append({
            "action": activity.description or "Hoạt động hệ thống",
            "time": time_str,
            "type": activity.type or "system"
        })
    
    return result
