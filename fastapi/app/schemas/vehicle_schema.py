from datetime import date
from typing import Optional

from pydantic import BaseModel


class VehicleBase(BaseModel):
    license_plate: str
    vehicle_type: str
    vehicle_color: str
    vehicle_brand: str


class VehicleCreate(VehicleBase):
    owner_name: str
    owner_identification: str


class VehicleUpdate(BaseModel):
    vehicle_type: str | None = None
    vehicle_color: str | None = None
    vehicle_brand: str | None = None
    vehicle_model: str | None = None
    year_of_manufacture: int | None = None
    owner_name: str | None = None
    owner_identification: str | None = None
    owner_address: str | None = None
    owner_phone: str | None = None
    owner_email: str | None = None
    status: str | None = None


class VehicleResponse(VehicleBase):
    id: int
    owner_name: str
    registration_date: Optional[date] = None

    class Config:
        from_attributes = True
