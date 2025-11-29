"""
Audit Log Model
Tracks security-relevant events and user actions
"""
from sqlalchemy import Column, Integer, String, DateTime, JSON, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class AuditAction(str, enum.Enum):
    """Types of auditable actions"""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    UPLOAD = "upload"
    DOWNLOAD = "download"
    REVIEW = "review"
    APPROVE = "approve"
    REJECT = "reject"
    LOGIN = "login"
    LOGOUT = "logout"
    FAILED_LOGIN = "failed_login"


class AuditResource(str, enum.Enum):
    """Types of resources that can be audited"""
    VIDEO = "video"
    DETECTION = "detection"
    VIOLATION = "violation"
    USER = "user"
    CAMERA = "camera"
    AI_CONFIG = "ai_config"
    SYSTEM = "system"


class AuditLog(Base):
    """
    Audit log for tracking security-relevant events
    
    Stores information about who did what, when, and from where
    """
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Who performed the action
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # What action was performed
    action = Column(SQLEnum(AuditAction), nullable=False, index=True)
    
    # What resource was affected
    resource = Column(SQLEnum(AuditResource), nullable=False, index=True)
    resource_id = Column(Integer, nullable=True, index=True)
    
    # Additional context
    details = Column(JSON, nullable=True)
    
    # Request metadata
    ip_address = Column(String(45), nullable=True)  # IPv6 max length
    user_agent = Column(String(500), nullable=True)
    
    # Status of the action
    status = Column(String(20), nullable=False, default="success", index=True)
    
    # When it happened
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    
    def __repr__(self):
        return (
            f"<AuditLog(id={self.id}, user_id={self.user_id}, "
            f"action={self.action}, resource={self.resource}, "
            f"resource_id={self.resource_id}, timestamp={self.timestamp})>"
        )
