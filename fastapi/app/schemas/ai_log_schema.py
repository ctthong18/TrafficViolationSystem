from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class BoundingBox(BaseModel):
    """Bounding box coordinates"""
    x: float = Field(..., description="X coordinate")
    y: float = Field(..., description="Y coordinate") 
    width: float = Field(..., description="Width")
    height: float = Field(..., description="Height")

class AILogBase(BaseModel):
    """Base schema for AI Log"""
    camera_id: int = Field(..., description="Camera ID")
    video_path: Optional[str] = Field(None, description="Video file path")
    frame_number: Optional[int] = Field(None, description="Frame number in video")
    detection_type: str = Field(..., description="Type of detection (vehicle, license_plate, violation)")
    confidence_score: Optional[float] = Field(None, ge=0, le=1, description="Confidence score (0-1)")
    
    # Bounding box
    bbox_x: Optional[float] = Field(None, description="Bounding box X")
    bbox_y: Optional[float] = Field(None, description="Bounding box Y")
    bbox_width: Optional[float] = Field(None, description="Bounding box width")
    bbox_height: Optional[float] = Field(None, description="Bounding box height")
    
    # Detection results
    detection_data: Optional[Dict[str, Any]] = Field(None, description="Additional detection data")
    license_plate: Optional[str] = Field(None, max_length=20, description="License plate number")
    vehicle_type: Optional[str] = Field(None, max_length=50, description="Vehicle type")
    violation_type: Optional[str] = Field(None, max_length=100, description="Violation type")
    
    # Processing info
    model_version: Optional[str] = Field(None, max_length=50, description="AI model version")
    processing_time: Optional[float] = Field(None, description="Processing time in milliseconds")

class AILogCreate(AILogBase):
    """Schema for creating AI Log"""
    timestamp: Optional[datetime] = Field(None, description="Detection timestamp")

class AILogUpdate(BaseModel):
    """Schema for updating AI Log"""
    is_processed: Optional[bool] = Field(None, description="Processing status")
    is_violation: Optional[bool] = Field(None, description="Is violation detected")
    license_plate: Optional[str] = Field(None, max_length=20, description="License plate number")
    vehicle_type: Optional[str] = Field(None, max_length=50, description="Vehicle type")
    violation_type: Optional[str] = Field(None, max_length=100, description="Violation type")
    detection_data: Optional[Dict[str, Any]] = Field(None, description="Additional detection data")

class AILogResponse(AILogBase):
    """Schema for AI Log response"""
    id: int
    timestamp: datetime
    is_processed: bool = False
    is_violation: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Computed fields
    bbox: Optional[BoundingBox] = None
    
    class Config:
        from_attributes = True
        
    @classmethod
    def from_orm_with_bbox(cls, obj):
        """Create response with computed bbox field"""
        data = obj.__dict__.copy()
        
        # Create bbox if coordinates exist
        if all(x is not None for x in [obj.bbox_x, obj.bbox_y, obj.bbox_width, obj.bbox_height]):
            data['bbox'] = BoundingBox(
                x=obj.bbox_x,
                y=obj.bbox_y, 
                width=obj.bbox_width,
                height=obj.bbox_height
            )
        
        return cls(**data)

class AILogFilter(BaseModel):
    """Schema for filtering AI logs"""
    camera_id: Optional[int] = None
    detection_type: Optional[str] = None
    is_processed: Optional[bool] = None
    is_violation: Optional[bool] = None
    license_plate: Optional[str] = None
    vehicle_type: Optional[str] = None
    violation_type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    min_confidence: Optional[float] = Field(None, ge=0, le=1)
    
class AILogStats(BaseModel):
    """Schema for AI log statistics"""
    total_logs: int
    processed_logs: int
    violation_logs: int
    detection_types: Dict[str, int]
    vehicle_types: Dict[str, int]
    violation_types: Dict[str, int]
    avg_confidence: Optional[float]
    avg_processing_time: Optional[float]