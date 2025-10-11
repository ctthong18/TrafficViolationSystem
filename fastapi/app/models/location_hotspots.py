from sqlalchemy import Column, String, Integer, DateTime, Date, DECIMAL
from sqlalchemy.dialects.postgresql import JSONB
from .base import Base, TimestampMixin

class LocationHotspots(Base, TimestampMixin):
    __tablename__ = "location_hotspots"
    
    id = Column(Integer, primary_key=True, index=True)
    location_name = Column(String(255), nullable=False, index=True)
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))
    
    period_type = Column(String(20), nullable=False)  # 'daily', 'weekly', 'monthly'
    period_date = Column(Date, nullable=False, index=True)
    
    total_violations = Column(Integer, default=0)
    violation_breakdown = Column(JSONB)  # {'speeding': 100, 'red_light': 50}
    revenue_generated = Column(DECIMAL(15, 2), default=0)
    
    # Risk score for prioritization
    risk_score = Column(DECIMAL(5, 2))
    trend_direction = Column(String(10))  # 'increasing', 'decreasing', 'stable'
    
    def __repr__(self):
        return f"<LocationHotspot {self.location_name} - {self.total_violations} violations>"