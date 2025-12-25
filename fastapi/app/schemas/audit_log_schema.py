import enum
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel


class AuditAction(str, enum.Enum):
    """Types of auditable actions"""

    CREATE = "CREATE"
    READ = "READ"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    UPLOAD = "UPLOAD"
    DOWNLOAD = "DOWNLOAD"
    REVIEW = "REVIEW"
    APPROVE = "APPROVE"
    REJECT = "REJECT"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    FAILED_LOGIN = "FAILED_LOGIN"


class AuditResource(str, enum.Enum):
    """Types of resources that can be audited"""

    VIDEO = "VIDEO"
    DETECTION = "DETECTION"
    VIOLATION = "VIOLATION"
    USER = "USER"
    CAMERA = "CAMERA"
    AI_CONFIG = "AI_CONFIG"
    SYSTEM = "SYSTEM"


class AuditLogBase(BaseModel):
    user_id: Optional[int] = None
    action: AuditAction
    resource: AuditResource
    resource_id: Optional[int] = None
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    status: str = "success"


class AuditLogResponse(AuditLogBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    logs: List[AuditLogResponse]
    total: int
    page: int
    size: int
