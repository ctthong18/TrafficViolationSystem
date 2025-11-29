from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel, Field


class CameraBase(BaseModel):
    camera_id: str = Field(..., max_length=100)
    name: str
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    camera_type: Optional[str] = None
    resolution: Optional[str] = None
    status: Optional[str] = "online"
    enabled_detections: Optional[dict] = None
    ai_model_version: Optional[str] = None
    confidence_threshold: Optional[float] = None
    last_maintenance: Optional[date] = None
    next_maintenance: Optional[date] = None


class CameraCreate(CameraBase):
    pass


class CameraUpdate(BaseModel):
    name: Optional[str] = None
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    camera_type: Optional[str] = None
    resolution: Optional[str] = None
    status: Optional[str] = None
    enabled_detections: Optional[dict] = None
    ai_model_version: Optional[str] = None
    confidence_threshold: Optional[float] = None
    last_maintenance: Optional[date] = None
    next_maintenance: Optional[date] = None


class CameraResponse(CameraBase):
    id: int
    violations_today: int = 0
    last_violation_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CameraListResponse(BaseModel):
    items: List[CameraResponse]
    total: int
    page: int
    size: int


