from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, EmailStr


class ComplaintStatus(str, Enum):
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"


class ComplaintType(str, Enum):
    VIOLATION_DISPUTE = "VIOLATION_DISPUTE"
    FALSE_POSITIVE = "FALSE_POSITIVE"
    MISSING_VIOLATION = "MISSING_VIOLATION"
    OFFICER_BEHAVIOR = "OFFICER_BEHAVIOR"
    SYSTEM_ERROR = "SYSTEM_ERROR"
    OTHER = "OTHER"


class ComplaintBase(BaseModel):
    title: str
    description: str
    complaint_type: ComplaintType
    desired_resolution: Optional[str] = None
    is_anonymous: bool = False


class ComplaintCreate(ComplaintBase):
    violation_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    evidence_urls: Optional[List[str]] = None


class ComplaintUpdate(BaseModel):
    status: Optional[ComplaintStatus] = None
    assigned_officer_id: Optional[int] = None
    resolution: Optional[str] = None
    resolution_notes: Optional[str] = None


class ComplaintResponse(ComplaintBase):
    id: int
    complaint_code: str
    status: ComplaintStatus
    priority: str
    complainant_name: Optional[str]
    complainant_phone: Optional[str]
    complainant_email: Optional[str]
    violation_id: Optional[int]
    vehicle_id: Optional[int]
    assigned_officer_id: Optional[int]
    assigned_at: Optional[datetime]
    resolved_at: Optional[datetime]
    user_rating: Optional[int]
    user_feedback: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ComplaintListResponse(BaseModel):
    complaints: List[ComplaintResponse]
    total: int
    page: int
    size: int


# Appeal Schemas
class AppealStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class AppealBase(BaseModel):
    appeal_reason: str
    new_evidence_urls: Optional[List[str]] = None


class AppealCreate(AppealBase):
    complaint_id: int


class AppealResponse(AppealBase):
    id: int
    appeal_code: str
    complaint_id: int
    status: AppealStatus
    reviewed_by: Optional[int]
    reviewed_at: Optional[datetime]
    review_notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Complaint Activity Schema
class ComplaintActivityResponse(BaseModel):
    id: int
    activity_type: str
    description: str
    performed_by: Optional[int]
    performed_at: datetime

    class Config:
        from_attributes = True
