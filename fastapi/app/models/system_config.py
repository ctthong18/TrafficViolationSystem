from sqlalchemy import Column, String, Integer, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base, TimestampMixin

class SystemConfig(Base, TimestampMixin):
    __tablename__ = "system_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    config_key = Column(String(100), unique=True, nullable=False, index=True)
    config_value = Column(Text)
    config_type = Column(String(50), default="string")  # string, int, bool, json
    description = Column(Text)
    is_active = Column(Integer, default=1)  # 1 = active, 0 = inactive
    
    def __repr__(self):
        return f"<SystemConfig {self.config_key} = {self.config_value}>"

