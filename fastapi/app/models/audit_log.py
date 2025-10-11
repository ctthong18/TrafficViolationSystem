from sqlalchemy import Column, String, Integer, DateTime, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from .base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Thông tin hành động
    action = Column(String(100), nullable=False)  # create, update, delete, approve, reject
    table_name = Column(String(100), nullable=False)  # violations, payments, etc.
    record_id = Column(Integer, nullable=False)
    
    # Dữ liệu thay đổi
    old_values = Column(JSONB)
    new_values = Column(JSONB)
    
    # Người thực hiện và ngữ cảnh
    user_id = Column(Integer, ForeignKey("users.id"))
    ip_address = Column(String(45))
    user_agent = Column(Text)
    
    timestamp = Column(DateTime, default=DateTime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self):
        return f"<AuditLog {self.action} on {self.table_name}.{self.record_id}>"