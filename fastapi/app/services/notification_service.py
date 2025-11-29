"""
Notification Service for AI Camera System

This service handles:
- Notifying admin when new violations detected
- Notifying officer when assigned to review
- Notifying uploader when processing complete

Requirements: 4.5, 5.5
"""

import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.notification import Notification, NotificationStatus, NotificationChannel
from app.models.notification_template import NotificationTemplate, NotificationType
from app.models.user import User, Role
from app.models.violation import Violation
from app.models.CameraVideo import CameraVideo
from app.models.video_processing_job import VideoProcessingJob

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for managing notifications in the AI Camera System."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def notify_admin_new_violation(
        self,
        violation_id: int,
        detection_confidence: Optional[float] = None
    ) -> List[Notification]:
        """
        Notify admin when new violations are detected by AI.
        
        This method:
        - Finds all admin users
        - Creates system notifications for each admin
        - Includes violation details and confidence score
        
        Args:
            violation_id: ID of the newly detected violation
            detection_confidence: AI confidence score (0.0 - 1.0)
        
        Returns:
            List of created Notification objects
        
        Requirements: 4.5
        """
        try:
            # Get violation details
            violation = self.db.query(Violation).filter(
                Violation.id == violation_id
            ).first()
            
            if not violation:
                logger.error(f"Violation {violation_id} not found")
                return []
            
            # Get all admin users
            admins = self.db.query(User).filter(
                User.role == Role.ADMIN.value,
                User.is_active == True
            ).all()
            
            if not admins:
                logger.warning("No active admin users found to notify")
                return []
            
            notifications = []
            
            # Create notification for each admin
            for admin in admins:
                # Generate notification code
                notification_code = self._generate_notification_code()
                
                # Build notification message
                confidence_text = f" (Độ tin cậy: {detection_confidence:.1%})" if detection_confidence else ""
                title = f"Vi phạm mới được phát hiện{confidence_text}"
                message = (
                    f"Hệ thống AI đã phát hiện vi phạm mới:\n"
                    f"- Loại: {violation.violation_type}\n"
                    f"- Biển số: {violation.license_plate}\n"
                    f"- Địa điểm: {violation.location_name or 'N/A'}\n"
                    f"- Thời gian: {violation.detected_at.strftime('%d/%m/%Y %H:%M')}\n"
                    f"- Trạng thái: {violation.status}"
                )
                short_message = f"Vi phạm mới: {violation.violation_type} - {violation.license_plate}"
                
                notification = Notification(
                    notification_code=notification_code,
                    recipient_id=admin.id,
                    recipient_name=admin.full_name,
                    recipient_email=admin.email,
                    title=title,
                    message=message,
                    short_message=short_message,
                    channel=NotificationChannel.SYSTEM,
                    status=NotificationStatus.SENT,
                    priority="high",
                    violation_id=violation_id,
                    sent_at=datetime.utcnow(),
                    template_variables={
                        'violation_type': violation.violation_type,
                        'license_plate': violation.license_plate,
                        'location': violation.location_name,
                        'detected_at': violation.detected_at.isoformat(),
                        'confidence': detection_confidence
                    }
                )
                
                self.db.add(notification)
                notifications.append(notification)
            
            self.db.commit()
            
            logger.info(f"Created {len(notifications)} admin notifications for violation {violation_id}")
            
            return notifications
            
        except Exception as e:
            logger.error(f"Error notifying admin about new violation: {e}")
            self.db.rollback()
            return []
    
    def notify_officer_assignment(
        self,
        violation_id: int,
        officer_id: int,
        assigned_by: Optional[int] = None
    ) -> Optional[Notification]:
        """
        Notify officer when assigned to review a violation.
        
        This method:
        - Creates a notification for the assigned officer
        - Includes violation details and assignment context
        - Sets priority based on violation urgency
        
        Args:
            violation_id: ID of the violation to review
            officer_id: ID of the officer being assigned
            assigned_by: Optional ID of user who made the assignment
        
        Returns:
            Created Notification object or None if failed
        
        Requirements: 4.5
        """
        try:
            # Get violation details
            violation = self.db.query(Violation).filter(
                Violation.id == violation_id
            ).first()
            
            if not violation:
                logger.error(f"Violation {violation_id} not found")
                return None
            
            # Get officer details
            officer = self.db.query(User).filter(
                User.id == officer_id,
                User.role == Role.OFFICER.value,
                User.is_active == True
            ).first()
            
            if not officer:
                logger.error(f"Officer {officer_id} not found or not active")
                return None
            
            # Get assigner details if provided
            assigner_name = "Hệ thống"
            if assigned_by:
                assigner = self.db.query(User).filter(User.id == assigned_by).first()
                if assigner:
                    assigner_name = assigner.full_name
            
            # Generate notification code
            notification_code = self._generate_notification_code()
            
            # Build notification message
            title = f"Bạn được phân công xử lý vi phạm"
            message = (
                f"Bạn đã được {assigner_name} phân công xử lý vi phạm:\n"
                f"- Mã vi phạm: #{violation.id}\n"
                f"- Loại: {violation.violation_type}\n"
                f"- Biển số: {violation.license_plate}\n"
                f"- Địa điểm: {violation.location_name or 'N/A'}\n"
                f"- Thời gian phát hiện: {violation.detected_at.strftime('%d/%m/%Y %H:%M')}\n"
                f"- Độ ưu tiên: {violation.priority}\n\n"
                f"Vui lòng xem xét và xử lý vi phạm này."
            )
            short_message = f"Phân công: {violation.violation_type} - {violation.license_plate}"
            
            # Set priority based on violation priority
            priority_map = {
                'urgent': 'urgent',
                'high': 'high',
                'medium': 'medium',
                'low': 'low'
            }
            notification_priority = priority_map.get(violation.priority, 'medium')
            
            notification = Notification(
                notification_code=notification_code,
                recipient_id=officer.id,
                recipient_name=officer.full_name,
                recipient_email=officer.email,
                recipient_phone=officer.phone_number,
                title=title,
                message=message,
                short_message=short_message,
                channel=NotificationChannel.SYSTEM,
                status=NotificationStatus.SENT,
                priority=notification_priority,
                violation_id=violation_id,
                sent_at=datetime.utcnow(),
                template_variables={
                    'violation_id': violation_id,
                    'violation_type': violation.violation_type,
                    'license_plate': violation.license_plate,
                    'location': violation.location_name,
                    'detected_at': violation.detected_at.isoformat(),
                    'priority': violation.priority,
                    'assigned_by': assigner_name
                }
            )
            
            self.db.add(notification)
            self.db.commit()
            self.db.refresh(notification)
            
            logger.info(f"Created officer assignment notification for officer {officer_id}, violation {violation_id}")
            
            return notification
            
        except Exception as e:
            logger.error(f"Error notifying officer about assignment: {e}")
            self.db.rollback()
            return None
    
    def notify_uploader_processing_complete(
        self,
        video_id: int,
        job_id: int,
        success: bool = True,
        error_message: Optional[str] = None
    ) -> Optional[Notification]:
        """
        Notify uploader when video processing is complete.
        
        This method:
        - Notifies the user who uploaded the video
        - Includes processing results (success/failure)
        - Provides summary of detections if successful
        
        Args:
            video_id: ID of the processed video
            job_id: ID of the processing job
            success: Whether processing was successful
            error_message: Optional error message if failed
        
        Returns:
            Created Notification object or None if failed
        
        Requirements: 5.5
        """
        try:
            # Get video details
            video = self.db.query(CameraVideo).filter(
                CameraVideo.id == video_id
            ).first()
            
            if not video:
                logger.error(f"Video {video_id} not found")
                return None
            
            # Get uploader details
            if not video.uploaded_by:
                logger.warning(f"Video {video_id} has no uploader")
                return None
            
            uploader = self.db.query(User).filter(
                User.id == video.uploaded_by,
                User.is_active == True
            ).first()
            
            if not uploader:
                logger.error(f"Uploader {video.uploaded_by} not found or not active")
                return None
            
            # Get job details
            job = self.db.query(VideoProcessingJob).filter(
                VideoProcessingJob.id == job_id
            ).first()
            
            # Generate notification code
            notification_code = self._generate_notification_code()
            
            # Build notification message based on success/failure
            if success:
                title = "Xử lý video hoàn tất"
                
                # Get detection summary
                detection_summary = ""
                if video.has_violations:
                    detection_summary = f"\n- Phát hiện: {video.violation_count} vi phạm"
                
                processing_time = ""
                if job and job.started_at and job.completed_at:
                    duration = (job.completed_at - job.started_at).total_seconds()
                    processing_time = f"\n- Thời gian xử lý: {duration:.1f} giây"
                
                message = (
                    f"Video của bạn đã được xử lý thành công:\n"
                    f"- Tên video: Video #{video.id}\n"
                    f"- Camera: {video.camera.location if video.camera else 'N/A'}\n"
                    f"- Thời lượng: {video.duration} giây"
                    f"{detection_summary}"
                    f"{processing_time}\n\n"
                    f"Bạn có thể xem video và kết quả phát hiện trong hệ thống."
                )
                short_message = f"Video #{video.id} đã xử lý xong"
                priority = "medium"
                
            else:
                title = "Xử lý video thất bại"
                message = (
                    f"Không thể xử lý video của bạn:\n"
                    f"- Tên video: Video #{video.id}\n"
                    f"- Camera: {video.camera.location if video.camera else 'N/A'}\n"
                    f"- Lỗi: {error_message or 'Lỗi không xác định'}\n\n"
                    f"Vui lòng thử lại hoặc liên hệ quản trị viên."
                )
                short_message = f"Video #{video.id} xử lý thất bại"
                priority = "high"
            
            notification = Notification(
                notification_code=notification_code,
                recipient_id=uploader.id,
                recipient_name=uploader.full_name,
                recipient_email=uploader.email,
                recipient_phone=uploader.phone_number,
                title=title,
                message=message,
                short_message=short_message,
                channel=NotificationChannel.SYSTEM,
                status=NotificationStatus.SENT,
                priority=priority,
                sent_at=datetime.utcnow(),
                template_variables={
                    'video_id': video_id,
                    'job_id': job_id,
                    'success': success,
                    'error_message': error_message,
                    'violation_count': video.violation_count if success else 0,
                    'duration': video.duration
                }
            )
            
            self.db.add(notification)
            self.db.commit()
            self.db.refresh(notification)
            
            logger.info(f"Created processing complete notification for uploader {uploader.id}, video {video_id}")
            
            return notification
            
        except Exception as e:
            logger.error(f"Error notifying uploader about processing completion: {e}")
            self.db.rollback()
            return None
    
    def get_user_notifications(
        self,
        user_id: int,
        unread_only: bool = False,
        skip: int = 0,
        limit: int = 50
    ) -> List[Notification]:
        """
        Get notifications for a specific user.
        
        Args:
            user_id: ID of the user
            unread_only: If True, only return unread notifications
            skip: Number of records to skip (pagination)
            limit: Maximum number of records to return
        
        Returns:
            List of Notification objects
        """
        query = self.db.query(Notification).filter(
            Notification.recipient_id == user_id
        )
        
        if unread_only:
            query = query.filter(Notification.read_at.is_(None))
        
        notifications = query.order_by(
            Notification.created_at.desc()
        ).offset(skip).limit(limit).all()
        
        return notifications
    
    def mark_notification_read(
        self,
        notification_id: int,
        user_id: int
    ) -> Optional[Notification]:
        """
        Mark a notification as read.
        
        Args:
            notification_id: ID of the notification
            user_id: ID of the user (for verification)
        
        Returns:
            Updated Notification object or None if not found
        """
        try:
            notification = self.db.query(Notification).filter(
                Notification.id == notification_id,
                Notification.recipient_id == user_id
            ).first()
            
            if not notification:
                return None
            
            if not notification.read_at:
                notification.read_at = datetime.utcnow()
                notification.status = NotificationStatus.READ
                self.db.commit()
                self.db.refresh(notification)
            
            return notification
            
        except Exception as e:
            logger.error(f"Error marking notification as read: {e}")
            self.db.rollback()
            return None
    
    def count_unread_notifications(self, user_id: int) -> int:
        """
        Count unread notifications for a user.
        
        Args:
            user_id: ID of the user
        
        Returns:
            Number of unread notifications
        """
        return self.db.query(Notification).filter(
            Notification.recipient_id == user_id,
            Notification.read_at.is_(None)
        ).count()
    
    def _generate_notification_code(self) -> str:
        """
        Generate a unique notification code.
        
        Returns:
            Notification code in format: NTF-YYYYMMDD-NNNN
        """
        from datetime import datetime
        
        # Get current date
        date_str = datetime.now().strftime('%Y%m%d')
        
        # Count notifications created today
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        count = self.db.query(Notification).filter(
            Notification.created_at >= today_start
        ).count()
        
        # Generate code
        code = f"NTF-{date_str}-{count + 1:04d}"
        
        return code
    
    def send_violation_notification(self, violation_id: int):
        """Legacy method - redirects to notify_admin_new_violation"""
        return self.notify_admin_new_violation(violation_id)
    
    def send_payment_reminder(self, payment_id: int):
        """Legacy method - placeholder for future payment reminders"""
        pass