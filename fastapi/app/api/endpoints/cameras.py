from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.dependencies import get_current_user, require_roles, require_role
from app.models.user import User
from app.schemas.camera_schema import (
    CameraCreate,
    CameraUpdate,
    CameraResponse,
    CameraListResponse,
)
from app.schemas.video_schema import VideoListResponse, VideoResponse
from app.services.camera_service import CameraService
from app.models.CameraVideo import CameraVideo
from datetime import datetime

router = APIRouter()


@router.get("/", response_model=CameraListResponse)
def list_cameras(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = Query("all"),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = CameraService(db)
    items, total = service.list_cameras(skip=skip, limit=limit, status=status, search=search)
    return CameraListResponse(
        items=items,
        total=total,
        page=skip // limit + 1 if limit > 0 else 1,
        size=limit,
    )


@router.get("/{camera_id}", response_model=CameraResponse)
def get_camera(
    camera_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = CameraService(db)
    return service.get_camera(camera_id)


@router.post("/", response_model=CameraResponse)
def create_camera(
    payload: CameraCreate,
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db),
):
    service = CameraService(db)
    return service.create_camera(payload)


@router.put("/{camera_id}", response_model=CameraResponse)
def update_camera(
    camera_id: str,
    payload: CameraUpdate,
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db),
):
    service = CameraService(db)
    return service.update_camera(camera_id, payload)


@router.delete("/{camera_id}")
def delete_camera(
    camera_id: str,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    service = CameraService(db)
    service.delete_camera(camera_id)
    return {"success": True}


@router.get("/{camera_id}/videos", response_model=VideoListResponse)
def get_camera_videos(
    camera_id: str,
    skip: int = 0,
    limit: int = 20,
    has_violations: Optional[bool] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all videos for a specific camera with filtering and pagination
    
    - **camera_id**: ID of the camera
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return
    - **has_violations**: Filter by videos with/without violations
    - **date_from**: Filter videos from this date (ISO format)
    - **date_to**: Filter videos until this date (ISO format)
    
    Returns paginated list of videos
    """
    from fastapi import HTTPException, status
    import logging
    
    logger = logging.getLogger(__name__)
    logger.info(f"User {current_user.id} fetching videos for camera {camera_id}")
    
    # Get camera using service to verify it exists
    service = CameraService(db)
    camera = service.get_camera(camera_id)
    
    # Build query using the numeric camera.id
    query = db.query(CameraVideo).filter(CameraVideo.camera_id == camera.id)
    
    # Apply filters
    if has_violations is not None:
        query = query.filter(CameraVideo.has_violations == has_violations)
    
    if date_from:
        try:
            date_from_dt = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
            query = query.filter(CameraVideo.created_at >= date_from_dt)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date_from format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"
            )
    
    if date_to:
        try:
            date_to_dt = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
            query = query.filter(CameraVideo.created_at <= date_to_dt)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date_to format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"
            )
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    videos = query.order_by(CameraVideo.created_at.desc()).offset(skip).limit(limit).all()
    
    # Convert to response models
    video_responses = [
        VideoResponse(
            id=video.id,
            camera_id=video.camera_id,
            cloudinary_public_id=video.cloudinary_public_id,
            cloudinary_url=video.cloudinary_url,
            thumbnail_url=video.thumbnail_url,
            duration=video.duration,
            file_size=video.file_size,
            format=video.format,
            uploaded_by=video.uploaded_by,
            uploaded_at=video.created_at,  # Use created_at as uploaded_at
            processed_at=video.processed_at,
            processing_status=video.processing_status,
            has_violations=video.has_violations,
            violation_count=video.violation_count
        )
        for video in videos
    ]
    
    return VideoListResponse(
        videos=video_responses,
        total=total,
        page=(skip // limit + 1) if limit > 0 else 1,
        size=limit
    )


