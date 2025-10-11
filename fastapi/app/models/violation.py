from sqlalchemy import Column, String, Integer, DateTime, Text, DECIMAL, JSON, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class Violation(Base, TimestampMixin):
    __tablename__ = "violations"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Thông tin phương tiện & biển số
    license_plate = Column(String(20), nullable=False, index=True)
    vehicle_type = Column(String(50))
    vehicle_color = Column(String(50))
    vehicle_brand = Column(String(100))
    
    # Thông tin vi phạm
    violation_type = Column(String(100), nullable=False)
    violation_description = Column(Text)
    
    # Địa điểm & thời gian
    location_name = Column(String(255))
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))
    camera_id = Column(String(100))
    detected_at = Column(DateTime, nullable=False)
    
    # AI Analysis Results
    confidence_score = Column(DECIMAL(5, 4), nullable=False)
    ai_metadata = Column(JSONB)  # Raw AI output
    evidence_images = Column(JSON)  # Array of image URLs
    evidence_gif = Column(String(500))
    
    # Trạng thái xử lý
    status = Column(String(50), default="pending")  # pending, approved, rejected, processed
    priority = Column(String(20), default="medium")  # low, medium, high
    
    # Officer review
    reviewed_by = Column(Integer, ForeignKey("users.id"))
    reviewed_at = Column(DateTime)
    review_notes = Column(Text)
    
    # Relationships
    payments = relationship("Payment", back_populates="violation")
    evidence = relationship("Evidence", back_populates="violation")
    notifications = relationship("Notification", back_populates="violation")
    complaints = relationship("Complaint", back_populates="violation")

    def __repr__(self):
        return f"<Violation {self.id} - {self.license_plate} - {self.violation_type}>"