from sqlalchemy import Column, String, Integer, DateTime, Date, DECIMAL
from sqlalchemy.dialects.postgresql import JSONB
from .base import Base, TimestampMixin

class DailyStats(Base, TimestampMixin):
    __tablename__ = "daily_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    stat_date = Column(Date, unique=True, nullable=False, index=True)
    
    # Violation metrics
    total_violations = Column(Integer, default=0)
    approved_violations = Column(Integer, default=0)
    rejected_violations = Column(Integer, default=0)
    pending_violations = Column(Integer, default=0)
    
    # Violation type breakdown
    violation_type_counts = Column(JSONB)  # {'red_light': 50, 'speeding': 30}
    confidence_score_avg = Column(DECIMAL(5, 4))
    
    # Financial metrics
    total_revenue = Column(DECIMAL(15, 2), default=0)
    collected_revenue = Column(DECIMAL(15, 2), default=0)
    pending_revenue = Column(DECIMAL(15, 2), default=0)
    
    # User/complaint metrics
    new_users = Column(Integer, default=0)
    total_complaints = Column(Integer, default=0)
    resolved_complaints = Column(Integer, default=0)
    
    # Performance metrics
    approval_rate = Column(DECIMAL(5, 2))
    collection_rate = Column(DECIMAL(5, 2))
    
    def __repr__(self):
        return f"<DailyStats {self.stat_date} - {self.total_violations} violations>"