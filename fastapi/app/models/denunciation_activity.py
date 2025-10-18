from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class DenunciationActivity(Base):
    __tablename__ = "denunciation_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    denunciation_id = Column(Integer, ForeignKey("denunciations.id"), nullable=False)
    
    activity_type = Column(String(100), nullable=False)  # created, assigned, investigating, resolved, etc.
    description = Column(Text, nullable=False)
    activity_metadata = Column(JSON)
    
    # Người thực hiện (có thể là hệ thống)
    performed_by = Column(Integer, ForeignKey("users.id"))
    performed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    denunciation = relationship("Denunciation", back_populates="activities")
    officer = relationship("User", foreign_keys=[performed_by])
    
    def __repr__(self):
        return f"<DenunciationActivity {self.activity_type} for Denunciation {self.denunciation_id}>"