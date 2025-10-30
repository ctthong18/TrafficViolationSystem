from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies import get_current_user, require_role
from app.models.user import User
from app.services.violation_service import ViolationService

router = APIRouter()

@router.get("/violations/review-queue")
def get_review_queue(
    skip: int = 0,
    limit: int = 50,
    priority: str = Query(None),
    current_user: User = Depends(require_role("officer")),
    db: Session = Depends(get_db)
):
    violation_service = ViolationService(db)
    violations = violation_service.get_pending_violations(skip, limit, priority)
    return violations

@router.post("/violations/{violation_id}/review")
def review_violation(
    violation_id: int,
    action: str,  # 'approve' or 'reject'
    notes: str = None,
    current_user: User = Depends(require_role("officer")),
    db: Session = Depends(get_db)
):
    violation_service = ViolationService(db)
    result = violation_service.review_violation(
        violation_id, current_user.id, action, notes
    )
    return {"message": f"Đã {action} vi phạm", "violation": result}

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
        "pending_reviews": stats.pending_count,
        "approved_today": stats.approved_today,
        "efficiency_rate": stats.efficiency_rate,
        "average_processing_time": stats.avg_processing_time
    }