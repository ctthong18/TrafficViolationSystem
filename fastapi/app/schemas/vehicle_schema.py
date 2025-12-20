from pydantic import BaseModel
from datetime import date
from typing import Optional

class VehicleBase(BaseModel):
    license_plate: str
    vehicle_type: str
    vehicle_color: str
    vehicle_brand: str

class VehicleCreate(VehicleBase):
    owner_name: str
    owner_identification: str

class VehicleUpdate(BaseModel):
    vehicle_type: Optional[str] = None
    vehicle_color: Optional[str] = None
    vehicle_brand: Optional[str] = None
    vehicle_model: Optional[str] = None
    year_of_manufacture: Optional[int] = None
    owner_name: Optional[str] = None
    owner_identification: Optional[str] = None
    owner_address: Optional[str] = None
    owner_phone: Optional[str] = None
    owner_email: Optional[str] = None
    status: Optional[str] = None

class VehicleResponse(VehicleBase):
    id: int
    owner_name: str
    registration_date: Optional[date] = None
    
    class Config:
        from_attributes = True