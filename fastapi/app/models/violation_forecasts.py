from sqlalchemy import Column, String, Integer, DateTime, Date, DECIMAL
from sqlalchemy.dialects.postgresql import JSONB
from .base import Base, TimestampMixin

class ViolationForecasts(Base, TimestampMixin):
    __tablename__ = "violation_forecasts"
    
    id = Column(Integer, primary_key=True, index=True)
    forecast_date = Column(Date, nullable=False, index=True)
    forecast_type = Column(String(50), nullable=False)  # 'daily', 'weekly', 'monthly'
    
    predicted_violations = Column(Integer)
    prediction_confidence = Column(DECIMAL(5, 4))
    upper_bound = Column(Integer)
    lower_bound = Column(Integer)
    
    # Factors influencing forecast
    influencing_factors = Column(JSONB)  # {'weather': 'rain', 'holiday': true}
    
    def __repr__(self):
        return f"<ViolationForecast {self.forecast_date} - {self.predicted_violations} predicted>"