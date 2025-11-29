from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, ForeignKey, DECIMAL
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin
import enum

class Role(enum.Enum):
    ADMIN = "admin"
    OFFICER = "officer"
    CITIZEN = "citizen"

class User(Base, TimestampMixin):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    
    # Role-based access control
    role = Column(String(50), nullable=False)
    permissions = Column(JSONB)
    
    # Contact info
    phone_number = Column(String(20))
    department = Column(String(100))
    badge_number = Column(String(50))
    
    # Citizen-specific fields
    identification_number = Column(String(100), unique=True, nullable=False)
    date_of_birth = Column(DateTime)
    address = Column(String(500))
    
    # Wallet info (chỉ cho citizen)
    wallet_balance = Column(DECIMAL(15, 2), default=0)
    total_deposited = Column(DECIMAL(15, 2), default=0)
    total_paid_fines = Column(DECIMAL(15, 2), default=0)
    pending_fines = Column(DECIMAL(15, 2), default=0)
    
    # Status
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime)
    
    # Audit fields
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    reviewed_violations = relationship("Violation", foreign_keys="Violation.reviewed_by")
    appeal_reviews = relationship("ComplaintAppeal", foreign_keys="ComplaintAppeal.reviewed_by")
    audit_logs = relationship("AuditLog", back_populates="user")
    driving_licenses = relationship("DrivingLicense", back_populates="user")
    vehicles = relationship("Vehicle", back_populates="owner")
    payments = relationship("Payment", back_populates="user")  # Tất cả giao dịch
    assigned_complaints = relationship(
        "Complaint",
        foreign_keys="Complaint.assigned_officer_id",
        back_populates="assigned_officer"
    )
    
    complaints = relationship(
        "Complaint",
        foreign_keys="Complaint.complainant_id",
        back_populates="complainant"
    )

    # ĐÃ XÓA wallet_transactions relationship
    
    def __repr__(self):
        return f"<User {self.username} - {self.role}>"

from app.models.driving_license import DrivingLicense