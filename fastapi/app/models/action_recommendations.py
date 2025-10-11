from sqlalchemy import Column, String, Integer, DateTime, Text, DECIMAL, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class ActionRecommendations(Base, TimestampMixin):
    __tablename__ = "action_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    recommendation_type = Column(String(100), nullable=False)  # 'patrol_allocation', 'camera_placement'
    priority_level = Column(String(20), nullable=False)  # 'low', 'medium', 'high', 'critical'
    
    title = Column(String(255), nullable=False)
    description = Column(Text)
    rationale = Column(JSONB)  # Data backing the recommendation
    
    expected_impact = Column(String(100))  # '20% reduction in violations'
    implementation_cost = Column(DECIMAL(15, 2))
    
    status = Column(String(50), default='pending')  # 'pending', 'approved', 'implemented', 'rejected'
    assigned_to = Column(Integer, ForeignKey('users.id'))
    
    # Relationships
    assigned_user = relationship("User", foreign_keys=[assigned_to])
    
    def __repr__(self):
        return f"<ActionRecommendation {self.title} - {self.priority_level} priority>"