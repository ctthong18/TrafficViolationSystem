import enum
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class NotificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    DELIVERED = "DELIVERED"
    FAILED = "FAILED"
    READ = "READ"


class NotificationChannel(str, enum.Enum):
    EMAIL = "EMAIL"
    SMS = "SMS"
    APP_PUSH = "APP_PUSH"
    WEB_PUSH = "WEB_PUSH"
    SYSTEM = "SYSTEM"


class NotificationType(str, enum.Enum):
    VIOLATION_ALERT = "VIOLATION_ALERT"
    PAYMENT_REMINDER = "PAYMENT_REMINDER"
    PAYMENT_CONFIRMATION = "PAYMENT_CONFIRMATION"
    COMPLAINT_UPDATE = "COMPLAINT_UPDATE"
    APPEAL_RESULT = "APPEAL_RESULT"
    SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT"
    SECURITY_ALERT = "SECURITY_ALERT"


class NotificationBase(BaseModel):
    """Base notification schema"""

    title: str
    message: str
    short_message: Optional[str] = None
    channel: NotificationChannel
    priority: str = "MEDIUM"


class NotificationCreate(NotificationBase):
    """Schema for creating a notification"""

    recipient_id: int
    recipient_name: Optional[str] = None
    recipient_email: Optional[str] = None
    recipient_phone: Optional[str] = None
    violation_id: Optional[int] = None
    payment_id: Optional[int] = None
    complaint_id: Optional[int] = None
    template_variables: Optional[Dict[str, Any]] = None


class NotificationResponse(BaseModel):
    """Schema for notification response"""

    id: int
    notification_code: str
    recipient_id: int
    recipient_name: Optional[str] = None
    title: str
    message: str
    short_message: Optional[str] = None
    channel: NotificationChannel
    status: NotificationStatus
    priority: str
    violation_id: Optional[int] = None
    payment_id: Optional[int] = None
    complaint_id: Optional[int] = None
    sent_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    template_variables: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    """Schema for paginated notification list"""

    notifications: List[NotificationResponse]
    total: int
    unread_count: int
    page: int
    size: int


class NotificationMarkReadRequest(BaseModel):
    """Schema for marking notification as read"""

    notification_id: int


class NotificationCountResponse(BaseModel):
    """Schema for notification count response"""

    unread_count: int
