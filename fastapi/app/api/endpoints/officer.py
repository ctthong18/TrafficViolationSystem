from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from decimal import Decimal
import base64
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.payment import Payment, PaymentStatus
from app.models.user import User
from app.services.payment_service import PaymentService
from app.services.payment_processor import PaymentProcessor
from app.api.dependencies import require_role
from typing import List
from app.services.violation_service import ViolationService
from app.services.activity_service import ActivityService
from app.schemas.recent_activity_schema import RecentActivityResponse
from app.schemas.violation_schema import ViolationReview, ViolationResponse, ViolationListResponse
router = APIRouter()

@router.get("/violations/review-queue", response_model=ViolationListResponse)
def get_review_queue(
    skip: int = 0,
    limit: int = 50,
    priority: str = Query(None),
    current_user: User = Depends(require_role("officer")),
    db: Session = Depends(get_db)
):
    """Get violations in review queue for officer"""
    violation_service = ViolationService(db)
    violations = violation_service.get_pending_violations(skip, limit, priority)
    total = violation_service.count_pending_violations(priority)
    
    return ViolationListResponse(
        violations=violations,
        total=total,
        page=skip // limit + 1 if limit > 0 else 1,
        size=limit
    )

@router.post("/violations/{violation_id}/review", response_model=ViolationResponse)
def review_violation(
    violation_id: int,
    review_data: ViolationReview,
    current_user: User = Depends(require_role("officer")),
    db: Session = Depends(get_db)
):
    """Review violation with action (approve/reject) and optional notes"""
    violation_service = ViolationService(db)
    result = violation_service.review_violation(
        violation_id, current_user.id, review_data.action, review_data.notes
    )
    return result

@router.get("/complaints/assigned")
def get_assigned_complaints(
    current_user: User = Depends(require_role("officer")),
    db: Session = Depends(get_db)
):
    # Lấy các khiếu nại được phân công
    from app.services.complaint_service import ComplaintService
    complaint_service = ComplaintService(db)
    return complaint_service.get_assigned_complaints(current_user.id)

@router.get("/dashboard/stats")
def get_officer_dashboard(
    current_user: User = Depends(require_role("officer")),
    db: Session = Depends(get_db)
):
    # Thống kê cá nhân cho officer
    violation_service = ViolationService(db)
    stats = violation_service.get_officer_stats(current_user.id)

    return {
        "total_reviewed": stats.get("total_reviewed", 0),
        "approved_today": stats.get("approved_today", 0),
        "rejected_today": stats.get("rejected_today", 0),
        "pending_reviews": stats.get("pending_assigned", 0),
        "efficiency_rate": stats.get("efficiency_rate", 0),
        "average_processing_time": stats.get("average_processing_time", 0),
    }
    
@router.get(
    "/dashboard/activities",
    response_model=List[RecentActivityResponse]  # <-- Rất quan trọng!
)
def get_officer_activities(
    current_user: User = Depends(require_role("officer")),
    db: Session = Depends(get_db)
):
    """
    Lấy các hoạt động gần đây (vd: 10 hoạt động) cho officer hiện tại.
    Frontend (OverviewActivity) mong đợi một MẢNG (list) JSON.
    """
    activity_service = ActivityService(db)
    
    # Giả sử service của bạn có một hàm để lấy hoạt động theo user_id
    # Lấy 10 hoạt động mới nhất
    activities = activity_service.get_recent_activities_for_user(
        user_id=current_user.id, 
        limit=10 
    )
    
    # Bằng cách dùng `response_model=List[RecentActivityResponse]`,
    # FastAPI sẽ tự động chuyển đổi danh sách 'activities' (từ SQLAlchemy)
    # thành một mảng JSON mà frontend của bạn mong đợi.
    return activities

@router.post("/fines/{violation_id}")
async def create_fine_payment(
    violation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create fine payment for violation"""
    payment_service = PaymentService(db)
    return payment_service.create_fine_payment(violation_id, current_user.id)

@router.post("/payments/qr/{user_id}")
async def create_qr_payment(user_id: int, db: Session = Depends(get_db)):
    processor = PaymentProcessor(db)
    outstanding_balance = processor.get_user_outstanding_balance(user_id)

    if outstanding_balance <= 0:
        raise HTTPException(status_code=400, detail="Không có khoản phạt nào cần thanh toán")

    payment = await processor.create_qr_payment(user_id=user_id, amount=outstanding_balance)

    # Trả về QR URL thay vì base64
    qr_url = payment.qr_code_data if payment.qr_code_data else None

    return {
        "payment_id": payment.id,
        "qr_url": qr_url,
        "qr_image_base64": None,  # Giữ lại để backward compatibility
        "qr_transaction_id": payment.qr_transaction_id,
        "amount": float(payment.amount),
        "bank_account": payment.bank_account_number,
        "bank_name": payment.bank_name,
        "transfer_content": payment.transfer_content,
        "expiry_time": payment.qr_expiry_time
    }

@router.get("/payments/{payment_id}/status")
async def get_payment_status(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    return {
        "payment_id": payment.id,
        "status": payment.status.value,
        "amount": float(payment.amount),
        "paid_at": payment.paid_at,
        "qr_expiry": payment.qr_expiry_time
    }