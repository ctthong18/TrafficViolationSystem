from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Enum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import enum
from .base import Base, TimestampMixin


class JobType(enum.Enum):
    UPLOAD = "upload"
    AI_ANALYSIS = "ai_analysis"
    THUMBNAIL = "thumbnail"


class JobStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class VideoProcessingJob(Base, TimestampMixin):
    __tablename__ = "video_processing_jobs"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("camera_videos.id"), nullable=False, index=True)
    
    # Job info
    job_type = Column(Enum(JobType), nullable=False, index=True)
    status = Column(Enum(JobStatus), default=JobStatus.PENDING, nullable=False, index=True)
    
    # Timing
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    # Error handling
    error_message = Column(String(1000))
    retry_count = Column(Integer, default=0)
    
    # Result data
    result_data = Column(JSONB)

    # Relationships
    video = relationship("CameraVideo", back_populates="processing_jobs")

    def __repr__(self):
        return f"<VideoProcessingJob {self.id} - {self.job_type.value} - {self.status.value}>"
