"""
AI Model Configuration Model
Stores configuration for AI detection parameters with history tracking
"""
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base


class AIModelConfig(Base):
    """
    AI Model Configuration
    Stores current and historical configuration for AI detection parameters
    """
    __tablename__ = "ai_model_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Configuration parameters
    confidence_threshold = Column(Float, nullable=False, default=0.4)
    iou_threshold = Column(Float, nullable=False, default=0.5)
    detection_frequency = Column(Integer, nullable=False, default=2, comment="Frames per second to analyze")
    
    # Violation type settings (JSON)
    violation_types = Column(JSON, nullable=False, default={
        'no_helmet': {'enabled': True, 'confidence_min': 0.6},
        'red_light': {'enabled': True, 'confidence_min': 0.7},
        'wrong_lane': {'enabled': True, 'confidence_min': 0.65},
        'speeding': {'enabled': True, 'confidence_min': 0.75}
    })
    
    # Metadata
    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    notes = Column(Text, nullable=True)
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    
    def __repr__(self):
        return f"<AIModelConfig id={self.id} confidence={self.confidence_threshold} active={self.is_active}>"
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            'id': self.id,
            'confidence_threshold': float(self.confidence_threshold),
            'iou_threshold': float(self.iou_threshold),
            'detection_frequency': self.detection_frequency,
            'violation_types': self.violation_types,
            'is_active': self.is_active,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'notes': self.notes
        }
