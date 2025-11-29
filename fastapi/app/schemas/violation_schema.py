from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal

class ViolationBase(BaseModel):
    license_plate: str
    vehicle_type: Optional[str] = None
    vehicle_color: Optional[str] = None
    vehicle_brand: Optional[str] = None
    violation_type: str
    location_name: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    camera_id: Optional[str] = None

class ViolationCreate(ViolationBase):
    detected_at: datetime
    confidence_score: float
    evidence_images: Optional[List[str]] = None
    ai_metadata: Optional[Dict[str, Any]] = None

class ViolationUpdate(BaseModel):
    status: Optional[str] = None
    reviewed_by: Optional[int] = None
    review_notes: Optional[str] = None
    priority: Optional[str] = None

class ViolationReview(BaseModel):
    action: str  # 'approve' or 'reject'
    notes: Optional[str] = None

class VideoEvidenceInfo(BaseModel):
    """Video evidence information for violation"""
    video_id: int
    cloudinary_url: str
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None
    
    class Config:
        from_attributes = True


class ViolationResponse(ViolationBase):
    id: int
    detected_at: datetime
    confidence_score: float
    status: str
    priority: str
    reviewed_by: Optional[int]
    reviewed_at: Optional[datetime]
    review_notes: Optional[str]
    evidence_images: Optional[List[str]]
    evidence_gif: Optional[str]
    ai_metadata: Optional[Dict[str, Any]]
    violation_description: Optional[str] = None
    fine_amount: Optional[Decimal] = None
    points_deducted: Optional[int] = None
    legal_reference: Optional[str] = None
    video_id: Optional[int] = None
    video_evidence: Optional[VideoEvidenceInfo] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ViolationListResponse(BaseModel):
    violations: List[ViolationResponse]
    total: int
    page: int
    size: int

# For AI processing
class AIProcessingRequest(BaseModel):
    image_data: str  # base64 encoded image
    camera_id: str
    timestamp: datetime

class AIProcessingResponse(BaseModel):
    violation_detected: bool
    confidence_score: float
    violation_type: Optional[str] = None
    license_plate: Optional[str] = None
    vehicle_type: Optional[str] = None
    bounding_boxes: Optional[Dict[str, Any]] = None
    processed_image: Optional[str] = None  # base64