from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db

router = APIRouter(prefix="/analytics", tags=["calendar-analytics"])

@router.get("/calendar-range")
async def get_calendar_range_data(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """Lấy dữ liệu cho calendar range picker"""
    
    start_dt = datetime.fromisoformat(start_date)
    end_dt = datetime.fromisoformat(end_date)
    
    # Tính số ngày
    days_count = (end_dt - start_dt).days + 1
    
    analytics_service = CalendarAnalyticsService(db)
    
    return {
        "time_range": {
            "start_date": start_date,
            "end_date": end_date,
            "days_count": days_count,
            "period_label": f"{start_date} đến {end_date}"
        },
        "summary": await analytics_service.get_calendar_summary(start_dt, end_dt),
        "trends": await analytics_service.get_daily_trends(start_dt, end_dt),
        "hotspots": await analytics_service.get_hotspots_in_range(start_dt, end_dt),
        "revenue_trends": await analytics_service.get_revenue_by_day(start_dt, end_dt)
    }

@router.get("/calendar-daily-stats")
async def get_calendar_daily_stats(
    date: str = Query(..., description="Specific date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """Lấy thống kê cho 1 ngày cụ thể (hover effect)"""
    specific_date = datetime.fromisoformat(date)
    
    analytics_service = CalendarAnalyticsService(db)
    return await analytics_service.get_daily_detail(specific_date)