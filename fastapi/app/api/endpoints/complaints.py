from fastapi import APIRouter, Depends, Query, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from app.core.database import get_db
from app.api.dependencies import get_current_user, require_roles
from app.models.user import User
from app.schemas.complaint_schema import (
    ComplaintCreate, ComplaintResponse, ComplaintListResponse,
    ComplaintUpdate, AppealCreate, AppealResponse,
    ComplaintActivityResponse, ComplaintStatus, ComplaintType
)
from app.services.complaint_service import ComplaintService

router = APIRouter()

@router.post("/", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tạo khiếu nại mới. Hỗ trợ cả JSON (ComplaintCreate) và multipart/form-data từ frontend.

    - JSON body: theo schema ComplaintCreate
    - multipart/form-data: các field minimal như type, location, time, date, license_plate, description, evidence (file)
    """
    complaint_service = ComplaintService(db)

    content_type = request.headers.get("content-type", "")
    if content_type.startswith("multipart/form-data"):
        form = await request.form()
        violation_type = form.get("type")
        location = form.get("location")
        time = form.get("time")
        date = form.get("date")
        license_plate = form.get("license_plate")
        description = form.get("description")
        # evidence = form.get("evidence")  # UploadFile, not persisted here

        title = f"Báo cáo vi phạm {license_plate or ''}".strip()
        composed_description = description or f"{violation_type or ''} tại {location or ''} vào {date or ''} {time or ''}".strip()

        payload = ComplaintCreate(
            title=title or "Báo cáo vi phạm",
            description=composed_description or "",
            complaint_type=ComplaintType.OTHER,
            desired_resolution=None,
            is_anonymous=False,
            violation_id=None,
            vehicle_id=None,
            evidence_urls=None,
        )
        return complaint_service.create_complaint(payload.dict(), current_user.id)

    # Mặc định: JSON
    body = await request.json()
    try:
        payload = ComplaintCreate(**body)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid complaint payload")
    return complaint_service.create_complaint(payload.dict(), current_user.id)

@router.get("/", response_model=ComplaintListResponse)
async def get_complaints(
    status: Optional[ComplaintStatus] = Query(None),
    complaint_type: Optional[ComplaintType] = Query(None),
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy danh sách khiếu nại"""
    complaint_service = ComplaintService(db)
    
    # Citizen chỉ xem được khiếu nại của mình
    if current_user.role == "citizen":
        complaints = complaint_service.get_user_complaints(current_user.id)
        total = len(complaints)
        complaints = complaints[skip:skip + limit]
    else:
        # Admin/Officer xem được tất cả
        complaints = complaint_service.search_complaints(
            status=status,
            complaint_type=complaint_type,
            skip=skip,
            limit=limit
        )
        total = complaint_service.get_complaints_count()
    
    return ComplaintListResponse(
        complaints=complaints,
        total=total,
        page=skip // limit + 1,
        size=limit
    )

@router.get("/my-complaints", response_model=ComplaintListResponse)
async def get_my_complaints(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy khiếu nại của người dùng hiện tại"""
    complaint_service = ComplaintService(db)
    complaints = complaint_service.get_user_complaints(current_user.id)
    
    return ComplaintListResponse(
        complaints=complaints,
        total=len(complaints),
        page=1,
        size=len(complaints)
    )

@router.get("/assigned", response_model=ComplaintListResponse)
async def get_assigned_complaints(
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db)
):
    """Lấy khiếu nại được phân công cho officer"""
    complaint_service = ComplaintService(db)
    complaints = complaint_service.get_assigned_complaints(current_user.id)
    
    return ComplaintListResponse(
        complaints=complaints,
        total=len(complaints),
        page=1,
        size=len(complaints)
    )

@router.get("/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint_detail(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy chi tiết khiếu nại"""
    complaint_service = ComplaintService(db)
    complaint = complaint_service.get_complaint_by_id(complaint_id)
    
    # Kiểm tra quyền truy cập
    if current_user.role == "citizen" and complaint.complainant_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền xem khiếu nại này"
        )
    
    return complaint

@router.put("/{complaint_id}", response_model=ComplaintResponse)
async def update_complaint(
    complaint_id: int,
    complaint_data: ComplaintUpdate,
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db)
):
    """Cập nhật khiếu nại (Officer/Admin only)"""
    complaint_service = ComplaintService(db)
    return complaint_service.update_complaint(complaint_id, complaint_data.dict())

@router.post("/{complaint_id}/assign")
async def assign_complaint(
    complaint_id: int,
    officer_id: int,
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db)
):
    """Phân công khiếu nại cho officer"""
    complaint_service = ComplaintService(db)
    return complaint_service.assign_complaint(complaint_id, officer_id, current_user.id)

@router.post("/{complaint_id}/resolve", response_model=ComplaintResponse)
async def resolve_complaint(
    complaint_id: int,
    resolution: str,
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db)
):
    """Giải quyết khiếu nại"""
    complaint_service = ComplaintService(db)
    return complaint_service.resolve_complaint(complaint_id, resolution, current_user.id)

@router.post("/{complaint_id}/appeals", response_model=AppealResponse)
async def create_appeal(
    complaint_id: int,
    appeal_data: AppealCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tạo kháng cáo cho khiếu nại"""
    complaint_service = ComplaintService(db)
    
    # Kiểm tra quyền tạo kháng cáo
    complaint = complaint_service.get_complaint_by_id(complaint_id)
    if current_user.role == "citizen" and complaint.complainant_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền tạo kháng cáo cho khiếu nại này"
        )
    
    return complaint_service.create_appeal(complaint_id, appeal_data.dict())

@router.get("/{complaint_id}/activities", response_model=List[ComplaintActivityResponse])
async def get_complaint_activities(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy lịch sử hoạt động của khiếu nại"""
    complaint_service = ComplaintService(db)
    
    # Kiểm tra quyền truy cập
    complaint = complaint_service.get_complaint_by_id(complaint_id)
    if current_user.role == "citizen" and complaint.complainant_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền xem hoạt động khiếu nại này"
        )
    
    return complaint_service.get_complaint_activities(complaint_id)

@router.get("/stats/summary")
async def get_complaint_stats(
    start_date: datetime = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: datetime = Query(..., description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db)
):
    """Lấy thống kê khiếu nại"""
    complaint_service = ComplaintService(db)
    return complaint_service.get_complaint_statistics(start_date, end_date)

@router.post("/{complaint_id}/rate")
async def rate_complaint_resolution(
    complaint_id: int,
    rating: int = Query(..., ge=1, le=5),
    feedback: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Đánh giá giải quyết khiếu nại"""
    complaint_service = ComplaintService(db)
    
    # Kiểm tra quyền đánh giá
    complaint = complaint_service.get_complaint_by_id(complaint_id)
    if current_user.role == "citizen" and complaint.complainant_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền đánh giá khiếu nại này"
        )
    
    if complaint.status != ComplaintStatus.RESOLVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chỉ có thể đánh giá khiếu nại đã được giải quyết"
        )
    
    return complaint_service.rate_complaint(complaint_id, rating, feedback)