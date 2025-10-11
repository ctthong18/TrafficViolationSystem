from sqlalchemy import Column, String, Integer, DateTime, Text, DECIMAL, ForeignKey, Boolean, Enum
from sqlalchemy.dialects.postgresql import JSON, ENUM
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin
import enum

class ComplaintStatus(enum.Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    RESOLVED = "resolved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class ComplaintType(enum.Enum):
    VIOLATION_DISPUTE = "violation_dispute"  # Khiếu nại vi phạm
    FALSE_POSITIVE = "false_positive"       # Báo cáo sai
    MISSING_VIOLATION = "missing_violation" # Thiếu vi phạm
    OFFICER_BEHAVIOR = "officer_behavior"   # Hành vi cán bộ
    SYSTEM_ERROR = "system_error"           # Lỗi hệ thống
    OTHER = "other"

class Complaint(Base, TimestampMixin):
    __tablename__ = "complaints"
    
    id = Column(Integer, primary_key=True, index=True)
    complaint_code = Column(String(50), unique=True, index=True)  # KN-2024-001
    
    # Thông tin người khiếu nại
    complainant_name = Column(String(255), nullable=False)
    complainant_phone = Column(String(20))
    complainant_email = Column(String(255))
    complainant_identification = Column(String(50))  # CMND/CCCD
    complainant_address = Column(Text)
    
    # Loại và trạng thái khiếu nại
    complaint_type = Column(ENUM(ComplaintType), nullable=False)
    status = Column(ENUM(ComplaintStatus), default=ComplaintStatus.PENDING)
    priority = Column(String(20), default="medium")  # low, medium, high, urgent
    
    # Liên kết với vi phạm (nếu có)
    violation_id = Column(Integer, ForeignKey("violations.id"))
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    
    # Nội dung khiếu nại
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    desired_resolution = Column(Text)  # Kết quả mong muốn
    
    # Bằng chứng từ người dân
    evidence_urls = Column(JSON)  # [url1, url2] - ảnh/video từ người dân
    supporting_documents = Column(JSON)
    
    # Xử lý khiếu nại
    assigned_officer_id = Column(Integer, ForeignKey("users.id"))
    assigned_at = Column(DateTime)
    resolution = Column(Text)  # Kết quả xử lý
    resolved_at = Column(DateTime)
    resolution_notes = Column(Text)
    
    # Đánh giá từ người dân
    user_rating = Column(Integer)  # 1-5 sao
    user_feedback = Column(Text)
    
    # Metadata
    source = Column(String(50), default="web")  # web, mobile_app, email, phone
    is_anonymous = Column(Boolean, default=False)
    
    # Relationships
    violation = relationship("Violation", back_populates="complaints")
    vehicle = relationship("Vehicle")
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id])
    appeals = relationship("ComplaintAppeal", back_populates="complaint")
    activities = relationship("ComplaintActivity", back_populates="complaint")
    
    def __repr__(self):
        return f"<Complaint {self.complaint_code} - {self.complaint_type.value}>"