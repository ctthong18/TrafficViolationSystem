import asyncio
import os
import time
from datetime import datetime
from typing import Optional

import cv2
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_role, require_roles
from app.core.database import get_db
from app.models.CameraVideo import CameraVideo
from app.models.user import Role, User
from app.schemas.camera_schema import (
    CameraCreate,
    CameraListResponse,
    CameraResponse,
    CameraUpdate,
)
from app.schemas.video_schema import VideoListResponse, VideoResponse
from app.services.camera_service import CameraService
from fastapi import APIRouter, Body, Depends, Query, Response

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
    items, total = service.list_cameras(
        skip=skip, limit=limit, status=status, search=search
    )
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
    current_user: User = Depends(require_roles([Role.ADMIN.value, Role.OFFICER.value])),
    db: Session = Depends(get_db),
):
    service = CameraService(db)
    return service.create_camera(payload)


@router.put("/{camera_id}", response_model=CameraResponse)
def update_camera(
    camera_id: str,
    payload: CameraUpdate,
    current_user: User = Depends(require_roles([Role.ADMIN.value, Role.OFFICER.value])),
    db: Session = Depends(get_db),
):
    service = CameraService(db)
    return service.update_camera(camera_id, payload)


@router.delete("/{camera_id}")
def delete_camera(
    camera_id: str,
    current_user: User = Depends(require_role(Role.ADMIN.value)),
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
    import logging

    from fastapi import HTTPException, status

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
            date_from_dt = datetime.fromisoformat(date_from.replace("Z", "+00:00"))
            query = query.filter(CameraVideo.created_at >= date_from_dt)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date_from format. Use ISO format (YYYY-MM-DDTHH:MM:SS)",
            )

    if date_to:
        try:
            date_to_dt = datetime.fromisoformat(date_to.replace("Z", "+00:00"))
            query = query.filter(CameraVideo.created_at <= date_to_dt)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date_to format. Use ISO format (YYYY-MM-DDTHH:MM:SS)",
            )

    # Get total count
    total = query.count()

    # Apply pagination and ordering
    videos = (
        query.order_by(CameraVideo.created_at.desc()).offset(skip).limit(limit).all()
    )

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
            violation_count=video.violation_count,
        )
        for video in videos
    ]

    return VideoListResponse(
        videos=video_responses,
        total=total,
        page=(skip // limit + 1) if limit > 0 else 1,
        size=limit,
    )


from app.core.camera_manager import get_frame, update_frame


@router.post("/{camera_id}/push")
async def push_camera_frame(
    camera_id: str,
    frame: bytes = Body(...),
    current_user: User = Depends(get_current_user),
):
    """
    Endpoint for AI Agents to push processed JPEG frames via HTTP.
    """
    update_frame(camera_id, frame)
    return {"status": "ok"}


@router.get("/{camera_id}/stream")
def get_camera_stream(
    camera_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get the live stream URL for a camera.
    """
    service = CameraService(db)
    service.get_camera(camera_id)

    # Check if frames are available for this camera
    from app.core.camera_manager import get_frame

    frame_data = get_frame(camera_id)
    stream_status = "live" if frame_data else "offline"

    base_url = os.getenv("API_URL", "http://localhost:8000")
    stream_url = f"{base_url}/api/v1/cameras/video-feed/{camera_id}"

    return {
        "stream_url": stream_url,
        "type": "multipart/x-mixed-replace",
        "status": stream_status,
    }


async def generate_live_frames(camera_id: str):
    """
    Generator that yields the latest frame from the in-memory buffer.
    Only yields if a NEW frame has arrived.
    """
    import numpy as np

    last_frame_time = 0
    no_frame_count = 0

    while True:
        data = get_frame(camera_id)
        if not data:
            no_frame_count += 1
            # After 50 attempts (5 seconds), send placeholder image
            if no_frame_count > 50:
                # Create a placeholder "No Feed" image
                placeholder = np.zeros((270, 480, 3), dtype=np.uint8)
                cv2.putText(
                    placeholder,
                    "No Feed Available",
                    (100, 135),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (255, 255, 255),
                    2,
                )
                cv2.putText(
                    placeholder,
                    f"Camera: {camera_id}",
                    (120, 170),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (180, 180, 180),
                    1,
                )
                ret, buffer = cv2.imencode(".jpg", placeholder)
                if ret:
                    frame_bytes = buffer.tobytes()
                    yield (
                        b"--frame\r\n"
                        b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
                    )
                no_frame_count = 0
            await asyncio.sleep(0.1)
            continue

        no_frame_count = 0  # Reset when frames are available
        current_frame_time = data["timestamp"]

        # Only yield if it's a NEW frame
        if current_frame_time <= last_frame_time:
            await asyncio.sleep(0.01)  # Check again soon
            continue

        # Check if frame is stale (more than 10 seconds old)
        if time.time() - current_frame_time > 10.0:
            await asyncio.sleep(0.1)
            continue

        last_frame_time = current_frame_time
        frame_bytes = data["frame"]

        yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n")

        # Small sleep helps prevent CPU spiking
        await asyncio.sleep(0.01)


@router.get("/video-feed/{camera_id}")
async def video_feed(camera_id: str, response: Response):
    """
    Serve the latest pushed frames as an MJPEG stream.
    """
    # Set CORS headers to allow canvas to read the stream
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"

    return StreamingResponse(
        generate_live_frames(camera_id),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    )
