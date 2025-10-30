from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
from app.models.payment import Payment
from app.models.violation import Violation
from app.models.user import User
from app.models.vehicle import Vehicle

class PaymentService:
    def __init__(self, db: Session):
        self.db = db

    def get_payment_by_id(self, payment_id: int) -> Payment:
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Thanh toán không tồn tại"
            )
        return payment

    def create_payment(self, violation_id: int, payment_method: str = "bank_transfer") -> Payment:
        # Get violation
        violation = self.db.query(Violation).filter(Violation.id == violation_id).first()
        if not violation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vi phạm không tồn tại"
            )
        
        if violation.status != 'approved':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Chỉ có thể thanh toán cho vi phạm đã được duyệt"
            )
        
        # Check if payment already exists
        existing_payment = self.db.query(Payment).filter(
            Payment.violation_id == violation_id
        ).first()
        
        if existing_payment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Đã tồn tại thanh toán cho vi phạm này"
            )
        
        # Calculate amount (in real app, get from violation type)
        base_amount = Decimal('500000')  # 500,000 VND
        due_date = datetime.now() + timedelta(days=30)
        
        # Get vehicle from license plate
        vehicle = self.db.query(Vehicle).filter(
            Vehicle.license_plate == violation.license_plate
        ).first()
        
        payment = Payment(
            violation_id=violation_id,
            vehicle_id=vehicle.id if vehicle else None,
            user_id=violation.driving_license.user_id if violation.driving_license else None,
            payment_type='fine_payment',
            amount=base_amount,
            original_fine=base_amount,
            due_date=due_date,
            payment_method=payment_method,
            status='pending'
        )
        
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        
        return payment

    def process_payment(self, payment_id: int, gateway_transaction_id: str) -> Payment:
        payment = self.get_payment_by_id(payment_id)
        
        if payment.status == 'paid':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Thanh toán đã được xử lý"
            )
        
        payment.status = 'paid'
        payment.paid_at = datetime.now()
        payment.gateway_transaction_id = gateway_transaction_id
        
        self.db.commit()
        self.db.refresh(payment)
        
        return payment

    def get_user_payments(self, user_id: int, status: Optional[str] = None) -> List[Payment]:
        # Get user's vehicles
        from app.models.vehicle import Vehicle
        user_vehicles = self.db.query(Vehicle).filter(Vehicle.owner_id == user_id).all()
        vehicle_ids = [vehicle.id for vehicle in user_vehicles]
        
        query = self.db.query(Payment).filter(Payment.vehicle_id.in_(vehicle_ids))
        
        if status:
            query = query.filter(Payment.status == status)
        
        return query.order_by(Payment.created_at.desc()).all()

    def get_pending_payments(self, skip: int = 0, limit: int = 50) -> List[Payment]:
        return self.db.query(Payment).filter(
            Payment.status == 'pending'
        ).offset(skip).limit(limit).all()

    def calculate_late_fee(self, payment_id: int) -> Decimal:
        payment = self.get_payment_by_id(payment_id)
        
        if payment.status == 'paid':
            return Decimal('0')
        
        if datetime.now() > payment.due_date:
            days_late = (datetime.now() - payment.due_date).days
            late_fee = payment.original_fine * Decimal('0.01') * days_late  # 1% per day
            return min(late_fee, payment.original_fine * Decimal('2'))  # Max 200%
        
        return Decimal('0')

    def get_payment_statistics(self, start_date: datetime, end_date: datetime) -> dict:
        total_revenue = self.db.query(Payment).filter(
            Payment.paid_at.between(start_date, end_date),
            Payment.status == 'paid'
        ).with_entities(Payment.amount).all()
        
        total_revenue_amount = sum([payment.amount for payment in total_revenue])
        
        pending_payments = self.db.query(Payment).filter(
            Payment.status == 'pending'
        ).count()
        
        successful_payments = self.db.query(Payment).filter(
            Payment.paid_at.between(start_date, end_date),
            Payment.status == 'paid'
        ).count()
        
        return {
            "total_revenue": float(total_revenue_amount),
            "pending_payments": pending_payments,
            "successful_payments": successful_payments,
            "collection_rate": successful_payments / (successful_payments + pending_payments) if (successful_payments + pending_payments) > 0 else 0
        }

    def generate_receipt(self, payment_id: int) -> dict:
        payment = self.get_payment_by_id(payment_id)
        violation = self.db.query(Violation).filter(Violation.id == payment.violation_id).first()
        vehicle = self.db.query(Vehicle).filter(Vehicle.id == payment.vehicle_id).first()
        
        # Get license plate from violation if vehicle not found
        license_plate = vehicle.license_plate if vehicle else (violation.license_plate if violation else "N/A")
        
        return {
            "receipt_number": f"RCP-{payment.id:06d}",
            "payment_date": payment.paid_at or datetime.now(),
            "violation_code": f"VN{violation.id:06d}" if violation else "N/A",
            "license_plate": license_plate,
            "violation_type": violation.violation_type if violation else "N/A",
            "amount": float(payment.amount),
            "late_fee": float(payment.late_penalty),
            "total_amount": float(payment.amount + payment.late_penalty),
            "payment_method": payment.payment_method,
            "location": violation.location_name if violation else "N/A",
            "violation_time": violation.detected_at if violation else "N/A"
        }