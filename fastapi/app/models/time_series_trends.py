from sqlalchemy import Column, String, Integer, DateTime, Date, DECIMAL
from .base import Base, TimestampMixin

class TimeSeriesTrends(Base, TimestampMixin):
    __tablename__ = "time_series_trends"
    
    id = Column(Integer, primary_key=True, index=True)
    trend_type = Column(String(50), nullable=False, index=True)  # 'violations_daily', 'revenue_weekly'
    period_date = Column(Date, nullable=False, index=True)
    period_value = Column(Integer)  # day of month, week number, etc.
    
    metric_name = Column(String(100), nullable=False)  # 'total_violations', 'revenue'
    metric_value = Column(DECIMAL(15, 2))
    previous_value = Column(DECIMAL(15, 2))  # For comparison
    growth_rate = Column(DECIMAL(8, 2))
    
    def __repr__(self):
        return f"<TimeSeriesTrend {self.trend_type} - {self.metric_name}: {self.metric_value}>"