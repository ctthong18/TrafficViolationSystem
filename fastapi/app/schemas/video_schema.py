"""
Schemas for video management
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class ProcessingStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class JobType(str, Enum):
    UPLOAD = "UPLOAD"
    THUMBNAIL = "THUMBNAIL"


class JobStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class VideoUploadResponse(BaseModel):
    """Response for video upload"""

    video_id: int
    cloudinary_url: str
    thumbnail_url: Optional[str] = None
    processing_job_id: Optional[int] = None
    status: ProcessingStatus

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
    processing_status: ProcessingStatus
    has_violations: bool
    violation_count: int

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat() if v else None}


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
    job_type: JobType
    status: JobStatus
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
    total_duration: float
    violation_count: int


class VideoStatsResponse(BaseModel):
    """Response for video statistics"""

    camera_id: int
    total_videos: int
    total_duration: float  # in seconds
    total_violations: int
    videos_with_violations: int
    avg_duration: float  # in seconds
    stats_by_date: list[VideoStatsByDate]

    class Config:
        from_attributes = True
