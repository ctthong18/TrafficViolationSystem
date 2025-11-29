from sqlalchemy import Column, String, Integer, ForeignKey, Boolean, Text, Enum, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import enum
from .base import Base, TimestampMixin


class ProcessingStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class CameraVideo(Base, TimestampMixin):
    __tablename__ = "camera_videos"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False, index=True)

    # Cloudinary info
    cloudinary_public_id = Column(String(255), nullable=False, unique=True)
    cloudinary_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500))
    
    # Video metadata
    duration = Column(Integer)  # seconds
    file_size = Column(Integer)  # bytes
    format = Column(String(20))  # mp4, avi, mov
    
    # Upload info
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    processed_at = Column(DateTime)
    
    # Processing status
    processing_status = Column(Enum(ProcessingStatus), default=ProcessingStatus.PENDING, nullable=False, index=True)
    
    # Detection results
    has_violations = Column(Boolean, default=False)
    violation_count = Column(Integer, default=0)
    
    # Additional metadata (resolution, fps, codec, etc.)
    video_metadata = Column(JSONB)

    # Relationships
    camera = relationship("Camera", back_populates="videos")
    uploader = relationship("User", foreign_keys=[uploaded_by])
    detections = relationship("AIDetection", back_populates="video", cascade="all, delete-orphan")
    processing_jobs = relationship("VideoProcessingJob", back_populates="video", cascade="all, delete-orphan")

    def get_stream_url(self):
        return self.cloudinary_url
