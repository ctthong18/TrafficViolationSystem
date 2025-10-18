from sqlalchemy import Column, String, Integer, DateTime, Text, DECIMAL, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin
import enum

class PaymentStatus(enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"

class PaymentMethod(enum.Enum):
    WALLET = "wallet"           # Thanh toán qua ví
    BANK_TRANSFER = "bank_transfer"
    CREDIT_CARD = "credit_card"
    E_WALLET = "e_wallet"       # Ví điện tử (Momo, ZaloPay)
    CASH = "cash"               # Tiền mặt
    BANKING = "banking"         # Chuyển khoản ngân hàng

class PaymentType(enum.Enum):
    FINE_PAYMENT = "fine_payment"     # Thanh toán phạt
    WALLET_DEPOSIT = "wallet_deposit" # Nạp tiền ví
    WALLET_WITHDRAW = "wallet_withdraw" # Rút tiền ví
    REFUND = "refund"            # Hoàn tiền

class Payment(Base, TimestampMixin):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Liên kết
    violation_id = Column(Integer, ForeignKey("violations.id"), index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)  # Người thanh toán
    
    # Thông tin thanh toán
    payment_type = Column(String(50), nullable=False)  # fine_payment, wallet_deposit, etc.
    amount = Column(DECIMAL(15, 2), nullable=False)
    original_fine = Column(DECIMAL(15, 2))  # Chỉ cho fine_payment
    late_penalty = Column(DECIMAL(15, 2), default=0)
    discount_amount = Column(DECIMAL(15, 2), default=0)
    
    # Trạng thái & phương thức
    status = Column(String(50), default=PaymentStatus.PENDING.value)
    payment_method = Column(String(50))
    payment_gateway = Column(String(100))
    gateway_transaction_id = Column(String(255))
    
    # Thông tin ví (chỉ cho wallet transactions)
    wallet_balance_before = Column(DECIMAL(15, 2))  # Số dư ví trước giao dịch
    wallet_balance_after = Column(DECIMAL(15, 2))   # Số dư ví sau giao dịch
    
    # Thời hạn (chỉ cho fine_payment)
    due_date = Column(Date)
    paid_at = Column(DateTime)
    
    # Thông tin hóa đơn
    receipt_number = Column(String(100))
    payer_name = Column(String(255))
    payer_identification = Column(String(50))
    
    # Metadata
    description = Column(Text)
    is_auto_deduct = Column(Boolean, default=False)  # Tự động trừ từ ví
    refund_reason = Column(Text)  # Lý do hoàn tiền
    
    # Relationships
    violation = relationship("Violation", back_populates="payments")
    vehicle = relationship("Vehicle", back_populates="payments")
    user = relationship("User", back_populates="payments")
    
    def __repr__(self):
        return f"<Payment {self.receipt_number} - {self.amount} - {self.status}>"