from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, List, Dict, Any

from app.models.payment import Payment, PaymentStatus, PaymentMethod, PaymentType
from app.models.violation import Violation
from app.models.user import User
from app.models.vehicle import Vehicle


class PaymentService:
    def __init__(self, db: Session):
        self.db = db

    # -------------------------------
    # COMMON UTILS
    # -------------------------------
    def get_payment_by_id(self, payment_id: int) -> Payment:
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise HTTPException(404, "Thanh toán không tồn tại")
        return payment

    # -------------------------------
    # CREATE FINE PAYMENT
    # -------------------------------
    def create_fine_payment(self, violation_id: int, user_id: int) -> Payment:
        violation = self.db.query(Violation).filter(Violation.id == violation_id).first()
        if not violation:
            raise HTTPException(404, "Vi phạm không tồn tại")

        if violation.status != "approved":
            raise HTTPException(400, "Chỉ có thể thanh toán cho vi phạm đã được duyệt")

        # Kiểm tra đã có payment hay chưa
        existed = self.db.query(Payment).filter(
            Payment.violation_id == violation_id,
            Payment.payment_type == PaymentType.FINE_PAYMENT.value
        ).first()

        if existed:
            raise HTTPException(400, "Đã tồn tại thanh toán cho vi phạm này")

        vehicle = self.db.query(Vehicle).filter(
            Vehicle.license_plate == violation.license_plate
        ).first()

        user = self.db.query(User).filter(User.id == user_id).first()

        # Hardcode fine amount (thực tế lấy từ violation_type)
        base_amount = Decimal("500000")
        due_date = datetime.now() + timedelta(days=30)

        receipt_number = f"RCP-{datetime.now().strftime('%Y%m%d')}-{violation_id:06d}"

        payment = Payment(
            violation_id=violation_id,
            vehicle_id=vehicle.id if vehicle else None,
            user_id=user_id,
            payment_type=PaymentType.FINE_PAYMENT.value,
            amount=base_amount,
            original_fine=base_amount,
            due_date=due_date.date(),
            receipt_number=receipt_number,
            payer_name=user.full_name,
            payer_identification=user.identification_number,
            status=PaymentStatus.CREATED.value  # ✔ Sửa từ PENDING → CREATED
        )

        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)

        return payment

    # -------------------------------
    # GET USER PAYMENTS
    # -------------------------------
    def get_user_payments(self, user_id: int, status: Optional[str] = None) -> List[Payment]:
        q = self.db.query(Payment).filter(Payment.user_id == user_id)
        if status:
            q = q.filter(Payment.status == status)
        return q.order_by(Payment.created_at.desc()).all()

    def get_pending_payments(self, skip: int = 0, limit: int = 50) -> List[Payment]:
        return (
            self.db.query(Payment)
            .filter(Payment.status == PaymentStatus.PENDING.value)
            .offset(skip)
            .limit(limit)
            .all()
        )

    # -------------------------------
    # LATE FEE CALCULATION
    # -------------------------------
    def calculate_late_fee(self, payment_id: int) -> Decimal:
        payment = self.get_payment_by_id(payment_id)

        if payment.status == PaymentStatus.PAID.value:
            return Decimal("0")

        if datetime.now().date() > payment.due_date:
            days_late = (datetime.now().date() - payment.due_date).days
            late_fee = payment.original_fine * Decimal("0.01") * days_late
            return min(late_fee, payment.original_fine * Decimal("2"))
        return Decimal("0")

    # -------------------------------
    # STATS
    # -------------------------------
    def get_payment_statistics(self, start_date: datetime, end_date: datetime) -> dict:
        paid = self.db.query(Payment).filter(
            Payment.paid_at.between(start_date, end_date),
            Payment.status == PaymentStatus.PAID.value
        ).all()

        total_revenue = sum([p.amount for p in paid])
        pending = self.db.query(Payment).filter(
            Payment.status == PaymentStatus.PENDING.value
        ).count()

        success = len(paid)

        return {
            "total_revenue": float(total_revenue),
            "pending_payments": pending,
            "successful_payments": success,
            "collection_rate": success / (success + pending) if (success + pending) else 0
        }

    # -------------------------------
    # RECEIPT INFO
    # -------------------------------
    def generate_receipt(self, payment_id: int) -> dict:
        payment = self.get_payment_by_id(payment_id)
        violation = (
            self.db.query(Violation).filter(Violation.id == payment.violation_id).first()
            if payment.violation_id else None
        )
        vehicle = (
            self.db.query(Vehicle).filter(Vehicle.id == payment.vehicle_id).first()
            if payment.vehicle_id else None
        )

        license_plate = (
            vehicle.license_plate
            if vehicle else getattr(violation, "license_plate", "N/A")
        )

        return {
            "receipt_number": f"RCP-{payment.id:06d}",
            "payment_date": payment.paid_at,
            "violation_code": f"VN{violation.id:06d}" if violation else "N/A",
            "license_plate": license_plate,
            "violation_type": getattr(violation, "violation_type", "N/A"),
            "amount": float(payment.amount),
            "late_fee": float(payment.late_penalty or 0),
            "total_amount": float(payment.amount + (payment.late_penalty or 0)),
            "payment_method": payment.payment_method.value if payment.payment_method else None,
            "location": getattr(violation, "location_name", "N/A"),
            "violation_time": getattr(violation, "detected_at", "N/A"),
        }

    # -------------------------------
    # WALLET DEPOSIT
    # -------------------------------
    def deposit_to_wallet(self, user_id: int, amount: Decimal, payment_method: str) -> Payment:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(404, "Người dùng không tồn tại")

        receipt_number = f"DEP-{datetime.now().strftime('%Y%m%d')}-{user_id:06d}"

        payment = Payment(
            user_id=user_id,
            payment_type=PaymentType.WALLET_DEPOSIT.value,
            amount=amount,
            payment_method=payment_method,
            wallet_balance_before=user.wallet_balance,
            wallet_balance_after=user.wallet_balance + amount,
            receipt_number=receipt_number,
            payer_name=user.full_name,
            payer_identification=user.identification_number,
            status=PaymentStatus.PAID.value,  # Nếu sau này nạp bằng QR → đổi thành CREATED
            paid_at=datetime.now(),
            description=f"Nạp tiền vào ví - {amount} VNĐ"
        )

        user.wallet_balance += amount
        user.total_deposited += amount

        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        return payment

    # -------------------------------
    # PAY FINE FROM WALLET
    # -------------------------------
    def pay_fine_from_wallet(self, payment_id: int, user_id: int) -> Payment:
        payment = self.get_payment_by_id(payment_id)

        if payment.payment_type != PaymentType.FINE_PAYMENT.value:
            raise HTTPException(400, "Chỉ có thể thanh toán phạt từ ví")

        if payment.user_id != user_id:
            raise HTTPException(403, "Bạn không có quyền thanh toán khoản phạt này")

        if payment.status == PaymentStatus.PAID.value:
            raise HTTPException(400, "Giao dịch đã được thanh toán")

        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(404, "Người dùng không tồn tại")

        if user.wallet_balance < payment.amount:
            raise HTTPException(400, "Số dư ví không đủ")

        # Cập nhật giao dịch
        payment.wallet_balance_before = user.wallet_balance
        payment.wallet_balance_after = user.wallet_balance - payment.amount
        payment.payment_method = PaymentMethod.WALLET.value
        payment.status = PaymentStatus.PAID.value
        payment.paid_at = datetime.now()
        payment.is_auto_deduct = True

        # Cập nhật user wallet
        user.wallet_balance -= payment.amount
        user.total_paid_fines += payment.amount

        # Không tự giảm pending_fines vì không được cập nhật tại đây
        # pending_fines phải tính từ DB tổng các fines chưa trả

        self.db.commit()
        self.db.refresh(payment)
        return payment

    # -------------------------------
    # WALLET SUMMARY
    # -------------------------------
    def get_wallet_summary(self, user_id: int) -> Dict[str, Any]:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(404, "Người dùng không tồn tại")

        deposits = self.db.query(Payment).filter(
            Payment.user_id == user_id,
            Payment.payment_type == PaymentType.WALLET_DEPOSIT.value,
            Payment.status == PaymentStatus.PAID.value
        ).all()

        fine_payments = self.db.query(Payment).filter(
            Payment.user_id == user_id,
            Payment.payment_type == PaymentType.FINE_PAYMENT.value,
            Payment.status == PaymentStatus.PAID.value
        ).all()

        total_deposited = sum([p.amount for p in deposits])
        total_paid_fines = sum([p.amount for p in fine_payments])

        # pending fines = tổng các fine payments chưa trả
        pending_fines = sum([
            p.amount for p in self.db.query(Payment).filter(
                Payment.user_id == user_id,
                Payment.payment_type == PaymentType.FINE_PAYMENT.value,
                Payment.status != PaymentStatus.PAID.value
            ).all()
        ])

        return {
            "wallet_balance": float(user.wallet_balance),
            "total_deposited": float(total_deposited),
            "total_paid_fines": float(total_paid_fines),
            "pending_fines": float(pending_fines),
            "available_balance": float(user.wallet_balance - pending_fines),
            "can_auto_pay": user.wallet_balance >= pending_fines
        }
