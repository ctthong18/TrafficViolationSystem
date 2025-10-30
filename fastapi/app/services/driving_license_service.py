from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from app.models.driving_license import DrivingLicense, LicenseStatus
from app.models.violation import Violation

class DrivingLicenseService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_license_by_number(self, license_number: str) -> DrivingLicense:
        license = self.db.query(DrivingLicense).filter(
            DrivingLicense.license_number == license_number
        ).first()
        if not license:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Giấy phép lái xe không tồn tại"
            )
        return license
    
    def deduct_points(self, license_number: str, points: int, violation_id: int) -> DrivingLicense:
        """Trừ điểm GPLX"""
        license = self.get_license_by_number(license_number)
        
        if license.current_points - points < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không đủ điểm để trừ"
            )
        
        license.current_points -= points
        
        # Ghi lịch sử trừ điểm
        deduction_history = license.points_deduction_history or []
        deduction_history.append({
            "violation_id": violation_id,
            "points_deducted": points,
            "deducted_at": datetime.now().isoformat(),
            "remaining_points": license.current_points
        })
        license.points_deduction_history = deduction_history
        
        # Kiểm tra nếu hết điểm
        if license.current_points <= 0:
            license.status = LicenseStatus.SUSPENDED.value
            license.suspension_start = datetime.now().date()
            license.suspension_end = datetime.now().date() + timedelta(days=30)  # Tạm giữ 30 ngày
        
        self.db.commit()
        self.db.refresh(license)
        return license
    
    def reset_points(self, license_number: str) -> DrivingLicense:
        """Reset điểm về 12 sau 1 năm"""
        license = self.get_license_by_number(license_number)
        
        license.current_points = 12
        license.total_points = 12
        license.points_reset_date = datetime.now().date()
        
        self.db.commit()
        self.db.refresh(license)
        return license
    
    def check_license_status(self, license_number: str) -> Dict[str, Any]:
        """Kiểm tra trạng thái GPLX"""
        license = self.get_license_by_number(license_number)
        
        # Kiểm tra hết hạn
        if license.expiry_date < datetime.now().date():
            license.status = LicenseStatus.EXPIRED.value
        
        return {
            "license_number": license.license_number,
            "current_points": license.current_points,
            "total_points": license.total_points,
            "status": license.status,
            "expiry_date": license.expiry_date,
            "is_expired": license.expiry_date < datetime.now().date(),
            "is_suspended": license.status == LicenseStatus.SUSPENDED.value,
            "suspension_period": {
                "start": license.suspension_start,
                "end": license.suspension_end
            } if license.suspension_start else None,
            "points_reset_date": license.points_reset_date
        }