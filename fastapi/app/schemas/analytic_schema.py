from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TimeRangeRequest(BaseModel):
    start_date: datetime
    end_date: datetime
    group_by: Optional[str] = "day"

class AnalyticsResponse(BaseModel):
    period: str
    total_violations: int
    total_revenue: float
    approval_rate: float

class DashboardStats(BaseModel):
    total_violations: int
    total_revenue: float
    active_cameras: int
    pending_reviews: int