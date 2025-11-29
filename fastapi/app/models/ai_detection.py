from sqlalchemy import Column, String, Integer, ForeignKey, Boolean, DateTime, DECIMAL, Enum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import enum
from .base import Base, TimestampMixin


class DetectionType(enum.Enum):
    LICENSE_PLATE = "license_plate"
    VEHICLE_COUNT = "vehicle_count"
    VIOLATION = "violation"
    FRAME = "frame"  # Frame detection với tất cả bounding boxes


class ReviewStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class AIDetection(Base, TimestampMixin):
    __tablename__ = "ai_detections"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("camera_videos.id"), nullable=False, index=True)
    
    # Detection info
    detection_type = Column(Enum(DetectionType), nullable=False, index=True)
    detected_at = Column(DateTime, nullable=False, index=True)
    frame_timestamp = Column(DECIMAL(10, 3), nullable=False)  # seconds in video
    confidence_score = Column(DECIMAL(5, 4), nullable=False)  # 0.0 - 1.0
    
    # Detection data
    # For license_plate: {plate_number, vehicle_type, bbox}
    # For vehicle_count: {car: 5, motorcycle: 10, truck: 2}
    # For violation: {violation_type, description, bbox}
    detection_data = Column(JSONB, nullable=False)
    
    # Link to violation if created
    violation_id = Column(Integer, ForeignKey("violations.id"), index=True)
    
    # Review info
    reviewed = Column(Boolean, default=False, index=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"))
    reviewed_at = Column(DateTime)
    review_status = Column(Enum(ReviewStatus), default=ReviewStatus.PENDING, nullable=False, index=True)
    review_notes = Column(String(1000))

    # Relationships
    video = relationship("CameraVideo", back_populates="detections")
    violation = relationship("Violation")
    reviewer = relationship("User", foreign_keys=[reviewed_by])

    def __repr__(self):
        return f"<AIDetection {self.id} - {self.detection_type.value} - {self.confidence_score}>"
