from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ComplaintStatus(str, Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review" 
    RESOLVED = "resolved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class ComplaintType(str, Enum):
    VIOLATION_DISPUTE = "violation_dispute"
    FALSE_POSITIVE = "false_positive"
    MISSING_VIOLATION = "missing_violation"
    OFFICER_BEHAVIOR = "officer_behavior"
    SYSTEM_ERROR = "system_error"
    OTHER = "other"

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