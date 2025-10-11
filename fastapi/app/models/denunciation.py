from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Boolean, Enum
from sqlalchemy.dialects.postgresql import JSON, JSONB, ENUM
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin
import enum

class DenunciationType(enum.Enum):
    CORRUPTION = "corruption"                    # Tham nhũng, hối lộ
    ABUSE_OF_POWER = "abuse_of_power"           # Lạm quyền
    VIOLATION_COVER_UP = "violation_cover_up"   # Bỏ lọt vi phạm
    FRAUD = "fraud"                             # Gian lận
    SYSTEM_MANIPULATION = "system_manipulation" # Thao túng hệ thống
    OTHER_ILLEGAL = "other_illegal"             # Hành vi phạm pháp khác

class DenunciationStatus(enum.Enum):
    PENDING = "pending"
    VERIFYING = "verifying"      # Đang xác minh
    INVESTIGATING = "investigating"  # Đang điều tra
    RESOLVED = "resolved"       # Đã xử lý
    REJECTED = "rejected"       # Từ chối xử lý
    TRANSFERRED = "transferred" # Chuyển cơ quan khác

class Denunciation(Base, TimestampMixin):
    __tablename__ = "denunciations"
    
    id = Column(Integer, primary_key=True, index=True)
    denunciation_code = Column(String(50), unique=True, index=True)  # TC-2024-001
    
    # Thông tin người tố cáo (CÓ THỂ ẨN DANH)
    is_anonymous = Column(Boolean, default=True)
    informant_name = Column(String(255))  # Có thể để trống nếu ẩn danh
    informant_phone = Column(String(20))
    informant_email = Column(String(255))
    informant_identification = Column(String(50))
    informant_address = Column(Text)
    
    # Liên hệ lại (nếu cần)
    contact_preference = Column(String(50))  # phone, email, none
    can_contact = Column(Boolean, default=False)
    
    # Loại và mức độ tố cáo
    denunciation_type = Column(ENUM(DenunciationType), nullable=False)
    severity_level = Column(String(20), default="medium")  # low, medium, high, critical
    urgency_level = Column(String(20), default="normal")   # normal, urgent, emergency
    
    # Nội dung tố cáo
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    
    # Đối tượng bị tố cáo
    accused_person_name = Column(String(255))
    accused_person_position = Column(String(255))
    accused_department = Column(String(255))
    
    # Liên kết với hệ thống (nếu có)
    related_violation_id = Column(Integer, ForeignKey("violations.id"))
    related_user_id = Column(Integer, ForeignKey("users.id"))  # Cán bộ bị tố cáo
    
    # Bằng chứng
    evidence_urls = Column(JSON)  # [url1, url2] - ảnh, video, tài liệu
    evidence_descriptions = Column(JSONB)  # Mô tả cho từng bằng chứng
    
    # Xử lý tố cáo
    status = Column(ENUM(DenunciationStatus), default=DenunciationStatus.PENDING)
    assigned_investigator_id = Column(Integer, ForeignKey("users.id"))
    assigned_at = Column(DateTime)
    
    # Kết quả điều tra
    investigation_notes = Column(Text)
    investigation_result = Column(Text)
    resolution = Column(Text)
    resolved_at = Column(DateTime)
    
    # Bảo mật & bảo vệ người tố cáo
    security_level = Column(String(50), default="confidential")  # confidential, secret, top_secret
    is_whistleblower = Column(Boolean, default=False)  # Có phải tố cáo nội bộ
    
    # Chuyển cơ quan khác (nếu cần)
    transferred_to = Column(String(255))  # Cơ quan nhận chuyển
    transfer_reason = Column(Text)
    transferred_at = Column(DateTime)
    
    # Relationships
    related_violation = relationship("Violation")
    related_user = relationship("User", foreign_keys=[related_user_id])
    assigned_investigator = relationship("User", foreign_keys=[assigned_investigator_id])
    activities = relationship("DenunciationActivity", back_populates="denunciation")
    
    def __repr__(self):
        return f"<Denunciation {self.denunciation_code} - {self.denunciation_type.value}>"