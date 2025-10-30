from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.core.database import get_db
from app.api.dependencies import get_current_user, require_roles
from app.models.user import User
from app.schemas.denuciation_schema import (
    DenunciationCreate, DenunciationResponse, DenunciationListResponse,
    DenunciationUpdate, DenunciationStatsResponse, DenunciationExportResponse,
    DenunciationStatus, DenunciationType
)
from app.services.denuciation_service import DenunciationService

router = APIRouter()

@router.post("/", response_model=DenunciationResponse, status_code=status.HTTP_201_CREATED)
async def create_denunciation(
    denunciation_data: DenunciationCreate,
    db: Session = Depends(get_db)
):
    """Tạo tố cáo mới (có thể ẩn danh)"""
    denunciation_service = DenunciationService(db)
    return denunciation_service.create_denunciation(denunciation_data.dict())

@router.get("/", response_model=DenunciationListResponse)
async def get_denunciations(
    status: Optional[DenunciationStatus] = Query(None),
    denunciation_type: Optional[DenunciationType] = Query(None),
    severity: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db)
):
    """Lấy danh sách tố cáo (Admin/Officer only)"""
    denunciation_service = DenunciationService(db)
    denunciations = denunciation_service.search_denunciations(
        status=status,
        denunciation_type=denunciation_type,
        severity=severity,
        skip=skip,
        limit=limit
    )
    
    total = denunciation_service.db.query(Denunciation).count()
    
    return DenunciationListResponse(
        denunciations=denunciations,
        total=total,
        page=skip // limit + 1,
        size=limit
    )

@router.get("/assigned", response_model=DenunciationListResponse)
async def get_assigned_denunciations(
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db)
):
    """Lấy tố cáo được phân công cho điều tra viên"""
    denunciation_service = DenunciationService(db)
    denunciations = denunciation_service.get_assigned_denunciations(current_user.id)
    
    return DenunciationListResponse(
        denunciations=denunciations,
        total=len(denunciations),
        page=1,
        size=len(denunciations)
    )

@router.get("/stats", response_model=DenunciationStatsResponse)
async def get_denunciation_stats(
    start_date: datetime = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: datetime = Query(..., description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db)
):
    """Lấy thống kê tố cáo"""
    denunciation_service = DenunciationService(db)
    stats = denunciation_service.get_denunciation_statistics(start_date, end_date)
    return DenunciationStatsResponse(**stats)

# Thêm các endpoints khác...