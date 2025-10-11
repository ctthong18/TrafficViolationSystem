from sqlalchemy import Column, String, Integer, DateTime, Date, DECIMAL
from sqlalchemy.dialects.postgresql import JSONB
from .base import Base, TimestampMixin

class ModelPerformance(Base, TimestampMixin):
    __tablename__ = "model_performance"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False, index=True)  # 'yolo_v8', 'paddle_ocr'
    evaluation_date = Column(Date, nullable=False, index=True)
    
    # Accuracy metrics
    precision_score = Column(DECIMAL(5, 4))
    recall_score = Column(DECIMAL(5, 4))
    f1_score = Column(DECIMAL(5, 4))
    accuracy = Column(DECIMAL(5, 4))
    
    # Performance metrics
    avg_processing_time_ms = Column(Integer)
    total_predictions = Column(Integer)
    
    # Violation type specific performance
    performance_by_type = Column(JSONB)  # {'red_light': {'precision': 0.95, ...}}
    
    def __repr__(self):
        return f"<ModelPerformance {self.model_name} - F1: {self.f1_score}>"