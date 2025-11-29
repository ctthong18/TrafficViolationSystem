from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel
from enum import Enum


class PaymentStatus(str, Enum):
    CREATED = "created"
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class PaymentMethod(str, Enum):
    BANK_TRANSFER = "bank_transfer"
    WALLET = "wallet"
    QR_CODE = "qr_code"


class PaymentType(str, Enum):
    FINE_PAYMENT = "fine_payment"
    WALLET_DEPOSIT = "wallet_deposit"


# ========== Base Schema ==========
class PaymentBase(BaseModel):
    amount: Decimal
    payment_method: PaymentMethod
    payment_type: PaymentType
    description: Optional[str] = None


# ========== Create ==========
class PaymentCreate(PaymentBase):
    violation_id: Optional[int] = None


# ========== Update ==========
class PaymentUpdate(BaseModel):
    status: Optional[PaymentStatus]
    gateway_transaction_id: Optional[str] = None
    paid_at: Optional[datetime] = None


# ========== Response ==========
class PaymentOut(PaymentBase):
    id: int
    user_id: Optional[int]
    violation_id: Optional[int]
    status: PaymentStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    due_date: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    late_fee: Optional[Decimal] = None
    total_amount: Optional[Decimal] = None
    qr_transaction_id: Optional[str] = None
    qr_expiry_time: Optional[datetime] = None
    bank_account_number: Optional[str] = None
    bank_name: Optional[str] = None
    transfer_content: Optional[str] = None

    class Config:
        orm_mode = True


# ========== Wallet schemas ==========
class WalletDepositRequest(BaseModel):
    amount: Decimal
    payment_method: PaymentMethod


class WalletSummaryResponse(BaseModel):
    wallet_balance: float
    total_deposited: float
    total_paid_fines: float
    pending_fines: float
    available_balance: float
    can_auto_pay: bool


# ========== QR Payment ==========
class QRPaymentResponse(BaseModel):
    payment_id: int
    qr_url: Optional[str] = None  # QR URL từ VietQR
    qr_image_base64: Optional[str] = None  # Giữ lại để backward compatibility
    qr_transaction_id: str
    bank_name: str
    bank_account_number: str
    transfer_content: str
    amount: float
    expiry_time: datetime
