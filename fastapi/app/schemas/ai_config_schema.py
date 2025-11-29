"""
Schemas for AI Model Configuration
"""
from pydantic import BaseModel, Field, field_validator
from typing import Dict, Optional
from datetime import datetime


class ViolationTypeConfig(BaseModel):
    """Configuration for a specific violation type"""
    enabled: bool = Field(..., description="Whether this violation type is enabled")
    confidence_min: float = Field(..., ge=0.0, le=1.0, description="Minimum confidence threshold for this violation type")


class AIConfigCreate(BaseModel):
    """Request schema for creating AI configuration"""
    confidence_threshold: float = Field(
        default=0.4,
        ge=0.0,
        le=1.0,
        description="Global confidence threshold for all detections (0.0-1.0)"
    )
    iou_threshold: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="Intersection over Union threshold for object detection (0.0-1.0)"
    )
    detection_frequency: int = Field(
        default=2,
        ge=1,
        le=30,
        description="Number of frames per second to analyze (1-30)"
    )
    violation_types: Dict[str, ViolationTypeConfig] = Field(
        default={
            'no_helmet': {'enabled': True, 'confidence_min': 0.6},
            'red_light': {'enabled': True, 'confidence_min': 0.7},
            'wrong_lane': {'enabled': True, 'confidence_min': 0.65},
            'speeding': {'enabled': True, 'confidence_min': 0.75}
        },
        description="Configuration for each violation type"
    )
    notes: Optional[str] = Field(None, max_length=500, description="Optional notes about this configuration")
    
    @field_validator('violation_types')
    @classmethod
    def validate_violation_types(cls, v):
        """Validate violation types configuration"""
        allowed_types = ['no_helmet', 'red_light', 'wrong_lane', 'speeding']
        for vtype in v.keys():
            if vtype not in allowed_types:
                raise ValueError(f"Invalid violation type: {vtype}. Allowed types: {allowed_types}")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "confidence_threshold": 0.5,
                "iou_threshold": 0.5,
                "detection_frequency": 2,
                "violation_types": {
                    "no_helmet": {"enabled": True, "confidence_min": 0.6},
                    "red_light": {"enabled": True, "confidence_min": 0.7},
                    "wrong_lane": {"enabled": False, "confidence_min": 0.65},
                    "speeding": {"enabled": True, "confidence_min": 0.75}
                },
                "notes": "Increased confidence threshold for better accuracy"
            }
        }


class AIConfigUpdate(BaseModel):
    """Request schema for updating AI configuration"""
    confidence_threshold: Optional[float] = Field(None, ge=0.0, le=1.0)
    iou_threshold: Optional[float] = Field(None, ge=0.0, le=1.0)
    detection_frequency: Optional[int] = Field(None, ge=1, le=30)
    violation_types: Optional[Dict[str, ViolationTypeConfig]] = None
    notes: Optional[str] = Field(None, max_length=500)
    
    @field_validator('violation_types')
    @classmethod
    def validate_violation_types(cls, v):
        """Validate violation types configuration"""
        if v is None:
            return v
        allowed_types = ['no_helmet', 'red_light', 'wrong_lane', 'speeding']
        for vtype in v.keys():
            if vtype not in allowed_types:
                raise ValueError(f"Invalid violation type: {vtype}. Allowed types: {allowed_types}")
        return v


class AIConfigResponse(BaseModel):
    """Response schema for AI configuration"""
    id: int
    confidence_threshold: float
    iou_threshold: float
    detection_frequency: int
    violation_types: Dict[str, Dict]
    is_active: bool
    created_by: int
    created_at: datetime
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True


class AIConfigListResponse(BaseModel):
    """Response schema for list of AI configurations (history)"""
    configs: list[AIConfigResponse]
    total: int
    current_config: Optional[AIConfigResponse] = None


class AIConfigStatsResponse(BaseModel):
    """Response schema for AI configuration statistics"""
    total_configs: int
    current_config_id: Optional[int]
    enabled_violation_types: list[str]
    disabled_violation_types: list[str]
    last_updated: Optional[datetime]
    last_updated_by: Optional[int]
