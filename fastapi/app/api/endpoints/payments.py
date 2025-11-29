from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from decimal import Decimal
from datetime import datetime
import base64

from app.schemas.payment_schema import PaymentOut
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.payment import Payment, PaymentStatus, PaymentMethod, PaymentType
from app.services.payment_service import PaymentService
from app.services.payment_processor import PaymentProcessor

router = APIRouter()


# ----------------------------------------
# TẠO THANH TOÁN PHẠT
# ----------------------------------------
@router.post("/fines/{violation_id}", response_model=PaymentOut)
async def create_fine_payment(
    violation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment_service = PaymentService(db)
    return payment_service.create_fine_payment(violation_id, current_user.id)


# ----------------------------------------
# NẠP TIỀN VÀO VÍ
# ----------------------------------------
@router.post("/wallet/deposit")
async def deposit_to_wallet(
    amount: Decimal = Query(..., gt=0, description="Số tiền nạp > 0"),
    payment_method: str = Query(..., description="bank_transfer, credit_card, e_wallet"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    valid_methods = {"bank_transfer", "credit_card", "e_wallet"}
    if payment_method not in valid_methods:
        raise HTTPException(400, detail="Phương thức thanh toán không hợp lệ")

    payment_service = PaymentService(db)
    return payment_service.deposit_to_wallet(current_user.id, amount, payment_method)


# ----------------------------------------
# TRẢ PHẠT TỪ VÍ
# ----------------------------------------
@router.post("/fines/{payment_id}/pay-from-wallet")
async def pay_fine_from_wallet(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment_service = PaymentService(db)
    payment = payment_service.get_payment_by_id(payment_id)

    if not payment:
        raise HTTPException(404, "Payment không tồn tại")
    if payment.user_id != current_user.id:
        raise HTTPException(403, "Không có quyền thanh toán khoản này")

    return payment_service.pay_fine_from_wallet(payment_id, current_user.id)


# ----------------------------------------
# LỊCH SỬ GIAO DỊCH
# ----------------------------------------
@router.get("/my-payments")
async def get_my_payments(
    payment_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment_service = PaymentService(db)
    payments = payment_service.get_user_payments(current_user.id, payment_type)

    result = []
    for p in payments:
        payment_dict = p.__dict__.copy()

        # Ưu tiên QR URL từ qr_code_data, fallback về base64 nếu có
        if getattr(p, "qr_code_data", None):
            payment_dict["qr_url"] = p.qr_code_data
            payment_dict["qr_image_base64"] = None
        elif getattr(p, "qr_code_image", None):
            payment_dict["qr_image_base64"] = base64.b64encode(
                p.qr_code_image
            ).decode("utf-8")
            payment_dict["qr_url"] = None
        else:
            payment_dict["qr_url"] = None
            payment_dict["qr_image_base64"] = None

        payment_dict.pop("qr_code_image", None)
        payment_dict.pop("qr_code_data", None)  # Đã chuyển sang qr_url

        result.append(payment_dict)

    return result


# ----------------------------------------
# TỔNG QUAN VÍ
# ----------------------------------------
@router.get("/wallet/summary")
async def get_wallet_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment_service = PaymentService(db)
    return payment_service.get_wallet_summary(current_user.id)


# ----------------------------------------
# HÓA ĐƠN THANH TOÁN
# ----------------------------------------
@router.get("/payments/{payment_id}/receipt")
async def get_receipt(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment_service = PaymentService(db)
    payment = payment_service.get_payment_by_id(payment_id)

    if not payment:
        raise HTTPException(404, "Payment không tồn tại")

    if payment.user_id != current_user.id:
        raise HTTPException(403, "Không có quyền truy cập hóa đơn này")

    if payment.status != PaymentStatus.PAID.value:
        raise HTTPException(400, "Chỉ có thể xem hóa đơn cho thanh toán đã hoàn tất")

    return payment_service.generate_receipt(payment_id)


# ----------------------------------------
# TẠO HOẶC LẤY QR CODE THANH TOÁN
# ----------------------------------------
@router.post("/payments/{payment_id}/qr")
async def create_qr_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    processor = PaymentProcessor(db)

    # Lấy giao dịch thuộc user
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.user_id == current_user.id,
        Payment.payment_type == PaymentType.FINE_PAYMENT
    ).first()

    if not payment:
        raise HTTPException(404, "Payment không tồn tại")

    now = datetime.utcnow()

    # Nếu chưa có QR hoặc QR đã hết hạn -> Tạo mới
    should_generate_new = (
        not payment.qr_code_data or 
        (payment.qr_expiry_time and payment.qr_expiry_time < now)
    )

    if should_generate_new:
        qr_info = processor.qr_service.create_payment_qr(
            amount=float(payment.amount),
            user_id=current_user.id,
            description=f"Thanh toán phạt - {payment_id}"
        )

        payment.qr_code_data = qr_info["qr_url"]  # Lưu QR URL
        payment.qr_code_image = None  # Không cần lưu image nữa
        payment.qr_transaction_id = qr_info["qr_transaction_id"]
        payment.qr_expiry_time = qr_info["qr_expiry"]
        payment.bank_account_number = qr_info["bank_account"]
        payment.bank_name = qr_info["bank_name"]
        payment.transfer_content = qr_info["transfer_content"]
        payment.payment_method = PaymentMethod.QR_CODE.value
        payment.status = PaymentStatus.PENDING.value

        db.commit()
        db.refresh(payment)

    # Trả về QR URL thay vì base64
    qr_url = payment.qr_code_data if payment.qr_code_data else None

    return {
        "payment_id": payment.id,
        "qr_url": qr_url,
        "qr_image_base64": None,  # Giữ lại để backward compatibility
        "qr_transaction_id": payment.qr_transaction_id,
        "amount": float(payment.amount),
        "bank_account_number": payment.bank_account_number,
        "bank_name": payment.bank_name,
        "transfer_content": payment.transfer_content,
        "expiry_time": payment.qr_expiry_time
    }


# ----------------------------------------
# KIỂM TRA TRẠNG THÁI THANH TOÁN
# ----------------------------------------
@router.get("/payments/{payment_id}/status")
async def get_payment_status(
    payment_id: int,
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()

    if not payment:
        raise HTTPException(404, detail="Payment not found")

    return {
        "payment_id": payment.id,
        "status": payment.status,
        "amount": float(payment.amount),
        "paid_at": payment.paid_at,
        "qr_expiry": payment.qr_expiry_time
    }
