from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models import DailyStats, Violation, Payment

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_dashboard_stats(self, start_date: datetime, end_date: datetime):
        # Thống kê vi phạm
        violations = self.db.query(Violation).filter(
            Violation.detected_at.between(start_date, end_date)
        ).all()
        
        # Thống kê doanh thu
        revenue = self.db.query(Payment).filter(
            Payment.paid_at.between(start_date, end_date),
            Payment.status == 'paid'
        ).all()
        
        return {
            "total_violations": len(violations),
            "total_revenue": sum(p.amount for p in revenue),
            # Thêm các metrics khác...
        }