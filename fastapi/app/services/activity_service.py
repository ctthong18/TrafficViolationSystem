# fastapi/app/services/activity_service.py

from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.models.activity import Activity  # Nếu bạn có model Activity
from app.schemas.recent_activity_schema import RecentActivityResponse


class ActivityService:
    """Service xử lý các hoạt động (activity log) của người dùng/officer."""

    def __init__(self, db: Session):
        self.db = db

    def get_recent_activities_for_user(
        self, user_id: int, limit: int = 10
    ) -> List[RecentActivityResponse]:
        """
        Lấy danh sách hoạt động gần đây của 1 user cụ thể.
        """
        # Nếu bạn có model Activity trong DB:
        if hasattr(Activity, "user_id"):
            activities = (
                self.db.query(Activity)
                .filter(Activity.user_id == user_id)
                .order_by(Activity.created_at.desc())
                .limit(limit)
                .all()
            )

            # Chuyển thành schema RecentActivityResponse
            return [
                RecentActivityResponse(
                    id=a.id,
                    user_id=a.user_id,
                    activity=a.description,
                    type=a.type or "normal",
                    date=a.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                )
                for a in activities
            ]

        # Nếu bạn CHƯA có bảng Activity → trả về dữ liệu mẫu
        return [
            RecentActivityResponse(
                id=i,
                user_id=user_id,
                activity=f"Hoạt động mẫu #{i}",
                type="highlight" if i % 2 == 0 else "normal",
                date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            )
            for i in range(1, limit + 1)
        ]
