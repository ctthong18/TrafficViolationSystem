from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from app.models.vehicle import Vehicle
from app.models.user import User
from app.schemas.vehicle_schema import VehicleCreate, VehicleUpdate
from app.utils.validators import validate_license_plate

class VehicleService:
    def __init__(self, db: Session):
        self.db = db

    def get_vehicle_by_id(self, vehicle_id: int) -> Vehicle:
        vehicle = self.db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Phương tiện không tồn tại"
            )
        return vehicle

    def get_vehicle_by_license_plate(self, license_plate: str) -> Optional[Vehicle]:
        return self.db.query(Vehicle).filter(Vehicle.license_plate == license_plate).first()

    def get_user_vehicles(self, user_id: int) -> List[Vehicle]:
        return self.db.query(Vehicle).filter(Vehicle.owner_id == user_id).all()

    def create_vehicle(self, vehicle_data: VehicleCreate, user_id: int) -> Vehicle:
        # Validate license plate format
        if not validate_license_plate(vehicle_data.license_plate):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Biển số xe không hợp lệ"
            )
        
        # Check if license plate already exists
        existing_vehicle = self.get_vehicle_by_license_plate(vehicle_data.license_plate)
        if existing_vehicle:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Biển số xe đã tồn tại trong hệ thống"
            )
        
        vehicle = Vehicle(
            **vehicle_data.dict(),
            owner_id=user_id
        )
        
        self.db.add(vehicle)
        self.db.commit()
        self.db.refresh(vehicle)
        
        return vehicle

    def update_vehicle(self, vehicle_id: int, vehicle_data: VehicleUpdate) -> Vehicle:
        vehicle = self.get_vehicle_by_id(vehicle_id)
        
        update_data = vehicle_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(vehicle, field, value)
        
        self.db.commit()
        self.db.refresh(vehicle)
        return vehicle

    def delete_vehicle(self, vehicle_id: int, user_id: int) -> None:
        vehicle = self.get_vehicle_by_id(vehicle_id)
        
        # Check ownership
        if vehicle.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền xóa phương tiện này"
            )
        
        # Check if vehicle has violations
        from app.models.violation import Violation
        violation_count = self.db.query(Violation).filter(
            Violation.license_plate == vehicle.license_plate
        ).count()
        
        if violation_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không thể xóa phương tiện đã có vi phạm"
            )
        
        self.db.delete(vehicle)
        self.db.commit()

    def search_vehicles(self, license_plate: Optional[str] = None, 
                       owner_name: Optional[str] = None,
                       skip: int = 0, limit: int = 50) -> List[Vehicle]:
        query = self.db.query(Vehicle)
        
        if license_plate:
            query = query.filter(Vehicle.license_plate.ilike(f"%{license_plate}%"))
        if owner_name:
            query = query.filter(Vehicle.owner_name.ilike(f"%{owner_name}%"))
        
        return query.offset(skip).limit(limit).all()

    def get_vehicle_violation_stats(self, vehicle_id: int) -> dict:
        """Get violation statistics for a vehicle"""
        vehicle = self.get_vehicle_by_id(vehicle_id)
        
        from app.models.violation import Violation
        from app.models.payment import Payment
        
        total_violations = self.db.query(Violation).filter(
            Violation.license_plate == vehicle.license_plate
        ).count()
        
        unpaid_violations = self.db.query(Violation).filter(
            Violation.license_plate == vehicle.license_plate,
            Violation.status == 'approved'
        ).count()
        
        total_fines = self.db.query(Payment).join(Violation).filter(
            Violation.license_plate == vehicle.license_plate,
            Payment.status == 'paid'
        ).with_entities(Payment.amount).all()
        
        total_fines_amount = sum([float(payment.amount) for payment in total_fines])
        
        return {
            "vehicle_id": vehicle_id,
            "license_plate": vehicle.license_plate,
            "total_violations": total_violations,
            "unpaid_violations": unpaid_violations,
            "total_fines_paid": total_fines_amount,
            "last_violation_date": self._get_last_violation_date(vehicle.license_plate)
        }
    
    def _get_last_violation_date(self, license_plate: str):
        from app.models.violation import Violation
        last_violation = self.db.query(Violation).filter(
            Violation.license_plate == license_plate
        ).order_by(Violation.detected_at.desc()).first()
        
        return last_violation.detected_at if last_violation else None