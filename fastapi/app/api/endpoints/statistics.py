from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from app.core.database import get_db
from app.api.dependencies import require_roles
from app.models.user import User
from app.models.violation import Violation
from app.models.payment import Payment, PaymentStatus

router = APIRouter()

@router.get("")
def get_statistics(
    date_range: str = Query("7days", description="Time range: 7days, 30days, 3months, year"),
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db)
):
    """Lấy thống kê tổng quan cho dashboard"""
    
    # Calculate date range
    now = datetime.now()
    if date_range == "7days":
        start_date = now - timedelta(days=7)
    elif date_range == "30days":
        start_date = now - timedelta(days=30)
    elif date_range == "3months":
        start_date = now - timedelta(days=90)
    elif date_range == "year":
        start_date = datetime(now.year, 1, 1)
    else:
        start_date = now - timedelta(days=7)
    
    # Overview stats
    total_violations = db.query(Violation).filter(
        Violation.detected_at >= start_date
    ).count()
    
    pending_violations = db.query(Violation).filter(
        Violation.detected_at >= start_date,
        Violation.status == "pending"
    ).count()
    
    processed_violations = db.query(Violation).filter(
        Violation.detected_at >= start_date,
        Violation.status.in_(["approved", "paid"])
    ).count()
    
    total_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.paid_at >= start_date,
        Payment.status == PaymentStatus.PAID.value
    ).scalar() or 0
    
    overview = {
        "total_violations": total_violations,
        "pending_violations": pending_violations,
        "processed_violations": processed_violations,
        "total_revenue": float(total_revenue),
        "processing_rate": round((processed_violations / total_violations * 100) if total_violations > 0 else 0, 2)
    }
    
    # Violation trends (daily)
    trends = []
    days_count = (now - start_date).days
    for i in range(days_count + 1):
        day = start_date + timedelta(days=i)
        day_start = datetime(day.year, day.month, day.day)
        day_end = day_start + timedelta(days=1)
        
        count = db.query(Violation).filter(
            Violation.detected_at >= day_start,
            Violation.detected_at < day_end
        ).count()
        
        trends.append({
            "date": day.strftime("%d/%m"),
            "count": count
        })
    
    # Violation types distribution
    violation_types = db.query(
        Violation.violation_type,
        func.count(Violation.id).label('count')
    ).filter(
        Violation.detected_at >= start_date
    ).group_by(Violation.violation_type).all()
    
    types = [
        {
            "type": vt.violation_type or "Không xác định",
            "count": vt.count
        }
        for vt in violation_types
    ]
    
    # Top locations
    locations = db.query(
        Violation.location_name,
        func.count(Violation.id).label('count')
    ).filter(
        Violation.detected_at >= start_date,
        Violation.location_name.isnot(None)
    ).group_by(Violation.location_name).order_by(
        func.count(Violation.id).desc()
    ).limit(10).all()
    
    location_data = [
        {
            "location": loc.location_name or "Không xác định",
            "count": loc.count
        }
        for loc in locations
    ]
    
    # Processing efficiency
    avg_processing_time = db.query(
        func.avg(
            func.extract('epoch', Violation.reviewed_at - Violation.detected_at)
        )
    ).filter(
        Violation.detected_at >= start_date,
        Violation.reviewed_at.isnot(None)
    ).scalar()
    
    efficiency = {
        "total_processed": processed_violations,
        "total_pending": pending_violations,
        "avg_processing_hours": round(float(avg_processing_time or 0) / 3600, 2),
        "processing_rate": round((processed_violations / total_violations * 100) if total_violations > 0 else 0, 2)
    }
    
    return {
        "overview": overview,
        "trends": trends,
        "types": types,
        "locations": location_data,
        "efficiency": efficiency
    }
