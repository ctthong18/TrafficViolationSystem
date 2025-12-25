import enum

from sqlalchemy import (
    DECIMAL,
    JSON,
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship

from .base import Base, TimestampMixin


from app.schemas.driving_license_schema import LicenseClass, LicenseStatus


class DrivingLicense(Base, TimestampMixin):
    __tablename__ = "driving_licenses"

    id = Column(Integer, primary_key=True, index=True)
    license_number = Column(String(50), unique=True, nullable=False)  # Số GPLX
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # License information
    license_class = Column(Enum(LicenseClass), nullable=False)  # Hạng GPLX
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
    status = Column(Enum(LicenseStatus), default=LicenseStatus.ACTIVE)
    suspension_start = Column(Date)  # Ngày bắt đầu tạm giữ
    suspension_end = Column(Date)  # Ngày kết thúc tạm giữ
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
