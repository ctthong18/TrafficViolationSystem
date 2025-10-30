from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.complaint import Complaint, ComplaintStatus, ComplaintType
from app.models.complaint_appeal import ComplaintAppeal, AppealStatus
from app.models.complaint_activity import ComplaintActivity
from app.models.user import User
from app.utils.validators import sanitize_input

class ComplaintService:
    def __init__(self, db: Session):
        self.db = db

    def get_complaint_by_id(self, complaint_id: int) -> Complaint:
        complaint = self.db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Khiếu nại không tồn tại"
            )
        return complaint

    def create_complaint(self, complaint_data: dict, user_id: int) -> Complaint:
        """Tạo khiếu nại mới"""
        # Sanitize input
        complaint_data['title'] = sanitize_input(complaint_data.get('title', ''))
        complaint_data['description'] = sanitize_input(complaint_data.get('description', ''))
        
        # Generate complaint code
        today = datetime.now().date()
        count_today = self.db.query(Complaint).filter(
            Complaint.created_at >= datetime.combine(today, datetime.min.time())
        ).count()
        complaint_code = f"KN-{today.strftime('%Y%m%d')}-{count_today + 1:03d}"
        
        complaint = Complaint(
            **complaint_data,
            complaint_code=complaint_code,
            status=ComplaintStatus.PENDING,
            complainant_id=user_id
        )
        
        self.db.add(complaint)
        self.db.commit()
        self.db.refresh(complaint)
        
        # Log activity
        self._log_activity(complaint.id, "created", "Khiếu nại được tạo mới", user_id)
        
        return complaint

    def get_user_complaints(self, user_id: int) -> List[Complaint]:
        """Lấy khiếu nại của người dùng"""
        return self.db.query(Complaint).filter(
            Complaint.complainant_id == user_id
        ).order_by(Complaint.created_at.desc()).all()

    def get_assigned_complaints(self, officer_id: int) -> List[Complaint]:
        """Lấy khiếu nại được phân công cho officer"""
        return self.db.query(Complaint).filter(
            Complaint.assigned_officer_id == officer_id
        ).order_by(Complointment.assigned_at.desc()).all()

    def update_complaint(self, complaint_id: int, update_data: dict) -> Complaint:
        """Cập nhật khiếu nại"""
        complaint = self.get_complaint_by_id(complaint_id)
        
        for field, value in update_data.items():
            if value is not None:
                setattr(complaint, field, value)
        
        complaint.updated_at = datetime.now()
        self.db.commit()
        self.db.refresh(complaint)
        
        return complaint

    def assign_complaint(self, complaint_id: int, officer_id: int, assigned_by: int) -> Complaint:
        """Phân công khiếu nại cho officer"""
        complaint = self.get_complaint_by_id(complaint_id)
        
        # Check if officer exists
        officer = self.db.query(User).filter(User.id == officer_id).first()
        if not officer or officer.role not in ["admin", "officer"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Officer không tồn tại"
            )
        
        complaint.assigned_officer_id = officer_id
        complaint.assigned_at = datetime.now()
        complaint.status = ComplaintStatus.UNDER_REVIEW
        
        self.db.commit()
        self.db.refresh(complaint)
        
        # Log activity
        activity_desc = f"Khiếu nại được phân công cho {officer.full_name}"
        self._log_activity(complaint.id, "assigned", activity_desc, assigned_by)
        
        return complaint

    def resolve_complaint(self, complaint_id: int, resolution: str, resolved_by: int) -> Complaint:
        """Giải quyết khiếu nại"""
        complaint = self.get_complaint_by_id(complaint_id)
        
        complaint.status = ComplaintStatus.RESOLVED
        complaint.resolution = resolution
        complaint.resolved_at = datetime.now()
        
        if not complaint.assigned_officer_id:
            complaint.assigned_officer_id = resolved_by
        
        self.db.commit()
        self.db.refresh(complaint)
        
        # Log activity
        self._log_activity(complaint.id, "resolved", "Khiếu nại đã được giải quyết", resolved_by)
        
        return complaint

    def create_appeal(self, complaint_id: int, appeal_data: dict) -> ComplaintAppeal:
        """Tạo kháng cáo cho khiếu nại"""
        complaint = self.get_complaint_by_id(complaint_id)
        
        if complaint.status != ComplaintStatus.RESOLVED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Chỉ có thể kháng cáo khiếu nại đã được giải quyết"
            )
        
        # Generate appeal code
        today = datetime.now().date()
        count_today = self.db.query(ComplaintAppeal).filter(
            ComplaintAppeal.created_at >= datetime.combine(today, datetime.min.time())
        ).count()
        appeal_code = f"KC-{today.strftime('%Y%m%d')}-{count_today + 1:03d}"
        
        appeal = ComplaintAppeal(
            **appeal_data,
            appeal_code=appeal_code,
            complaint_id=complaint_id,
            status=AppealStatus.PENDING
        )
        
        self.db.add(appeal)
        self.db.commit()
        self.db.refresh(appeal)
        
        # Update complaint status
        complaint.status = ComplaintStatus.UNDER_REVIEW
        self.db.commit()
        
        # Log activity
        self._log_activity(complaint_id, "appeal_created", "Kháng cáo được tạo", complaint.complainant_id)
        
        return appeal

    def search_complaints(self, status: Optional[ComplaintStatus] = None,
                         complaint_type: Optional[ComplaintType] = None,
                         skip: int = 0, limit: int = 50) -> List[Complaint]:
        """Tìm kiếm khiếu nại"""
        query = self.db.query(Complaint)
        
        if status:
            query = query.filter(Complaint.status == status)
        if complaint_type:
            query = query.filter(Complaint.complaint_type == complaint_type)
        
        return query.order_by(Complaint.created_at.desc()).offset(skip).limit(limit).all()

    def get_complaints_count(self) -> int:
        """Đếm tổng số khiếu nại"""
        return self.db.query(Complaint).count()

    def get_complaint_activities(self, complaint_id: int) -> List[ComplaintActivity]:
        """Lấy lịch sử hoạt động của khiếu nại"""
        return self.db.query(ComplaintActivity).filter(
            ComplaintActivity.complaint_id == complaint_id
        ).order_by(ComplaintActivity.performed_at.asc()).all()

    def get_complaint_statistics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Thống kê khiếu nại"""
        total_complaints = self.db.query(Complaint).filter(
            Complaint.created_at.between(start_date, end_date)
        ).count()
        
        resolved_complaints = self.db.query(Complaint).filter(
            Complaint.created_at.between(start_date, end_date),
            Complaint.status == ComplaintStatus.RESOLVED
        ).count()
        
        # Thống kê theo loại
        by_type = {}
        for complaint_type in ComplaintType:
            count = self.db.query(Complaint).filter(
                Complaint.created_at.between(start_date, end_date),
                Complaint.complaint_type == complaint_type
            ).count()
            by_type[complaint_type.value] = count
        
        return {
            "total_complaints": total_complaints,
            "resolved_complaints": resolved_complaints,
            "resolution_rate": resolved_complaints / total_complaints if total_complaints > 0 else 0,
            "complaints_by_type": by_type,
            "average_rating": self._calculate_average_rating(start_date, end_date)
        }

    def rate_complaint(self, complaint_id: int, rating: int, feedback: Optional[str] = None) -> Complaint:
        """Đánh giá giải quyết khiếu nại"""
        complaint = self.get_complaint_by_id(complaint_id)
        
        complaint.user_rating = rating
        complaint.user_feedback = feedback
        
        self.db.commit()
        self.db.refresh(complaint)
        
        # Log activity
        self._log_activity(complaint_id, "rated", f"Đánh giá {rating} sao", complaint.complainant_id)
        
        return complaint

    def _log_activity(self, complaint_id: int, activity_type: str, 
                     description: str, performed_by: Optional[int] = None):
        """Ghi log hoạt động khiếu nại"""
        activity = ComplaintActivity(
            complaint_id=complaint_id,
            activity_type=activity_type,
            description=description,
            performed_by=performed_by
        )
        self.db.add(activity)
        self.db.commit()

    def _calculate_average_rating(self, start_date: datetime, end_date: datetime) -> float:
        """Tính điểm đánh giá trung bình"""
        ratings = self.db.query(Complaint.user_rating).filter(
            Complaint.created_at.between(start_date, end_date),
            Complaint.user_rating.isnot(None)
        ).all()
        
        if not ratings:
            return 0
        
        valid_ratings = [r[0] for r in ratings if r[0] is not None]
        return sum(valid_ratings) / len(valid_ratings) if valid_ratings else 0