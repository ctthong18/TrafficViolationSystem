from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.services.ai_log_service import AILogService
from app.schemas.ai_log_schema import (
    AILogCreate, AILogUpdate, AILogResponse, 
    AILogFilter, AILogStats
)

router = APIRouter()

@router.post("/logs", response_model=AILogResponse)
async def create_ai_log(
    ai_log_data: AILogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Tạo AI log mới"""
    ai_log_service = AILogService(db)
    ai_log = ai_log_service.create_ai_log(ai_log_data)
    return AILogResponse.from_attributes(ai_log)

@router.get("/logs", response_model=List[AILogResponse])
async def get_ai_logs(
    camera_id: Optional[int] = Query(None),
    detection_type: Optional[str] = Query(None),
    is_processed: Optional[bool] = Query(None),
    is_violation: Optional[bool] = Query(None),
    license_plate: Optional[str] = Query(None),
    vehicle_type: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    min_confidence: Optional[float] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    order_by: str = Query("timestamp"),
    order_desc: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lấy danh sách AI logs"""
    filters = AILogFilter(
        camera_id=camera_id,
        detection_type=detection_type,
        is_processed=is_processed,
        is_violation=is_violation,
        license_plate=license_plate,
        vehicle_type=vehicle_type,
        violation_type=violation_type,
        start_date=start_date,
        end_date=end_date,
        min_confidence=min_confidence
    )
    
    ai_log_service = AILogService(db)
    ai_logs = ai_log_service.get_ai_logs(
        filters=filters,
        skip=skip,
        limit=limit,
        order_by=order_by,
        order_desc=order_desc
    )
    
    return [AILogResponse.from_attributes(log) for log in ai_logs]

@router.get("/logs/{log_id}", response_model=AILogResponse)
async def get_ai_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lấy AI log theo ID"""
    ai_log_service = AILogService(db)
    ai_log = ai_log_service.get_ai_log(log_id)
    
    if not ai_log:
        raise HTTPException(status_code=404, detail="AI log not found")
    
    return AILogResponse.from_attributes(ai_log)

@router.put("/logs/{log_id}", response_model=AILogResponse)
async def update_ai_log(
    log_id: int,
    update_data: AILogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cập nhật AI log"""
    ai_log_service = AILogService(db)
    ai_log = ai_log_service.update_ai_log(log_id, update_data)
    
    if not ai_log:
        raise HTTPException(status_code=404, detail="AI log not found")
    
    return AILogResponse.from_attributes(ai_log)

@router.delete("/logs/{log_id}")
async def delete_ai_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Xóa AI log"""
    ai_log_service = AILogService(db)
    success = ai_log_service.delete_ai_log(log_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="AI log not found")
    
    return {"message": "AI log deleted successfully"}

@router.get("/logs/camera/{camera_id}", response_model=List[AILogResponse])
async def get_ai_logs_by_camera(
    camera_id: int,
    hours: int = Query(24, ge=1, le=168),  # Max 1 week
    detection_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lấy AI logs của camera trong khoảng thời gian"""
    ai_log_service = AILogService(db)
    ai_logs = ai_log_service.get_ai_logs_by_camera(
        camera_id=camera_id,
        hours=hours,
        detection_type=detection_type
    )
    
    return [AILogResponse.from_attributes(log) for log in ai_logs]

@router.get("/logs/violations", response_model=List[AILogResponse])
async def get_violation_logs(
    camera_id: Optional[int] = Query(None),
    hours: int = Query(24, ge=1, le=168),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lấy các logs có vi phạm"""
    ai_log_service = AILogService(db)
    ai_logs = ai_log_service.get_violation_logs(
        camera_id=camera_id,
        hours=hours
    )
    
    return [AILogResponse.from_attributes(log) for log in ai_logs]

@router.get("/logs/stats", response_model=AILogStats)
async def get_ai_log_stats(
    camera_id: Optional[int] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lấy thống kê AI logs"""
    ai_log_service = AILogService(db)
    stats = ai_log_service.get_ai_log_stats(
        camera_id=camera_id,
        start_date=start_date,
        end_date=end_date
    )
    
    return stats

@router.post("/logs/bulk", response_model=List[AILogResponse])
async def bulk_create_ai_logs(
    ai_logs_data: List[AILogCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Tạo nhiều AI logs cùng lúc"""
    ai_log_service = AILogService(db)
    ai_logs = ai_log_service.bulk_create_ai_logs(ai_logs_data)
    
    return [AILogResponse.from_attributes(log) for log in ai_logs]

@router.post("/logs/mark-processed")
async def mark_logs_as_processed(
    log_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Đánh dấu các logs đã được xử lý"""
    ai_log_service = AILogService(db)
    updated_count = ai_log_service.mark_as_processed(log_ids)
    
    return {
        "message": f"Marked {updated_count} logs as processed",
        "updated_count": updated_count
    }