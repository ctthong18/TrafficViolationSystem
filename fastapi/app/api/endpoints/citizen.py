from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.services.violation_service import ViolationService
from app.services.vehicle_service import VehicleService

router = APIRouter()

@router.get("/my-violations")
def get_my_violations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Lấy vi phạm của chính citizen này
    vehicle_service = VehicleService(db)
    my_vehicles = vehicle_service.get_user_vehicles(current_user.id)
    
    violation_service = ViolationService(db)
    violations = violation_service.get_violations_by_vehicles(
        [v.license_plate for v in my_vehicles]
    )
    
    return violations

@router.get("/my-vehicles")
def get_my_vehicles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vehicle_service = VehicleService(db)
    return vehicle_service.get_user_vehicles(current_user.id)

@router.post("/vehicles")
def register_vehicle(
    vehicle_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vehicle_service = VehicleService(db)
    return vehicle_service.register_vehicle(vehicle_data, current_user.id)

@router.get("/dashboard/stats")
def get_citizen_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Thống kê cá nhân cho citizen
    vehicle_service = VehicleService(db)
    my_vehicles = vehicle_service.get_user_vehicles(current_user.id)
    
    violation_service = ViolationService(db)
    violation_stats = violation_service.get_user_violation_stats(
        [v.license_plate for v in my_vehicles]
    )
    
    return {
        "registered_vehicles": len(my_vehicles),
        "total_violations": violation_stats.total,
        "unpaid_violations": violation_stats.unpaid,
        "total_fines": violation_stats.total_fines
    }