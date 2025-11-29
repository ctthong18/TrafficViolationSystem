from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.denunciation import Denunciation, DenunciationStatus, DenunciationType
from app.models.denunciation_activity import DenunciationActivity
from app.models.user import User
from app.utils.validators import sanitize_input

class DenunciationService:
    def __init__(self, db: Session):
        self.db = db

    def get_denunciation_by_id(self, denunciation_id: int) -> Denunciation:
        """Lấy thông tin tố cáo theo ID"""
        denunciation = self.db.query(Denunciation).filter(Denunciation.id == denunciation_id).first()
        if not denunciation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tố cáo không tồn tại"
            )
        return denunciation

    def create_denunciation(self, denunciation_data: dict) -> Denunciation:
        """Tạo mới tố cáo"""
        # Sanitize input
        denunciation_data['title'] = sanitize_input(denunciation_data.get('title', ''))
        denunciation_data['description'] = sanitize_input(denunciation_data.get('description', ''))
        
        # Generate denunciation code
        today = datetime.now().date()
        count_today = self.db.query(Denunciation).filter(
            Denunciation.created_at >= datetime.combine(today, datetime.min.time())
        ).count()
        denunciation_code = f"TC-{today.strftime('%Y%m%d')}-{count_today + 1:03d}"
        
        denunciation = Denunciation(
            **denunciation_data,
            denunciation_code=denunciation_code,
            status=DenunciationStatus.PENDING
        )
        
        self.db.add(denunciation)
        self.db.commit()
        self.db.refresh(denunciation)
        
        # Log activity
        self._log_activity(denunciation.id, "created", "Tố cáo được tạo mới")
        
        return denunciation

    def update_denunciation_status(self, denunciation_id: int, status: DenunciationStatus, 
                                 investigator_id: int, notes: Optional[str] = None) -> Denunciation:
        """Cập nhật trạng thái tố cáo"""
        denunciation = self.get_denunciation_by_id(denunciation_id)
        
        old_status = denunciation.status
        denunciation.status = status
        denunciation.assigned_investigator_id = investigator_id
        denunciation.assigned_at = datetime.now()
        
        if notes:
            denunciation.investigation_notes = notes
        
        self.db.commit()
        self.db.refresh(denunciation)
        
        # Log activity
        activity_desc = f"Trạng thái thay đổi từ {old_status.value} sang {status.value}"
        self._log_activity(denunciation.id, "status_updated", activity_desc, investigator_id)
        
        return denunciation

    def resolve_denunciation(self, denunciation_id: int, resolution: str, 
                           investigator_id: int) -> Denunciation:
        """Giải quyết tố cáo"""
        denunciation = self.get_denunciation_by_id(denunciation_id)
        
        denunciation.status = DenunciationStatus.RESOLVED
        denunciation.resolution = resolution
        denunciation.resolved_at = datetime.now()
        denunciation.assigned_investigator_id = investigator_id
        
        if not denunciation.assigned_at:
            denunciation.assigned_at = datetime.now()
        
        self.db.commit()
        self.db.refresh(denunciation)
        
        # Log activity
        self._log_activity(denunciation.id, "resolved", "Tố cáo đã được giải quyết", investigator_id)
        
        return denunciation

    def transfer_denunciation(self, denunciation_id: int, transfer_to: str, 
                            reason: str, investigator_id: int) -> Denunciation:
        """Chuyển tố cáo cho cơ quan khác"""
        denunciation = self.get_denunciation_by_id(denunciation_id)
        
        denunciation.status = DenunciationStatus.TRANSFERRED
        denunciation.transferred_to = transfer_to
        denunciation.transfer_reason = reason
        denunciation.transferred_at = datetime.now()
        denunciation.assigned_investigator_id = investigator_id
        
        self.db.commit()
        self.db.refresh(denunciation)
        
        # Log activity
        activity_desc = f"Tố cáo được chuyển đến {transfer_to}"
        self._log_activity(denunciation.id, "transferred", activity_desc, investigator_id)
        
        return denunciation

    def get_pending_denunciations(self, skip: int = 0, limit: int = 50) -> List[Denunciation]:
        """Lấy danh sách tố cáo đang chờ xử lý"""
        return self.db.query(Denunciation).filter(
            Denunciation.status == DenunciationStatus.PENDING
        ).order_by(Denunciation.created_at.desc()).offset(skip).limit(limit).all()

    def get_assigned_denunciations(self, investigator_id: int) -> List[Denunciation]:
        """Lấy danh sách tố cáo được phân công cho điều tra viên"""
        return self.db.query(Denunciation).filter(
            Denunciation.assigned_investigator_id == investigator_id
        ).order_by(Denunciation.assigned_at.desc()).all()

    def search_denunciations(self, 
                           status: Optional[DenunciationStatus] = None,
                           denunciation_type: Optional[DenunciationType] = None,
                           severity: Optional[str] = None,
                           accused_person: Optional[str] = None,
                           start_date: Optional[datetime] = None,
                           end_date: Optional[datetime] = None,
                           skip: int = 0, limit: int = 50) -> List[Denunciation]:
        """Tìm kiếm tố cáo với các bộ lọc"""
        query = self.db.query(Denunciation)
        
        if status:
            query = query.filter(Denunciation.status == status)
        if denunciation_type:
            query = query.filter(Denunciation.denunciation_type == denunciation_type)
        if severity:
            query = query.filter(Denunciation.severity_level == severity)
        if accused_person:
            query = query.filter(Denunciation.accused_person_name.ilike(f"%{accused_person}%"))
        if start_date:
            query = query.filter(Denunciation.created_at >= start_date)
        if end_date:
            query = query.filter(Denunciation.created_at <= end_date)
        
        return query.order_by(Denunciation.created_at.desc()).offset(skip).limit(limit).all()

    def get_denunciation_statistics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Thống kê tố cáo theo khoảng thời gian"""
        total_denunciations = self.db.query(Denunciation).filter(
            Denunciation.created_at.between(start_date, end_date)
        ).count()
        
        # Thống kê theo trạng thái
        by_status = {}
        for status in DenunciationStatus:
            count = self.db.query(Denunciation).filter(
                Denunciation.created_at.between(start_date, end_date),
                Denunciation.status == status
            ).count()
            by_status[status.value] = count
        
        # Thống kê theo loại tố cáo
        by_type = {}
        for denunciation_type in DenunciationType:
            count = self.db.query(Denunciation).filter(
                Denunciation.created_at.between(start_date, end_date),
                Denunciation.denunciation_type == denunciation_type
            ).count()
            by_type[denunciation_type.value] = count
        
        # Thống kê theo mức độ nghiêm trọng
        by_severity = self.db.query(
            Denunciation.severity_level,
            Denunciation.status
        ).filter(
            Denunciation.created_at.between(start_date, end_date)
        ).all()
        
        severity_stats = {}
        for severity, status in by_severity:
            if severity not in severity_stats:
                severity_stats[severity] = {'total': 0, 'resolved': 0, 'pending': 0}
            
            severity_stats[severity]['total'] += 1
            if status == DenunciationStatus.RESOLVED:
                severity_stats[severity]['resolved'] += 1
            elif status in [DenunciationStatus.PENDING, DenunciationStatus.VERIFYING, DenunciationStatus.INVESTIGATING]:
                severity_stats[severity]['pending'] += 1
        
        return {
            "total_denunciations": total_denunciations,
            "by_status": by_status,
            "by_type": by_type,
            "by_severity": severity_stats,
            "resolution_rate": by_status.get('resolved', 0) / total_denunciations if total_denunciations > 0 else 0,
            "average_processing_time": self._calculate_average_processing_time(start_date, end_date)
        }

    def get_whistleblower_protection_stats(self) -> Dict[str, Any]:
        """Thống kê về bảo vệ người tố cáo"""
        total_anonymous = self.db.query(Denunciation).filter(
            Denunciation.is_anonymous == True
        ).count()
        
        total_whistleblowers = self.db.query(Denunciation).filter(
            Denunciation.is_whistleblower == True
        ).count()
        
        high_security_cases = self.db.query(Denunciation).filter(
            Denunciation.security_level.in_(['secret', 'top_secret'])
        ).count()
        
        return {
            "total_anonymous_denunciations": total_anonymous,
            "total_whistleblower_cases": total_whistleblowers,
            "high_security_cases": high_security_cases,
            "anonymous_rate": total_anonymous / self.db.query(Denunciation).count() if self.db.query(Denunciation).count() > 0 else 0
        }

    def _log_activity(self, denunciation_id: int, activity_type: str, 
                     description: str, performed_by: Optional[int] = None):
        """Ghi log hoạt động tố cáo"""
        activity = DenunciationActivity(
            denunciation_id=denunciation_id,
            activity_type=activity_type,
            description=description,
            performed_by=performed_by
        )
        self.db.add(activity)
        self.db.commit()

    def _calculate_average_processing_time(self, start_date: datetime, end_date: datetime) -> float:
        """Tính thời gian xử lý trung bình"""
        resolved_denunciations = self.db.query(Denunciation).filter(
            Denunciation.created_at.between(start_date, end_date),
            Denunciation.status == DenunciationStatus.RESOLVED,
            Denunciation.resolved_at.isnot(None)
        ).all()
        
        if not resolved_denunciations:
            return 0
        
        total_seconds = sum(
            (denunciation.resolved_at - denunciation.created_at).total_seconds()
            for denunciation in resolved_denunciations
        )
        
        return total_seconds / len(resolved_denunciations)  # seconds

    def get_denunciation_activities(self, denunciation_id: int) -> List[DenunciationActivity]:
        """Lấy lịch sử hoạt động của tố cáo"""
        return self.db.query(DenunciationActivity).filter(
            DenunciationActivity.denunciation_id == denunciation_id
        ).order_by(DenunciationActivity.performed_at.asc()).all()

    def get_user_denunciations(self, user_identification: str, user_email: str = None) -> List[Denunciation]:
        """Lấy danh sách tố cáo của user dựa trên identification number hoặc email"""
        query = self.db.query(Denunciation)
        
        # Match by identification or email
        conditions = []
        if user_identification:
            conditions.append(Denunciation.informant_identification == user_identification)
        if user_email:
            conditions.append(Denunciation.informant_email == user_email)
        
        if not conditions:
            return []
        
        # Use OR condition to match either identification or email
        from sqlalchemy import or_
        query = query.filter(or_(*conditions))
        
        return query.order_by(Denunciation.created_at.desc()).all()

    def export_denunciations_report(self, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Xuất báo cáo tố cáo"""
        denunciations = self.db.query(Denunciation).filter(
            Denunciation.created_at.between(start_date, end_date)
        ).all()
        
        report = []
        for denunciation in denunciations:
            report.append({
                "denunciation_code": denunciation.denunciation_code,
                "type": denunciation.denunciation_type.value,
                "title": denunciation.title,
                "status": denunciation.status.value,
                "severity": denunciation.severity_level,
                "created_at": denunciation.created_at,
                "resolved_at": denunciation.resolved_at,
                "assigned_investigator": denunciation.assigned_investigator.full_name if denunciation.assigned_investigator else None,
                "is_anonymous": denunciation.is_anonymous,
                "security_level": denunciation.security_level
            })
        
        return report