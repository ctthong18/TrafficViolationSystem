from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class ComplaintActivity(Base):
    __tablename__ = "complaint_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    
    # Thông tin hoạt động
    activity_type = Column(String(100), nullable=False)  # created, assigned, updated, resolved, etc.
    description = Column(Text, nullable=False)
    activity_metadata = Column(JSON)  # Additional data about the activity
    
    # Người thực hiện
    performed_by = Column(Integer, ForeignKey("users.id"))
    performed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    complaint = relationship("Complaint", back_populates="activities")
    officer = relationship("User", foreign_keys=[performed_by])
    
    def __repr__(self):
        return f"<ComplaintActivity {self.activity_type} for Complaint {self.complaint_id}>"