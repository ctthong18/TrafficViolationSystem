from sqlalchemy import Column, String, Integer, DateTime, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class Evidence(Base, TimestampMixin):
    __tablename__ = "evidence"
    
    id = Column(Integer, primary_key=True, index=True)
    violation_id = Column(Integer, ForeignKey("violations.id"), index=True)
    
    # Evidence files
    image_urls = Column(JSON)  # Array of image URLs
    video_url = Column(String(500))
    gif_url = Column(String(500))
    
    # AI Processing data
    raw_detection_data = Column(JSONB)
    processed_data = Column(JSONB)
    
    # Metadata
    file_sizes = Column(JSON)
    storage_location = Column(String(100))
    
    # Relationships
    violation = relationship("Violation", back_populates="evidence")
    
    def __repr__(self):
        return f"<Evidence for Violation {self.violation_id}>"