"""
Schemas for video management
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ProcessingStatusEnum(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class JobTypeEnum(str, Enum):
    UPLOAD = "upload"
    AI_ANALYSIS = "ai_analysis"
    THUMBNAIL = "thumbnail"


class JobStatusEnum(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class VideoUploadResponse(BaseModel):
    """Response for video upload"""
    video_id: int
    cloudinary_url: str
    thumbnail_url: Optional[str] = None
    processing_job_id: int
    status: ProcessingStatusEnum
    
    class Config:
        from_attributes = True


class VideoResponse(BaseModel):
    """Response for video details"""
    id: int
    camera_id: int
    cloudinary_public_id: str
    cloudinary_url: str
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None
    file_size: Optional[int] = None
    format: Optional[str] = None
    uploaded_by: int
    uploaded_at: datetime  # Maps to created_at from model
    processed_at: Optional[datetime] = None
    processing_status: ProcessingStatusEnum
    has_violations: bool
    violation_count: int
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class VideoListResponse(BaseModel):
    """Response for video list"""
    videos: list[VideoResponse]
    total: int
    page: int
    size: int


class ProcessingJobResponse(BaseModel):
    """Response for processing job"""
    id: int
    video_id: int
    job_type: JobTypeEnum
    status: JobStatusEnum
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    retry_count: int
    
    class Config:
        from_attributes = True


class VideoStatsByDate(BaseModel):
    """Video statistics grouped by date"""
    date: str
    video_count: int
    total_duration: int
    violation_count: int


class VideoStatsResponse(BaseModel):
    """Response for video statistics"""
    total_videos: int
    total_duration: int  # in seconds
    total_violations: int
    videos_with_violations: int
    avg_duration: float  # in seconds
    by_date: list[VideoStatsByDate]
    
    class Config:
        from_attributes = True


class VideoAnalysisResponse(BaseModel):
    """Response for video analysis request"""
    job_id: int
    status: str
    video_id: int
    message: str


class DetectionTypeEnum(str, Enum):
    LICENSE_PLATE = "license_plate"
    VEHICLE_COUNT = "vehicle_count"
    VIOLATION = "violation"


class ReviewStatusEnum(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class DetectionResponse(BaseModel):
    """Response for a single detection"""
    id: int
    video_id: int
    detection_type: DetectionTypeEnum
    timestamp: float
    confidence: float
    data: dict
    detected_at: str
    reviewed: bool
    review_status: Optional[ReviewStatusEnum] = None
    violation_id: Optional[int] = None
    
    class Config:
        from_attributes = True


class VideoDetectionsResponse(BaseModel):
    """Response for video detections list"""
    video_id: int
    total_detections: int
    detections: List[DetectionResponse]


class PendingDetectionsResponse(BaseModel):
    """Response for pending detections list"""
    detections: List[DetectionResponse]
    total: int
    page: int
    size: int


class DetectionReviewRequest(BaseModel):
    """Request for reviewing a detection"""
    action: str = Field(..., description="Action to take: 'approve', 'reject', or 'modify'")
    notes: Optional[str] = Field(None, description="Review notes from officer")
    modified_data: Optional[dict] = Field(None, description="Modified detection data (for 'modify' action)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "action": "approve",
                "notes": "Violation confirmed, clear evidence",
                "modified_data": None
            }
        }


class DetectionReviewResponse(BaseModel):
    """Response for detection review"""
    detection: DetectionResponse
    violation_created: bool
    violation_id: Optional[int] = None
    message: str


class VideosByPeriod(BaseModel):
    """Videos processed per period"""
    date: str
    total_videos: int
    processed: int
    failed: int
    pending: int


class DetectionAccuracy(BaseModel):
    """Detection accuracy metrics"""
    total_reviewed: int
    approved: int
    rejected: int
    accuracy_rate: float
    pending_review: int


class ViolationType(BaseModel):
    """Violation type statistics"""
    violation_type: str
    count: int
    avg_confidence: float


class CameraPerformance(BaseModel):
    """Camera performance metrics"""
    camera_id: int
    camera_name: str
    location: str
    total_videos: int
    processed_videos: int
    total_violations: int
    avg_video_duration: float
    processing_rate: float


class AnalyticsSummary(BaseModel):
    """Summary statistics for analytics"""
    total_videos: int
    completed_videos: int
    failed_videos: int
    pending_videos: int
    processing_success_rate: float
    total_detections: int
    detection_accuracy_rate: float
    date_range: dict


class VideoAnalyticsResponse(BaseModel):
    """Response for video analytics"""
    summary: AnalyticsSummary
    videos_per_period: List[VideosByPeriod]
    detection_accuracy: DetectionAccuracy
    top_violation_types: List[ViolationType]
    camera_performance: List[CameraPerformance]
