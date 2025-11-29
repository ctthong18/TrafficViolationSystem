from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.driving_license import DrivingLicense
from app.services.driving_license_service import DrivingLicenseService
from pydantic import BaseModel
from datetime import date

router = APIRouter()

# Schemas
class DrivingLicenseCreate(BaseModel):
    license_number: str
    license_class: str
    full_name: str
    date_of_birth: date
    nationality: Optional[str] = "Việt Nam"
    address: Optional[str] = None
    issue_date: date
    expiry_date: date
    issue_place: Optional[str] = None

class DrivingLicenseUpdate(BaseModel):
    license_class: Optional[str] = None
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    nationality: Optional[str] = None
    address: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    issue_place: Optional[str] = None

class DrivingLicenseResponse(BaseModel):
    id: int
    license_number: str
    user_id: int
    license_class: str
    full_name: str
    date_of_birth: date
    nationality: Optional[str]
    address: Optional[str]
    issue_date: date
    expiry_date: date
    issue_place: Optional[str]
    total_points: int
    current_points: int
    points_reset_date: Optional[date]
    status: str
    suspension_start: Optional[date]
    suspension_end: Optional[date]
    revocation_reason: Optional[str]
    total_violations: int
    serious_violations: int
    points_deduction_history: Optional[list]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.post("/", response_model=DrivingLicenseResponse)
def create_driving_license(
    license_data: DrivingLicenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tạo bằng lái xe mới"""
    # Kiểm tra xem user đã có bằng lái chưa
    existing = db.query(DrivingLicense).filter(
        DrivingLicense.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Người dùng đã có bằng lái xe"
        )
    
    # Kiểm tra số bằng lái đã tồn tại chưa
    existing_number = db.query(DrivingLicense).filter(
        DrivingLicense.license_number == license_data.license_number
    ).first()
    
    if existing_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Số bằng lái đã tồn tại"
        )
    
    # Tạo bằng lái mới
    new_license = DrivingLicense(
        **license_data.model_dump(),
        user_id=current_user.id,
        total_points=12,
        current_points=12,
        status="active"
    )
    
    db.add(new_license)
    db.commit()
    db.refresh(new_license)
    
    return new_license


@router.get("/my-license", response_model=Optional[DrivingLicenseResponse])
def get_my_driving_license(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy bằng lái xe của người dùng hiện tại"""
    license = db.query(DrivingLicense).filter(
        DrivingLicense.user_id == current_user.id
    ).first()
    
    return license


@router.get("/{license_id}", response_model=DrivingLicenseResponse)
def get_driving_license(
    license_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy thông tin bằng lái xe"""
    license = db.query(DrivingLicense).filter(
        DrivingLicense.id == license_id
    ).first()
    
    if not license:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bằng lái xe"
        )
    
    # Kiểm tra quyền truy cập
    if current_user.role not in ["admin", "officer"] and license.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền truy cập"
        )
    
    return license


@router.put("/{license_id}", response_model=DrivingLicenseResponse)
def update_driving_license(
    license_id: int,
    license_data: DrivingLicenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cập nhật thông tin bằng lái xe"""
    license = db.query(DrivingLicense).filter(
        DrivingLicense.id == license_id
    ).first()
    
    if not license:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bằng lái xe"
        )
    
    # Kiểm tra quyền sở hữu
    if current_user.role not in ["admin", "officer"] and license.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền cập nhật"
        )
    
    # Cập nhật các trường
    for field, value in license_data.model_dump(exclude_unset=True).items():
        setattr(license, field, value)
    
    db.commit()
    db.refresh(license)
    
    return license


@router.delete("/{license_id}")
def delete_driving_license(
    license_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Xóa bằng lái xe"""
    license = db.query(DrivingLicense).filter(
        DrivingLicense.id == license_id
    ).first()
    
    if not license:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bằng lái xe"
        )
    
    # Chỉ admin hoặc chủ sở hữu mới được xóa
    if current_user.role != "admin" and license.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền xóa"
        )
    
    db.delete(license)
    db.commit()
    
    return {"message": "Đã xóa bằng lái xe thành công"}


@router.get("/{license_number}/status")
def check_license_status(
    license_number: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Kiểm tra trạng thái bằng lái xe"""
    service = DrivingLicenseService(db)
    return service.check_license_status(license_number)
