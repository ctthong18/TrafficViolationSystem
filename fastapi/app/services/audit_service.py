"""
Audit Logging Service
Tracks security-relevant events and user actions for compliance and security monitoring
"""
import logging
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog, AuditAction, AuditResource

logger = logging.getLogger(__name__)


class AuditService:
    """Service for logging security and user actions"""
    
    @staticmethod
    def log_action(
        db: Session,
        user_id: Optional[int],
        action: AuditAction,
        resource: AuditResource,
        resource_id: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        status: str = "success"
    ) -> AuditLog:
        """
        Log an audit event
        
        Args:
            db: Database session
            user_id: ID of user performing action (None for anonymous)
            action: Type of action performed
            resource: Type of resource affected
            resource_id: ID of specific resource
            details: Additional context about the action
            ip_address: Client IP address
            user_agent: Client user agent
            status: Action status (success, failure, error)
            
        Returns:
            Created audit log entry
        """
        try:
            audit_log = AuditLog(
                user_id=user_id,
                action=action,
                resource=resource,
                resource_id=resource_id,
                details=details or {},
                ip_address=ip_address,
                user_agent=user_agent,
                status=status,
                timestamp=datetime.utcnow()
            )
            
            db.add(audit_log)
            db.commit()
            db.refresh(audit_log)
            
            logger.info(
                f"Audit log created: user={user_id}, action={action.value}, "
                f"resource={resource.value}, resource_id={resource_id}, status={status}"
            )
            
            return audit_log
            
        except Exception as e:
            logger.error(f"Failed to create audit log: {str(e)}")
            db.rollback()
            # Don't raise exception - audit logging should not break main flow
            return None
    
    @staticmethod
    def log_video_upload(
        db: Session,
        user_id: int,
        video_id: int,
        camera_id: int,
        file_size: int,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        status: str = "success"
    ):
        """Log video upload action"""
        return AuditService.log_action(
            db=db,
            user_id=user_id,
            action=AuditAction.UPLOAD,
            resource=AuditResource.VIDEO,
            resource_id=video_id,
            details={
                "camera_id": camera_id,
                "file_size": file_size
            },
            ip_address=ip_address,
            user_agent=user_agent,
            status=status
        )
    
    @staticmethod
    def log_video_delete(
        db: Session,
        user_id: int,
        video_id: int,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        status: str = "success"
    ):
        """Log video deletion action"""
        return AuditService.log_action(
            db=db,
            user_id=user_id,
            action=AuditAction.DELETE,
            resource=AuditResource.VIDEO,
            resource_id=video_id,
            ip_address=ip_address,
            user_agent=user_agent,
            status=status
        )
    
    @staticmethod
    def log_detection_review(
        db: Session,
        user_id: int,
        detection_id: int,
        review_action: str,
        violation_created: bool = False,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        status: str = "success"
    ):
        """Log detection review action"""
        return AuditService.log_action(
            db=db,
            user_id=user_id,
            action=AuditAction.REVIEW,
            resource=AuditResource.DETECTION,
            resource_id=detection_id,
            details={
                "review_action": review_action,
                "violation_created": violation_created
            },
            ip_address=ip_address,
            user_agent=user_agent,
            status=status
        )
    
    @staticmethod
    def log_ai_config_change(
        db: Session,
        user_id: int,
        config_id: int,
        changes: Dict[str, Any],
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        status: str = "success"
    ):
        """Log AI configuration changes"""
        return AuditService.log_action(
            db=db,
            user_id=user_id,
            action=AuditAction.UPDATE,
            resource=AuditResource.AI_CONFIG,
            resource_id=config_id,
            details={"changes": changes},
            ip_address=ip_address,
            user_agent=user_agent,
            status=status
        )
    
    @staticmethod
    def log_failed_upload(
        db: Session,
        user_id: Optional[int],
        reason: str,
        file_name: Optional[str] = None,
        file_size: Optional[int] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Log failed upload attempt"""
        return AuditService.log_action(
            db=db,
            user_id=user_id,
            action=AuditAction.UPLOAD,
            resource=AuditResource.VIDEO,
            details={
                "reason": reason,
                "file_name": file_name,
                "file_size": file_size
            },
            ip_address=ip_address,
            user_agent=user_agent,
            status="failure"
        )


# Singleton instance
audit_service = AuditService()
