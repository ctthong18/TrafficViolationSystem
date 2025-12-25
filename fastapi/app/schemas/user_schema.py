import enum
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


class Role(str, enum.Enum):
    ADMIN = "ADMIN"
    OFFICER = "OFFICER"
    CITIZEN = "CITIZEN"


class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    identification_number: str
    phone_number: Optional[str] = None
    department: Optional[str] = None
    badge_number: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: Role = Role.CITIZEN


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    department: Optional[str] = None
    badge_number: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    role: Role
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    size: int
