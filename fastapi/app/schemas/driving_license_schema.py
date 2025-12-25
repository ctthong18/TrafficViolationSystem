import enum
from datetime import date
from typing import Optional, List
from pydantic import BaseModel


class LicenseStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    REVOKED = "REVOKED"
    EXPIRED = "EXPIRED"


class LicenseClass(str, enum.Enum):
    A1 = "A1"  # Xe máy dưới 175cc
    A2 = "A2"  # Xe máy trên 175cc
    A3 = "A3"  # Xe máy 3 bánh
    A4 = "A4"  # Xe máy kéo rơ moóc
    B1 = "B1"  # Ô tô số tự động
    B2 = "B2"  # Ô tô dưới 9 chỗ
    C = "C"  # Ô tô tải
    D = "D"  # Ô tô khách
    E = "E"  # Ô tô kéo rơ moóc
    F = "F"  # Tất cả các hạng


class DrivingLicenseBase(BaseModel):
    license_number: str
    license_class: LicenseClass
    full_name: str
    date_of_birth: date
    nationality: Optional[str] = "Việt Nam"
    address: Optional[str] = None
    issue_date: date
    expiry_date: date
    issue_place: Optional[str] = None


class DrivingLicenseCreate(DrivingLicenseBase):
    user_id: int


class DrivingLicenseUpdate(BaseModel):
    license_class: Optional[LicenseClass] = None
    full_name: Optional[str] = None
    address: Optional[str] = None
    expiry_date: Optional[date] = None
    status: Optional[LicenseStatus] = None
    current_points: Optional[int] = None


class DrivingLicenseResponse(DrivingLicenseBase):
    id: int
    user_id: int
    total_points: int
    current_points: int
    status: LicenseStatus
    total_violations: int
    serious_violations: int

    class Config:
        from_attributes = True
