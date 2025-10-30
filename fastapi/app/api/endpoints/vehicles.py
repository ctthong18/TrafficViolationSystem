from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.api.dependencies import get_current_user, require_roles
from app.models.user import User
from app.schemas.vehicle_schema import (
        VehicleCreate, VehicleResponse, VehicleUpdate
    )
from app.services.vehicle_service import VehicleService

router = APIRouter()

@router.post("/", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def register_vehicle(
    vehicle_data: VehicleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Đăng ký phương tiện mới"""
    vehicle_service = VehicleService(db)
    return vehicle_service.create_vehicle(vehicle_data, current_user.id)

@router.get("/", response_model=list[VehicleResponse])
async def get_vehicles(
    license_plate: Optional[str] = Query(None),
    owner_name: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db)
):
    """Tìm kiếm phương tiện (Admin/Officer only)"""
    vehicle_service = VehicleService(db)
    return vehicle_service.search_vehicles(
        license_plate=license_plate,
        owner_name=owner_name,
        skip=skip,
        limit=limit
    )

@router.get("/my-vehicles", response_model=list[VehicleResponse])
async def get_my_vehicles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy danh sách phương tiện của người dùng hiện tại"""
    vehicle_service = VehicleService(db)
    return vehicle_service.get_user_vehicles(current_user.id)

@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle_detail(
    vehicle_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy thông tin chi tiết phương tiện"""
    vehicle_service = VehicleService(db)
    vehicle = vehicle_service.get_vehicle_by_id(vehicle_id)
    
    # Kiểm tra quyền truy cập
    if current_user.role == "citizen" and vehicle.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền xem thông tin phương tiện này"
        )
    
    return vehicle

@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: int,
    vehicle_data: VehicleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cập nhật thông tin phương tiện"""
    vehicle_service = VehicleService(db)
    
    # Kiểm tra quyền sở hữu
    vehicle = vehicle_service.get_vehicle_by_id(vehicle_id)
    if current_user.role == "citizen" and vehicle.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền cập nhật phương tiện này"
        )
    
    return vehicle_service.update_vehicle(vehicle_id, vehicle_data)

@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vehicle(
    vehicle_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Xóa phương tiện"""
    vehicle_service = VehicleService(db)
    vehicle_service.delete_vehicle(vehicle_id, current_user.id)
    return None

@router.get("/{vehicle_id}/violations/stats")
async def get_vehicle_violation_stats(
    vehicle_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy thống kê vi phạm của phương tiện"""
    vehicle_service = VehicleService(db)
    
    # Kiểm tra quyền truy cập
    vehicle = vehicle_service.get_vehicle_by_id(vehicle_id)
    if current_user.role == "citizen" and vehicle.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền xem thống kê phương tiện này"
        )
    
    return vehicle_service.get_vehicle_violation_stats(vehicle_id)

@router.get("/{vehicle_id}/violations")
async def get_vehicle_violations(
    vehicle_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy danh sách vi phạm của phương tiện"""
    vehicle_service = VehicleService(db)
    
    # Kiểm tra quyền truy cập
    vehicle = vehicle_service.get_vehicle_by_id(vehicle_id)
    if current_user.role == "citizen" and vehicle.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền xem vi phạm phương tiện này"
        )
    
    from app.services.violation_service import ViolationService
    violation_service = ViolationService(db)
    return violation_service.get_violations_by_license_plate(vehicle.license_plate)

@router.get("/license-plate/{license_plate}", response_model=VehicleResponse)
async def get_vehicle_by_license_plate(
    license_plate: str,
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db)
):
    """Tìm phương tiện bằng biển số (Admin/Officer only)"""
    vehicle_service = VehicleService(db)
    vehicle = vehicle_service.get_vehicle_by_license_plate(license_plate)
    
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phương tiện với biển số này"
        )
    
    return vehicle

@router.get("/{vehicle_id}/payment-history")
async def get_vehicle_payment_history(
    vehicle_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy lịch sử thanh toán của phương tiện"""
    vehicle_service = VehicleService(db)
    
    # Kiểm tra quyền truy cập
    vehicle = vehicle_service.get_vehicle_by_id(vehicle_id)
    if current_user.role == "citizen" and vehicle.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền xem lịch sử thanh toán phương tiện này"
        )
    
    from app.services.payment_service import PaymentService
    payment_service = PaymentService(db)
    return payment_service.get_vehicle_payment_history(vehicle_id)