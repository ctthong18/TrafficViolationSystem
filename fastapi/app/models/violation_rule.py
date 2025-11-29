from sqlalchemy import Column, Integer, String, Text, DECIMAL, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base
from datetime import datetime

class ViolationRule(Base):
    __tablename__ = "violation_rules"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)      # Mã lỗi, ví dụ: RED_LIGHT, SPEED_10_20
    description = Column(Text, nullable=False)                  # Mô tả lỗi
    law_reference = Column(String(255), default="168/2024/NĐ-CP")   # Nghị định hoặc điều luật áp dụng
    
    fine_min_car = Column(DECIMAL(15, 2))
    fine_max_car = Column(DECIMAL(15, 2))
    points_car = Column(Integer)

    fine_min_bike = Column(DECIMAL(15, 2))
    fine_max_bike = Column(DECIMAL(15, 2))
    points_bike = Column(Integer)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    violations = relationship("Violation", back_populates="rule")

    def __repr__(self):
        return f"<ViolationRule {self.code} - {self.description}>"
