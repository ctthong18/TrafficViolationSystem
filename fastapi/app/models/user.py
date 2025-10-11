from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

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
    role = Column(String(50), nullable=False)  # admin, officer, viewer, citizen
    permissions = Column(JSONB)
    
    # Contact info
    phone_number = Column(String(20))
    department = Column(String(100))
    badge_number = Column(String(50))
    
    # Status
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime)
    
    # Audit fields
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    reviewed_violations = relationship("Violation", foreign_keys="Violation.reviewed_by")
    assigned_complaints = relationship("Complaint", foreign_keys="Complaint.assigned_officer_id")
    appeal_reviews = relationship("ComplaintAppeal", foreign_keys="ComplaintAppeal.reviewed_by")
    audit_logs = relationship("AuditLog", back_populates="user")
    def __repr__(self):
        return f"<User {self.username} - {self.role}>"