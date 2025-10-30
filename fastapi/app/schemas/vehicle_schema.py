from pydantic import BaseModel
from datetime import date

class VehicleBase(BaseModel):
    license_plate: str
    vehicle_type: str
    vehicle_color: str
    vehicle_brand: str

class VehicleCreate(VehicleBase):
    owner_name: str
    owner_identification: str

class VehicleUpdate(BaseModel):
    vehicle_type: str = None
    vehicle_color: str = None
    vehicle_brand: str = None
    vehicle_model: str = None
    year_of_manufacture: int = None
    owner_name: str = None
    owner_identification: str = None
    owner_address: str = None
    owner_phone: str = None
    owner_email: str = None
    status: str = None

class VehicleResponse(VehicleBase):
    id: int
    owner_name: str
    registration_date: date
    
    class Config:
        from_attributes = True