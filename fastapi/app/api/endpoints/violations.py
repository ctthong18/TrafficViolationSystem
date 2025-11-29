from fastapi import APIRouter, Depends, Query, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.database import get_db
from app.api.dependencies import get_current_user, require_roles
from app.models.user import User
from app.models.violation import Violation
from app.models.CameraVideo import CameraVideo
from app.services.violation_service import ViolationService
from app.schemas.violation_schema import ViolationResponse, ViolationListResponse, VideoEvidenceInfo

router = APIRouter()

@router.get("/", response_model=ViolationListResponse)
def get_violations(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = Query(None),
    license_plate: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    violation_service = ViolationService(db)

    # Phân quyền truy cập
    effective_license_plate: Optional[str] = license_plate
    violations: List[Violation] = []
    total: int = 0
    
    if current_user.role == "citizen":
        # Citizen chỉ xem được vi phạm của mình
        from app.services.vehicle_service import VehicleService
        vehicle_service = VehicleService(db)
        my_vehicles = vehicle_service.get_user_vehicles(current_user.id)
        plates = [v.license_plate for v in my_vehicles]
        
        if not plates:
            return ViolationListResponse(
                violations=[],
                total=0,
                page=skip // limit + 1,
                size=limit
            )
        
        violations = violation_service.get_violations_by_vehicles(plates, status)
        total = len(violations)
        # Apply pagination
        violations = violations[skip:skip + limit]
    else:
        # Admin/Officer search with optional filters
        violations = violation_service.search_violations(
            license_plate=effective_license_plate,
            status=status,
            skip=skip,
            limit=limit,
        )
        # Get total count
        total = violation_service.count_violations(
            license_plate=effective_license_plate,
            status=status
        )
    
    # Include video evidence for violations that have it
    violation_responses = []
    for violation in violations:
        response_data = ViolationResponse.model_validate(violation)
        if violation.video_id:
            video = db.query(CameraVideo).filter(CameraVideo.id == violation.video_id).first()
            if video:
                response_data.video_evidence = VideoEvidenceInfo(
                    video_id=video.id,
                    cloudinary_url=video.cloudinary_url,
                    thumbnail_url=video.thumbnail_url,
                    duration=video.duration
                )
        violation_responses.append(response_data)
    
    return ViolationListResponse(
        violations=violation_responses,
        total=total,
        page=skip // limit + 1 if limit > 0 else 1,
        size=limit
    )

@router.get("/{violation_id}", response_model=ViolationResponse)
def get_violation_detail(
    violation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    violation_service = ViolationService(db)
    violation = violation_service.get_violation_by_id(violation_id)
    
    # Kiểm tra quyền truy cập
    if current_user.role == "citizen":
        from app.services.vehicle_service import VehicleService
        vehicle_service = VehicleService(db)
        my_vehicles = vehicle_service.get_user_vehicles(current_user.id)
        my_license_plates = [v.license_plate for v in my_vehicles]
        
        if violation.license_plate not in my_license_plates:
            raise HTTPException(status_code=403, detail="Không có quyền xem vi phạm này")
    
    # Include video evidence if available
    response_data = ViolationResponse.model_validate(violation)
    if violation.video_id:
        video = db.query(CameraVideo).filter(CameraVideo.id == violation.video_id).first()
        if video:
            response_data.video_evidence = VideoEvidenceInfo(
                video_id=video.id,
                cloudinary_url=video.cloudinary_url,
                thumbnail_url=video.thumbnail_url,
                duration=video.duration
            )
    
    return response_data

@router.get("/processed/list", response_model=ViolationListResponse)
def get_processed_violations(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy danh sách vi phạm đã xử lý (verified, processed, paid)"""
    violation_service = ViolationService(db)
    
    # Get processed violations (verified, processed, paid statuses)
    violations = violation_service.get_processed_violations(skip, limit)
    total = violation_service.count_processed_violations()
    
    return ViolationListResponse(
        violations=violations,
        total=total,
        page=skip // limit + 1 if limit > 0 else 1,
        size=limit
    )

@router.get("/recent")
def get_recent_violations(
    request: Request,
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db)
):
    """Lấy danh sách vi phạm gần đây cho dashboard"""
    from datetime import datetime
    
    # Lấy limit từ query params thủ công để tránh lỗi parse
    limit_param = request.query_params.get("limit", "10")
    try:
        limit = int(limit_param)
        limit = max(1, min(50, limit))  # Giới hạn trong khoảng 1-50
    except (ValueError, TypeError):
        limit = 10
    
    violations = db.query(Violation).order_by(
        Violation.detected_at.desc()
    ).limit(limit).all()
    
    result = []
    for v in violations:
        result.append({
            "id": f"VN{v.id:06d}",
            "type": v.violation_type or "Không xác định",
            "location": v.location_name or "Không xác định",
            "time": v.detected_at.strftime("%d/%m/%Y %H:%M") if v.detected_at else "N/A",
            "status": "processed" if v.status in ["approved", "paid"] else "pending"
        })
    
    return result