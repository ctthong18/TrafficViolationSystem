"""
AI Model Configuration Endpoints
Handles AI detection parameter configuration and history
"""
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.ai_model_config import AIModelConfig
from app.schemas.ai_config_schema import (
    AIConfigCreate,
    AIConfigUpdate,
    AIConfigResponse,
    AIConfigListResponse,
    AIConfigStatsResponse
)
from app.services.ai_detection_service import ai_detection_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/current", response_model=AIConfigResponse)
def get_current_config(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get the current active AI model configuration
    
    Returns the most recent active configuration used for video processing
    
    Requirements: 8.1, 8.2, 8.3
    """
    logger.info(f"User {current_user.id} fetching current AI config")
    
    # Get the most recent active configuration
    config = db.query(AIModelConfig).filter(
        AIModelConfig.is_active == True
    ).order_by(desc(AIModelConfig.created_at)).first()
    
    if not config:
        # Return default configuration if none exists
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active AI configuration found. Please create one."
        )
    
    return AIConfigResponse(
        id=config.id,
        confidence_threshold=config.confidence_threshold,
        iou_threshold=config.iou_threshold,
        detection_frequency=config.detection_frequency,
        violation_types=config.violation_types,
        is_active=config.is_active,
        created_by=config.created_by,
        created_at=config.created_at,
        notes=config.notes
    )


@router.post("/", response_model=AIConfigResponse, status_code=status.HTTP_201_CREATED)
def create_config(
    config_data: AIConfigCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new AI model configuration
    
    This will:
    - Deactivate the previous active configuration
    - Create a new active configuration
    - Apply the configuration to the AI detection service
    - Save configuration history
    
    Requirements: 8.1, 8.2, 8.3, 8.4
    """
    logger.info(f"User {current_user.id} creating new AI config")
    
    try:
        # Deactivate all previous configurations
        db.query(AIModelConfig).filter(
            AIModelConfig.is_active == True
        ).update({'is_active': False})
        
        # Convert violation_types to dict format
        violation_types_dict = {
            vtype: {'enabled': vconfig.enabled, 'confidence_min': vconfig.confidence_min}
            for vtype, vconfig in config_data.violation_types.items()
        }
        
        # Create new configuration
        new_config = AIModelConfig(
            confidence_threshold=config_data.confidence_threshold,
            iou_threshold=config_data.iou_threshold,
            detection_frequency=config_data.detection_frequency,
            violation_types=violation_types_dict,
            is_active=True,
            created_by=current_user.id,
            notes=config_data.notes
        )
        
        db.add(new_config)
        db.commit()
        db.refresh(new_config)
        
        # Apply configuration to AI detection service
        ai_detection_service.set_confidence_threshold(config_data.confidence_threshold)
        ai_detection_service.configure_violation_rules(violation_types_dict)
        
        logger.info(f"Created new AI config {new_config.id} and applied to service")
        
        return AIConfigResponse(
            id=new_config.id,
            confidence_threshold=new_config.confidence_threshold,
            iou_threshold=new_config.iou_threshold,
            detection_frequency=new_config.detection_frequency,
            violation_types=new_config.violation_types,
            is_active=new_config.is_active,
            created_by=new_config.created_by,
            created_at=new_config.created_at,
            notes=new_config.notes
        )
        
    except Exception as e:
        logger.error(f"Error creating AI config: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create AI configuration: {str(e)}"
        )


@router.patch("/{config_id}", response_model=AIConfigResponse)
def update_config(
    config_id: int,
    config_data: AIConfigUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update an existing AI model configuration
    
    Note: This creates a new configuration entry (for history tracking)
    rather than modifying the existing one
    
    Requirements: 8.1, 8.2, 8.3, 8.4
    """
    logger.info(f"User {current_user.id} updating AI config {config_id}")
    
    # Get the existing configuration
    existing_config = db.query(AIModelConfig).filter(
        AIModelConfig.id == config_id
    ).first()
    
    if not existing_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuration with ID {config_id} not found"
        )
    
    try:
        # Deactivate all previous configurations
        db.query(AIModelConfig).filter(
            AIModelConfig.is_active == True
        ).update({'is_active': False})
        
        # Prepare violation types
        violation_types_dict = existing_config.violation_types.copy()
        if config_data.violation_types:
            violation_types_dict = {
                vtype: {'enabled': vconfig.enabled, 'confidence_min': vconfig.confidence_min}
                for vtype, vconfig in config_data.violation_types.items()
            }
        
        # Create new configuration with updated values
        new_config = AIModelConfig(
            confidence_threshold=config_data.confidence_threshold if config_data.confidence_threshold is not None else existing_config.confidence_threshold,
            iou_threshold=config_data.iou_threshold if config_data.iou_threshold is not None else existing_config.iou_threshold,
            detection_frequency=config_data.detection_frequency if config_data.detection_frequency is not None else existing_config.detection_frequency,
            violation_types=violation_types_dict,
            is_active=True,
            created_by=current_user.id,
            notes=config_data.notes if config_data.notes is not None else existing_config.notes
        )
        
        db.add(new_config)
        db.commit()
        db.refresh(new_config)
        
        # Apply configuration to AI detection service
        ai_detection_service.set_confidence_threshold(new_config.confidence_threshold)
        ai_detection_service.configure_violation_rules(new_config.violation_types)
        
        logger.info(f"Updated AI config, created new version {new_config.id}")
        
        return AIConfigResponse(
            id=new_config.id,
            confidence_threshold=new_config.confidence_threshold,
            iou_threshold=new_config.iou_threshold,
            detection_frequency=new_config.detection_frequency,
            violation_types=new_config.violation_types,
            is_active=new_config.is_active,
            created_by=new_config.created_by,
            created_at=new_config.created_at,
            notes=new_config.notes
        )
        
    except Exception as e:
        logger.error(f"Error updating AI config: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update AI configuration: {str(e)}"
        )


@router.get("/history", response_model=AIConfigListResponse)
def get_config_history(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of records to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get configuration history
    
    Returns all AI model configurations ordered by creation date (most recent first)
    
    Requirements: 8.4, 8.5
    """
    logger.info(f"User {current_user.id} fetching AI config history")
    
    # Get total count
    total = db.query(AIModelConfig).count()
    
    # Get configurations with pagination
    configs = db.query(AIModelConfig).order_by(
        desc(AIModelConfig.created_at)
    ).offset(skip).limit(limit).all()
    
    # Get current active configuration
    current_config = db.query(AIModelConfig).filter(
        AIModelConfig.is_active == True
    ).order_by(desc(AIModelConfig.created_at)).first()
    
    # Convert to response format
    config_list = [
        AIConfigResponse(
            id=config.id,
            confidence_threshold=config.confidence_threshold,
            iou_threshold=config.iou_threshold,
            detection_frequency=config.detection_frequency,
            violation_types=config.violation_types,
            is_active=config.is_active,
            created_by=config.created_by,
            created_at=config.created_at,
            notes=config.notes
        )
        for config in configs
    ]
    
    current_config_response = None
    if current_config:
        current_config_response = AIConfigResponse(
            id=current_config.id,
            confidence_threshold=current_config.confidence_threshold,
            iou_threshold=current_config.iou_threshold,
            detection_frequency=current_config.detection_frequency,
            violation_types=current_config.violation_types,
            is_active=current_config.is_active,
            created_by=current_config.created_by,
            created_at=current_config.created_at,
            notes=current_config.notes
        )
    
    logger.info(f"Found {total} configurations in history")
    
    return AIConfigListResponse(
        configs=config_list,
        total=total,
        current_config=current_config_response
    )


@router.get("/{config_id}", response_model=AIConfigResponse)
def get_config_by_id(
    config_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get a specific AI configuration by ID
    
    Useful for viewing historical configurations
    
    Requirements: 8.5
    """
    logger.info(f"User {current_user.id} fetching AI config {config_id}")
    
    config = db.query(AIModelConfig).filter(
        AIModelConfig.id == config_id
    ).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuration with ID {config_id} not found"
        )
    
    return AIConfigResponse(
        id=config.id,
        confidence_threshold=config.confidence_threshold,
        iou_threshold=config.iou_threshold,
        detection_frequency=config.detection_frequency,
        violation_types=config.violation_types,
        is_active=config.is_active,
        created_by=config.created_by,
        created_at=config.created_at,
        notes=config.notes
    )


@router.post("/{config_id}/activate", response_model=AIConfigResponse)
def activate_config(
    config_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Activate a specific configuration from history
    
    This allows reverting to a previous configuration
    
    Requirements: 8.5
    """
    logger.info(f"User {current_user.id} activating AI config {config_id}")
    
    config = db.query(AIModelConfig).filter(
        AIModelConfig.id == config_id
    ).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuration with ID {config_id} not found"
        )
    
    try:
        # Deactivate all configurations
        db.query(AIModelConfig).filter(
            AIModelConfig.is_active == True
        ).update({'is_active': False})
        
        # Activate the selected configuration
        config.is_active = True
        db.commit()
        db.refresh(config)
        
        # Apply configuration to AI detection service
        ai_detection_service.set_confidence_threshold(config.confidence_threshold)
        ai_detection_service.configure_violation_rules(config.violation_types)
        
        logger.info(f"Activated AI config {config_id}")
        
        return AIConfigResponse(
            id=config.id,
            confidence_threshold=config.confidence_threshold,
            iou_threshold=config.iou_threshold,
            detection_frequency=config.detection_frequency,
            violation_types=config.violation_types,
            is_active=config.is_active,
            created_by=config.created_by,
            created_at=config.created_at,
            notes=config.notes
        )
        
    except Exception as e:
        logger.error(f"Error activating AI config: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to activate configuration: {str(e)}"
        )


@router.get("/stats/summary", response_model=AIConfigStatsResponse)
def get_config_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get statistics about AI configurations
    
    Returns summary information about configurations and current settings
    """
    logger.info(f"User {current_user.id} fetching AI config stats")
    
    # Get total configurations
    total_configs = db.query(AIModelConfig).count()
    
    # Get current active configuration
    current_config = db.query(AIModelConfig).filter(
        AIModelConfig.is_active == True
    ).order_by(desc(AIModelConfig.created_at)).first()
    
    enabled_types = []
    disabled_types = []
    current_config_id = None
    last_updated = None
    last_updated_by = None
    
    if current_config:
        current_config_id = current_config.id
        last_updated = current_config.created_at
        last_updated_by = current_config.created_by
        
        # Parse violation types
        for vtype, vconfig in current_config.violation_types.items():
            if vconfig.get('enabled', False):
                enabled_types.append(vtype)
            else:
                disabled_types.append(vtype)
    
    return AIConfigStatsResponse(
        total_configs=total_configs,
        current_config_id=current_config_id,
        enabled_violation_types=enabled_types,
        disabled_violation_types=disabled_types,
        last_updated=last_updated,
        last_updated_by=last_updated_by
    )
