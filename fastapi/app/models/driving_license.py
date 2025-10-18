from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, DECIMAL, Date, JSON
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin
import enum

class LicenseStatus(enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    REVOKED = "revoked"
    EXPIRED = "expired"

class LicenseClass(enum.Enum):
    A1 = "a1"  # Xe máy dưới 175cc
    A2 = "a2"  # Xe máy trên 175cc  
    A3 = "a3"  # Xe máy 3 bánh
    A4 = "a4"  # Xe máy kéo rơ moóc
    B1 = "b1"  # Ô tô số tự động
    B2 = "b2"  # Ô tô dưới 9 chỗ
    C = "c"    # Ô tô tải
    D = "d"    # Ô tô khách
    E = "e"    # Ô tô kéo rơ moóc
    F = "f"    # Tất cả các hạng

class DrivingLicense(Base, TimestampMixin):
    __tablename__ = "driving_licenses"
    
    id = Column(Integer, primary_key=True, index=True)
    license_number = Column(String(20), unique=True, nullable=False)  # Số GPLX
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # License information
    license_class = Column(String(10), nullable=False)  # Hạng GPLX
    full_name = Column(String(255), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    nationality = Column(String(100), default="Việt Nam")
    address = Column(String(500))
    
    # Issue and expiry
    issue_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False)
    issue_place = Column(String(255))
    
    # Point management (theo Nghị định 100/2019/NĐ-CP)
    total_points = Column(Integer, default=12)  # Tổng điểm (tối đa 12)
    current_points = Column(Integer, default=12)  # Điểm hiện tại
    points_reset_date = Column(Date)  # Ngày reset điểm (sau 1 năm)
    
    # Status
    status = Column(String(50), default=LicenseStatus.ACTIVE.value)
    suspension_start = Column(Date)  # Ngày bắt đầu tạm giữ
    suspension_end = Column(Date)    # Ngày kết thúc tạm giữ
    revocation_reason = Column(String(500))  # Lý do thu hồi
    
    # Violation history (cached for performance)
    total_violations = Column(Integer, default=0)
    serious_violations = Column(Integer, default=0)  # Vi phạm nghiêm trọng
    points_deduction_history = Column(JSON)  # Lịch sử trừ điểm
    
    # Relationships
    user = relationship("User", back_populates="driving_licenses")
    violations = relationship("Violation", back_populates="driving_license")
    
    def __repr__(self):
        return f"<DrivingLicense {self.license_number} - {self.license_class}>"