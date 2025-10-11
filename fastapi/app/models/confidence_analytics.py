from sqlalchemy import Column, String, Integer, DateTime, Date, DECIMAL
from .base import Base, TimestampMixin

class ConfidenceAnalytics(Base, TimestampMixin):
    __tablename__ = "confidence_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_date = Column(Date, nullable=False, index=True)
    score_range = Column(String(20), nullable=False)  # '0-60', '60-80', '80-90', '90-100'
    violation_count = Column(Integer, default=0)
    approval_rate = Column(DECIMAL(5, 2))
    avg_processing_time = Column(Integer)  # seconds
    
    # Accuracy metrics
    false_positive_rate = Column(DECIMAL(5, 2))
    true_positive_rate = Column(DECIMAL(5, 2))
    
    def __repr__(self):
        return f"<ConfidenceAnalytics {self.score_range} - {self.approval_rate}% approval>"