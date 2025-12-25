import enum
import secrets

from sqlalchemy import (
    DECIMAL,
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    LargeBinary,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from .base import Base, TimestampMixin


from app.schemas.payment_schema import PaymentMethod, PaymentStatus, PaymentType


class Payment(Base, TimestampMixin):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)

    violation_id = Column(Integer, ForeignKey("violations.id"), index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)

    payment_type = Column(
        Enum(PaymentType),
        nullable=False,
    )

    amount = Column(DECIMAL(15, 2), nullable=False)
    original_fine = Column(DECIMAL(15, 2))
    late_penalty = Column(DECIMAL(15, 2), default=0)
    discount_amount = Column(DECIMAL(15, 2), default=0)

    status = Column(
        Enum(PaymentStatus),
        default=PaymentStatus.PENDING,
        nullable=False,
    )
    payment_method = Column(
        Enum(PaymentMethod),
        nullable=True,
    )
    payment_gateway = Column(String(100))
    gateway_transaction_id = Column(String(255))

    qr_code_data = Column(String, nullable=True)
    qr_code_image = Column(LargeBinary, nullable=True)  # chứa dữ liệu ảnh QR (PNG)
    qr_transaction_id = Column(String, nullable=True)
    qr_expiry_time = Column(DateTime, nullable=True)
    bank_account_number = Column(String, nullable=True)
    bank_name = Column(String, nullable=True)
    transfer_content = Column(String, nullable=True)

    wallet_balance_before = Column(DECIMAL(15, 2))
    wallet_balance_after = Column(DECIMAL(15, 2))

    due_date = Column(Date)
    paid_at = Column(DateTime)

    receipt_number = Column(String(100), unique=True)
    payer_name = Column(String(255))
    payer_identification = Column(String(50))

    description = Column(Text)
    is_auto_deduct = Column(Boolean, default=False)
    refund_reason = Column(Text)

    violation = relationship("Violation", back_populates="payments")
    vehicle = relationship("Vehicle", back_populates="payments")
    user = relationship("User", back_populates="payments")

    def __repr__(self):
        return f"<Payment {self.receipt_number} - {self.amount} - {self.status.value}>"
