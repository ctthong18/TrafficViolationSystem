from sqlalchemy import Column, String, Integer, DateTime, Text, DECIMAL, Date, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin


class Camera(Base, TimestampMixin):
    __tablename__ = "cameras"
    
    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String(100), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    location_name = Column(String(255))
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))
    address = Column(Text)
    
    # Camera specifications
    camera_type = Column(String(100))
    resolution = Column(String(50))
    status = Column(String(50), default="online")
    
    # AI Configuration
    enabled_detections = Column(JSONB)
    ai_model_version = Column(String(100))
    confidence_threshold = Column(DECIMAL(5, 4), default=0.7)
    
    # Maintenance info
    last_maintenance = Column(Date)
    next_maintenance = Column(Date)
    
    violations = relationship("Violation", back_populates="camera")
    videos = relationship("CameraVideo", back_populates="camera")
    
    def __repr__(self):
        return f"<Camera {self.camera_id} - {self.location_name}>"