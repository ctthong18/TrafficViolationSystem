from sqlalchemy import Column, String, Integer, DateTime, Text, DECIMAL, ForeignKey, Boolean, JSON
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
    
    # Liên kết với GPLX (nếu xác định được)
    driving_license_id = Column(Integer, ForeignKey("driving_licenses.id"))
    
    # Thông tin vi phạm
    violation_type = Column(String(100), nullable=False)
    violation_description = Column(Text)
    
    # Điểm trừ và tiền phạt
    points_deducted = Column(Integer, default=0)  # Điểm trừ theo quy định
    fine_amount = Column(DECIMAL(15, 2))  # Tiền phạt
    legal_reference = Column(String(500))  # Căn cứ pháp lý
    
    # Các trường khác giữ nguyên...
    location_name = Column(String(255))
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))
    camera_id = Column(String(100))
    detected_at = Column(DateTime, nullable=False)
    
    # AI Analysis Results
    confidence_score = Column(DECIMAL(5, 4), nullable=False)
    ai_metadata = Column(JSONB)
    evidence_images = Column(JSON)
    evidence_gif = Column(String(500))
    
    # Trạng thái xử lý
    status = Column(String(50), default="pending")
    priority = Column(String(20), default="medium")
    
    # Officer review
    reviewed_by = Column(Integer, ForeignKey("users.id"))
    reviewed_at = Column(DateTime)
    review_notes = Column(Text)
    
    # Relationships
    driving_license = relationship("DrivingLicense", back_populates="violations")
    payments = relationship("Payment", back_populates="violation")
    evidence = relationship("Evidence", back_populates="violation")
    notifications = relationship("Notification", back_populates="violation")
    complaints = relationship("Complaint", back_populates="violation")
    
    def __repr__(self):
        return f"<Violation {self.id} - {self.license_plate} - {self.violation_type}>"