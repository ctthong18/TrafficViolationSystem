from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class DenunciationStatus(str, Enum):
    PENDING = "pending"
    VERIFYING = "verifying"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    REJECTED = "rejected"
    TRANSFERRED = "transferred"

class DenunciationType(str, Enum):
    CORRUPTION = "corruption"
    ABUSE_OF_POWER = "abuse_of_power"
    VIOLATION_COVER_UP = "violation_cover_up"
    FRAUD = "fraud"
    SYSTEM_MANIPULATION = "system_manipulation"
    OTHER_ILLEGAL = "other_illegal"

class DenunciationBase(BaseModel):
    title: str
    description: str
    denunciation_type: DenunciationType
    is_anonymous: bool = True
    contact_preference: Optional[str] = None
    can_contact: bool = False

class DenunciationCreate(DenunciationBase):
    informant_name: Optional[str] = None
    informant_phone: Optional[str] = None
    informant_email: Optional[str] = None
    informant_identification: Optional[str] = None
    informant_address: Optional[str] = None
    accused_person_name: Optional[str] = None
    accused_person_position: Optional[str] = None
    accused_department: Optional[str] = None
    related_violation_id: Optional[int] = None
    related_user_id: Optional[int] = None
    evidence_urls: Optional[List[str]] = None
    severity_level: str = "medium"
    urgency_level: str = "normal"
    is_whistleblower: bool = False

class DenunciationUpdate(BaseModel):
    status: Optional[DenunciationStatus] = None
    assigned_investigator_id: Optional[int] = None
    investigation_notes: Optional[str] = None
    resolution: Optional[str] = None
    security_level: Optional[str] = None

class DenunciationResponse(DenunciationBase):
    id: int
    denunciation_code: str
    status: DenunciationStatus
    severity_level: str
    urgency_level: str
    informant_name: Optional[str]
    informant_phone: Optional[str]
    informant_email: Optional[str]
    accused_person_name: Optional[str]
    accused_person_position: Optional[str]
    accused_department: Optional[str]
    related_violation_id: Optional[int]
    related_user_id: Optional[int]
    assigned_investigator_id: Optional[int]
    assigned_at: Optional[datetime]
    resolved_at: Optional[datetime]
    investigation_notes: Optional[str]
    resolution: Optional[str]
    security_level: str
    is_whistleblower: bool
    transferred_to: Optional[str]
    transfer_reason: Optional[str]
    transferred_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DenunciationListResponse(BaseModel):
    denunciations: List[DenunciationResponse]
    total: int
    page: int
    size: int

class DenunciationActivityResponse(BaseModel):
    id: int
    activity_type: str
    description: str
    performed_by: Optional[int]
    performed_at: datetime

    class Config:
        from_attributes = True

class DenunciationStatsResponse(BaseModel):
    total_denunciations: int
    by_status: dict
    by_type: dict
    by_severity: dict
    resolution_rate: float
    average_processing_time: float

class DenunciationExportResponse(BaseModel):
    denunciation_code: str
    type: str
    title: str
    status: str
    severity: str
    created_at: datetime
    resolved_at: Optional[datetime]
    assigned_investigator: Optional[str]
    is_anonymous: bool
    security_level: str