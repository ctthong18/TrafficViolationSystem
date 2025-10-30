from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.api.dependencies import get_current_user, require_roles
from app.models.user import User
from app.services.violation_service import ViolationService

router = APIRouter()

@router.get("/")
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
    if current_user.role == "citizen":
        # Citizen chỉ xem được vi phạm của mình
        from app.services.vehicle_service import VehicleService
        vehicle_service = VehicleService(db)
        my_vehicles = vehicle_service.get_user_vehicles(current_user.id)
        license_plate = [v.license_plate for v in my_vehicles]
    
    return violation_service.get_violations(skip, limit, status, license_plate)

@router.get("/{violation_id}")
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
    
    return violation