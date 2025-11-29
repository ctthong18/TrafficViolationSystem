import asyncio
import base64
import secrets
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from typing import Optional

from app.models.payment import (
    Payment,
    PaymentStatus,
    PaymentType,
    PaymentMethod,
)
from app.models.violation import Violation
from app.services.qr_service import BankQRService
from app.core.database import SessionLocal  # để tạo session mới cho async loop


class PaymentProcessor:
    def __init__(self, db: Session):
        self.db = db
        self.qr_service = BankQRService()

    # ---------------------------------------------------------
    # CREATE QR PAYMENT
    # ---------------------------------------------------------
    async def create_qr_payment(self, user_id: int, amount: float, violation_id: Optional[int] = None) -> Payment:
        """
        Tạo payment với QR code (trạng thái CREATED)
        """
        qr_info = self.qr_service.create_payment_qr(
            amount=amount,
            user_id=user_id,
            description=f"Thanh toán phạt - user:{user_id}"
        )

        payment = Payment(
            user_id=user_id,
            violation_id=violation_id,
            payment_type=PaymentType.FINE_PAYMENT.value,
            amount=amount,
            status=PaymentStatus.CREATED.value,  # ✔ QR mới tạo => CREATED
            payment_method=PaymentMethod.QR_CODE.value,

            qr_code_data=qr_info["qr_url"],  # Lưu QR URL vào qr_code_data
            qr_code_image=None,  # Không cần lưu image nữa
            qr_transaction_id=qr_info["qr_transaction_id"],
            qr_expiry_time=qr_info["qr_expiry"],
            bank_account_number=qr_info["bank_account"],
            bank_name=qr_info["bank_name"],
            transfer_content=qr_info["transfer_content"],

            receipt_number=f"INV{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(4).upper()}",
            description=f"Thanh toán phạt qua QR - {qr_info['qr_transaction_id']}"
        )

        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)

        # Bắt đầu monitor giao dịch
        asyncio.create_task(self.monitor_payment_status(payment.id))

        return payment

    # ---------------------------------------------------------
    # MONITOR PAYMENT (ASYNC CHECK)
    # ---------------------------------------------------------
    async def monitor_payment_status(self, payment_id: int):
        """
        Giám sát giao dịch QR (mô phỏng)
        TRONG THỰC TẾ → dùng webhook
        """

        for _ in range(180):  # tối đa 30 phút
            await asyncio.sleep(10)

            # tạo session mới (session cũ đã đóng sau HTTP request)
            db = SessionLocal()

            payment = db.query(Payment).filter(Payment.id == payment_id).first()

            if not payment:
                db.close()
                return

            # QR hết hạn
            if datetime.now() > payment.qr_expiry_time:
                if payment.status != PaymentStatus.PAID.value:
                    payment.status = PaymentStatus.CANCELLED.value
                    db.commit()
                db.close()
                return

            # mô phỏng kiểm tra giao dịch
            if await self.check_bank_transaction(payment.qr_transaction_id):

                payment.status = PaymentStatus.PAID.value
                payment.paid_at = datetime.now()

                # cập nhật trạng thái violation nếu có
                if payment.violation_id:
                    violation = db.query(Violation).filter(
                        Violation.id == payment.violation_id
                    ).first()
                    if violation:
                        violation.status = "paid"

                db.commit()
                db.close()
                return

            db.close()

    # ---------------------------------------------------------
    # MOCK BANK CHECK
    # ---------------------------------------------------------
    async def check_bank_transaction(self, transaction_id: str) -> bool:
        """
        Mô phỏng check giao dịch ngân hàng.
        30% khả năng thành công trong 20–60 giây.
        """
        import random
        await asyncio.sleep(random.randint(15, 50))
        return random.random() < 0.3

    # ---------------------------------------------------------
    # GET OUTSTANDING BALANCE
    # ---------------------------------------------------------
    def get_user_outstanding_balance(self, user_id: int) -> float:
        """
        Tổng tiền phạt chưa thanh toán
        """
        from sqlalchemy import func

        total = self.db.query(func.sum(Payment.amount)).filter(
            Payment.user_id == user_id,
            Payment.payment_type == PaymentType.FINE_PAYMENT.value,
            Payment.status != PaymentStatus.PAID.value
        ).scalar()

        return float(total or 0.0)
