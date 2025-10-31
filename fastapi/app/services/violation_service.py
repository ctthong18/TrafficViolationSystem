from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.models.violation import Violation
from app.models.user import User
from app.models.vehicle import Vehicle
from app.schemas.violation_schema import ViolationCreate, ViolationUpdate, ViolationReview

class ViolationService:
    def __init__(self, db: Session):
        self.db = db

    def get_violation_by_id(self, violation_id: int) -> Violation:
        violation = self.db.query(Violation).filter(Violation.id == violation_id).first()
        if not violation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vi phạm không tồn tại"
            )
        return violation

    def create_violation(self, violation_data: ViolationCreate) -> Violation:
        # Check if vehicle exists
        vehicle = self.db.query(Vehicle).filter(
            Vehicle.license_plate == violation_data.license_plate
        ).first()
        
        violation = Violation(
            **violation_data.dict(),
            vehicle_id=vehicle.id if vehicle else None
        )
        
        self.db.add(violation)
        self.db.commit()
        self.db.refresh(violation)
        
        return violation

    def get_pending_violations(self, skip: int = 0, limit: int = 50, 
                              priority: Optional[str] = None) -> List[Violation]:
        # Include both 'pending' and 'reviewing' as queue statuses for frontend
        query = self.db.query(Violation).filter(Violation.status.in_(['pending', 'reviewing']))
        
        if priority:
            query = query.filter(Violation.priority == priority)
        
        return query.order_by(Violation.detected_at.desc()).offset(skip).limit(limit).all()

    def review_violation(self, violation_id: int, officer_id: int, 
                        action: str, notes: Optional[str] = None) -> Violation:
        violation = self.get_violation_by_id(violation_id)
        
        if violation.status not in ['pending', 'reviewing']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vi phạm đã được xử lý"
            )
        
        normalized = action.lower().strip()
        if normalized in ['approve', 'approved', 'verify', 'verified']:
            violation.status = 'verified'
        elif normalized in ['reject', 'rejected', 'process', 'processed']:
            violation.status = 'processed'
        elif normalized in ['processing', 'reviewing']:
            violation.status = 'reviewing'
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Hành động không hợp lệ"
            )
        
        violation.reviewed_by = officer_id
        violation.reviewed_at = datetime.now()
        violation.review_notes = notes
        
        self.db.commit()
        self.db.refresh(violation)
        
        return violation

    def get_violations_by_license_plate(self, license_plate: str, 
                                       status: Optional[str] = None) -> List[Violation]:
        query = self.db.query(Violation).filter(Violation.license_plate == license_plate)
        
        if status:
            query = query.filter(Violation.status == status)
        
        return query.order_by(Violation.detected_at.desc()).all()

    def get_violations_by_vehicles(self, license_plates: List[str],
                                  status: Optional[str] = None) -> List[Violation]:
        query = self.db.query(Violation).filter(Violation.license_plate.in_(license_plates))
        
        if status:
            query = query.filter(Violation.status == status)
        
        return query.order_by(Violation.detected_at.desc()).all()

    def get_violation_statistics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        total_violations = self.db.query(Violation).filter(
            Violation.detected_at.between(start_date, end_date)
        ).count()
        
        approved_violations = self.db.query(Violation).filter(
            Violation.detected_at.between(start_date, end_date),
            Violation.status == 'approved'
        ).count()
        
        rejected_violations = self.db.query(Violation).filter(
            Violation.detected_at.between(start_date, end_date),
            Violation.status == 'rejected'
        ).count()
        
        # Violations by type
        violations_by_type = self.db.query(
            Violation.violation_type,
            Violation.status
        ).filter(
            Violation.detected_at.between(start_date, end_date)
        ).all()
        
        type_stats = {}
        for violation_type, status in violations_by_type:
            if violation_type not in type_stats:
                type_stats[violation_type] = {'total': 0, 'approved': 0, 'rejected': 0}
            
            type_stats[violation_type]['total'] += 1
            if status == 'approved':
                type_stats[violation_type]['approved'] += 1
            elif status == 'rejected':
                type_stats[violation_type]['rejected'] += 1
        
        return {
            "total_violations": total_violations,
            "approved_violations": approved_violations,
            "rejected_violations": rejected_violations,
            "approval_rate": approved_violations / total_violations if total_violations > 0 else 0,
            "violations_by_type": type_stats,
            "period": {
                "start_date": start_date,
                "end_date": end_date,
                "days": (end_date - start_date).days
            }
        }

    def get_officer_stats(self, officer_id: int) -> Dict[str, Any]:
        today = datetime.now().date()
        start_of_day = datetime.combine(today, datetime.min.time())
        end_of_day = datetime.combine(today, datetime.max.time())
        
        total_reviewed = self.db.query(Violation).filter(
            Violation.reviewed_by == officer_id
        ).count()
        
        approved_today = self.db.query(Violation).filter(
            Violation.reviewed_by == officer_id,
            Violation.status == 'approved',
            Violation.reviewed_at.between(start_of_day, end_of_day)
        ).count()
        
        rejected_today = self.db.query(Violation).filter(
            Violation.reviewed_by == officer_id,
            Violation.status == 'rejected', 
            Violation.reviewed_at.between(start_of_day, end_of_day)
        ).count()
        
        # Calculate average processing time
        processing_times = self.db.query(Violation).filter(
            Violation.reviewed_by == officer_id,
            Violation.reviewed_at.isnot(None)
        ).with_entities(
            Violation.created_at,
            Violation.reviewed_at
        ).all()
        
        avg_processing_time = 0
        if processing_times:
            total_seconds = sum(
                (reviewed_at - created_at).total_seconds() 
                for created_at, reviewed_at in processing_times
            )
            avg_processing_time = total_seconds / len(processing_times)
        
        return {
            "total_reviewed": total_reviewed,
            "approved_today": approved_today,
            "rejected_today": rejected_today,
            "efficiency_rate": (approved_today + rejected_today) / 8 if (approved_today + rejected_today) > 0 else 0,  # Assuming 8-hour workday
            "average_processing_time": avg_processing_time,
            "pending_assigned": self.db.query(Violation).filter(
                Violation.status == 'pending'
            ).count()  # All pending, not officer-specific
        }

    def batch_update_violations(self, violation_ids: List[int], update_data: Dict[str, Any]) -> int:
        """Batch update multiple violations"""
        updated_count = self.db.query(Violation).filter(
            Violation.id.in_(violation_ids)
        ).update(update_data, synchronize_session=False)
        
        self.db.commit()
        return updated_count

    def search_violations(self, license_plate: Optional[str] = None,
                         violation_type: Optional[str] = None,
                         status: Optional[str] = None,
                         location: Optional[str] = None,
                         start_date: Optional[datetime] = None,
                         end_date: Optional[datetime] = None,
                         skip: int = 0, limit: int = 50) -> List[Violation]:
        query = self.db.query(Violation)
        
        if license_plate:
            query = query.filter(Violation.license_plate.ilike(f"%{license_plate}%"))
        if violation_type:
            query = query.filter(Violation.violation_type == violation_type)
        if status:
            query = query.filter(Violation.status == status)
        if location:
            query = query.filter(Violation.location_name.ilike(f"%{location}%"))
        if start_date:
            query = query.filter(Violation.detected_at >= start_date)
        if end_date:
            query = query.filter(Violation.detected_at <= end_date)
        
        return query.order_by(Violation.detected_at.desc()).offset(skip).limit(limit).all()