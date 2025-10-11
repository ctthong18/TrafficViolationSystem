from sqlalchemy import Column, String, Integer, DateTime, Text, DECIMAL, Date, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class Payment(Base, TimestampMixin):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    violation_id = Column(Integer, ForeignKey("violations.id"), index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), index=True)
    
    # Payment information
    amount = Column(DECIMAL(15, 2), nullable=False)
    original_fine = Column(DECIMAL(15, 2))
    late_penalty = Column(DECIMAL(15, 2), default=0)
    discount_amount = Column(DECIMAL(15, 2), default=0)
    
    # Payment status & method
    status = Column(String(50), default="pending")
    payment_method = Column(String(50))
    payment_gateway = Column(String(100))
    gateway_transaction_id = Column(String(255))
    
    # Timestamps
    due_date = Column(Date, nullable=False)
    paid_at = Column(DateTime)
    
    # Receipt info
    receipt_number = Column(String(100))
    payer_name = Column(String(255))
    payer_identification = Column(String(50))
    
    # Relationships
    violation = relationship("Violation", back_populates="payments")
    vehicle = relationship("Vehicle", back_populates="payments")
    
    def __repr__(self):
        return f"<Payment {self.receipt_number} - {self.amount}>"