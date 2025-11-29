from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.models.violation import Violation
from app.models.user import User
from app.models.vehicle import Vehicle
from app.schemas.violation_schema import ViolationCreate, ViolationUpdate, ViolationReview
from app.services.notification_service import NotificationService
import cv2
import os
import logging

logger = logging.getLogger(__name__)

class ViolationService:
    def __init__(self, db: Session):
        self.db = db
        self.notification_service = NotificationService(db)

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

    def count_pending_violations(self, priority: Optional[str] = None) -> int:
        """Đếm số lượng vi phạm đang chờ xử lý (pending và reviewing)"""
        query = self.db.query(Violation).filter(Violation.status.in_(['pending', 'reviewing']))
        
        if priority:
            query = query.filter(Violation.priority == priority)
        
        return query.count()

    def review_violation(self, violation_id: int, officer_id: int, 
                        action: str, notes: Optional[str] = None) -> Violation:
        violation = self.get_violation_by_id(violation_id)
        
        if violation.status not in ['pending', 'reviewing']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vi phạm đã được xử lý"
            )
        
        # Check if this is a new assignment (officer not previously assigned)
        is_new_assignment = violation.reviewed_by != officer_id
        
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
        
        # Send notification to officer if newly assigned
        if is_new_assignment:
            try:
                self.notification_service.notify_officer_assignment(
                    violation_id=violation_id,
                    officer_id=officer_id
                )
            except Exception as e:
                logger.error(f"Failed to send officer assignment notification: {e}")
        
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

    def count_violations(self, license_plate: Optional[str] = None,
                        violation_type: Optional[str] = None,
                        status: Optional[str] = None,
                        location: Optional[str] = None,
                        start_date: Optional[datetime] = None,
                        end_date: Optional[datetime] = None) -> int:
        """Đếm số lượng vi phạm với các bộ lọc"""
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
        
        return query.count()

    def get_processed_violations(self, skip: int = 0, limit: int = 50) -> List[Violation]:
        """Lấy danh sách vi phạm đã xử lý (verified, processed, paid)"""
        processed_statuses = ['verified', 'processed', 'paid']
        return self.db.query(Violation).filter(
            Violation.status.in_(processed_statuses)
        ).order_by(Violation.detected_at.desc()).offset(skip).limit(limit).all()

    def count_processed_violations(self) -> int:
        """Đếm số lượng vi phạm đã xử lý"""
        processed_statuses = ['verified', 'processed', 'paid']
        return self.db.query(Violation).filter(
            Violation.status.in_(processed_statuses)
        ).count()

    def get_user_violation_stats(self, license_plates: List[str]) -> Dict[str, Any]:
        """Lấy thống kê vi phạm của user dựa trên danh sách biển số"""
        if not license_plates:
            return {
                "total": 0,
                "unpaid": 0,
                "total_fines": 0.0
            }
        
        violations = self.get_violations_by_vehicles(license_plates)
        total = len(violations)
        unpaid = len([v for v in violations if v.status not in ['paid', 'processed']])
        total_fines = sum(float(v.fine_amount or 0) for v in violations)
        
        return {
            "total": total,
            "unpaid": unpaid,
            "total_fines": total_fines
        }
    
    def create_violation_from_detection(
        self, 
        detection_id: int, 
        officer_id: Optional[int] = None
    ) -> Violation:
        """
        Create a violation record from an approved AI detection.
        
        This method:
        - Converts detection data to violation format
        - Links video evidence to the violation
        - Sets violation status to "ai_detected"
        - Optionally assigns to an officer for review
        
        Requirements: 4.1, 10.1, 10.2
        
        Args:
            detection_id: ID of the AI detection to convert
            officer_id: Optional officer ID to assign for review
            
        Returns:
            Created Violation object
            
        Raises:
            HTTPException: If detection not found or invalid
        """
        from app.models.ai_detection import AIDetection, DetectionType, ReviewStatus
        from app.models.CameraVideo import CameraVideo
        from app.models.camera import Camera
        
        # Get the detection
        detection = self.db.query(AIDetection).filter(
            AIDetection.id == detection_id
        ).first()
        
        if not detection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Detection with ID {detection_id} not found"
            )
        
        # Verify detection is approved and is a violation type
        if detection.review_status != ReviewStatus.APPROVED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Detection must be approved before creating violation. Current status: {detection.review_status.value}"
            )
        
        if detection.detection_type != DetectionType.VIOLATION:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Detection type must be 'violation'. Current type: {detection.detection_type.value}"
            )
        
        # Check if violation already exists for this detection
        if detection.violation_id:
            existing_violation = self.db.query(Violation).filter(
                Violation.id == detection.violation_id
            ).first()
            if existing_violation:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Violation already exists for this detection (ID: {detection.violation_id})"
                )
        
        # Get video and camera information for context
        video = self.db.query(CameraVideo).filter(
            CameraVideo.id == detection.video_id
        ).first()
        
        camera = None
        if video:
            camera = self.db.query(Camera).filter(
                Camera.id == video.camera_id
            ).first()
        
        # Extract violation data from detection
        violation_data = detection.detection_data
        license_plate = violation_data.get('license_plate', 'UNKNOWN')
        violation_type = violation_data.get('violation_type', 'Unknown Violation')
        vehicle_type = violation_data.get('vehicle_type')
        vehicle_color = violation_data.get('vehicle_color')
        vehicle_brand = violation_data.get('vehicle_brand')
        description = violation_data.get('description')
        
        # Prepare evidence images - include video thumbnail and cloudinary URL
        evidence_images = []
        if video:
            if video.thumbnail_url:
                evidence_images.append(video.thumbnail_url)
            if video.cloudinary_url:
                evidence_images.append(video.cloudinary_url)
        
        # Create violation record
        violation = Violation(
            license_plate=license_plate,
            vehicle_type=vehicle_type,
            vehicle_color=vehicle_color,
            vehicle_brand=vehicle_brand,
            violation_type=violation_type,
            violation_description=description,
            location_name=camera.location if camera else None,
            latitude=camera.latitude if camera else None,
            longitude=camera.longitude if camera else None,
            camera_id=str(camera.camera_id) if camera else None,
            video_id=detection.video_id,  # Link video evidence directly
            detected_at=detection.detected_at,
            confidence_score=float(detection.confidence_score),
            evidence_images=evidence_images,
            status="ai_detected",  # Set status to ai_detected as per requirement
            priority="medium",  # Default priority
            ai_metadata={
                'detection_id': detection.id,
                'video_id': detection.video_id,
                'video_url': video.cloudinary_url if video else None,
                'frame_timestamp': float(detection.frame_timestamp),
                'detection_data': violation_data,
                'reviewed_by': detection.reviewed_by,
                'reviewed_at': detection.reviewed_at.isoformat() if detection.reviewed_at else None
            }
        )
        
        # Assign to officer if provided
        if officer_id:
            # Verify officer exists
            officer = self.db.query(User).filter(User.id == officer_id).first()
            if not officer:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Officer with ID {officer_id} not found"
                )
            violation.reviewed_by = officer_id
        
        # Save violation
        self.db.add(violation)
        self.db.flush()
        
        # Link violation back to detection
        detection.violation_id = violation.id
        
        # Update video violation count
        if video:
            video.has_violations = True
            video.violation_count = self.db.query(AIDetection).filter(
                AIDetection.video_id == video.id,
                AIDetection.violation_id.isnot(None)
            ).count()
        
        self.db.commit()
        self.db.refresh(violation)
        
        # Send notification to admins about new violation
        try:
            self.notification_service.notify_admin_new_violation(
                violation_id=violation.id,
                detection_confidence=float(detection.confidence_score)
            )
        except Exception as e:
            logger.error(f"Failed to send admin notification for violation {violation.id}: {e}")
        
        return violation
    
    async def save_violation(frame, detection, frame_index):
        x1, y1, x2, y2 = detection("bbox")
        
        crop = frame[y1:y2, x1:x2]
        filename = f"{datetime.now().timestamp()}_frame{frame_index}.jpg"
        filepath = os.path.join(SAVE_DIR, filename)
        cv2.imwrite(filepath, crop)        
        
        violation = Violation(
            confidence=detection["confidence"],
            time=datetime.now(),
            frame_index=frame_index,
            bbox=BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2),
        )
        
        await violations_collection.insert_one(violation.model_dump())
        
        return violation