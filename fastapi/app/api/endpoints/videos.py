"""
Video management endpoints
Handles video upload, retrieval, and management for camera system
"""
from typing import Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.CameraVideo import CameraVideo, ProcessingStatus
from app.models.video_processing_job import VideoProcessingJob, JobType, JobStatus
from app.models.camera import Camera
from app.schemas.video_schema import (
    VideoUploadResponse, 
    VideoResponse, 
    VideoListResponse,
    VideoStatsResponse,
    VideoStatsByDate,
)
from app.services.cloudinary_service import cloudinary_service
from app.services.cache_service import cache_service
from app.services.audit_service import audit_service
from app.utils.file_validator import file_validator
from app.core.security_config import get_client_ip, get_user_agent
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Allowed video formats and max file size
ALLOWED_VIDEO_FORMATS = ["mp4", "avi", "mov"]
MAX_FILE_SIZE_MB = 100
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


def validate_video_file(file: UploadFile) -> None:
    """
    Validate video file type and size
    
    Args:
        file: Uploaded file
        
    Raises:
        HTTPException: If validation fails
    """
    # Check file extension
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required"
        )
    
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in ALLOWED_VIDEO_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file format. Allowed formats: {', '.join(ALLOWED_VIDEO_FORMATS)}"
        )
    
    # Check content type
    if file.content_type and not file.content_type.startswith("video/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a video"
        )


@router.post("/upload", response_model=VideoUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_video(
    request: Request,
    file: UploadFile = File(..., description="Video file to upload"),
    camera_id: int = Form(..., description="Camera ID"),
    recorded_at: Optional[str] = Form(None, description="Recording timestamp (ISO format)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload video to Cloudinary and save metadata to database
    
    - **file**: Video file (mp4, avi, mov, max 100MB)
    - **camera_id**: ID of the camera that recorded the video
    - **recorded_at**: Optional timestamp when video was recorded
    
    Returns video information
    
    Security features:
    - Comprehensive file validation (extension, MIME type, size, malicious content)
    - Audit logging of upload attempts
    - Rate limiting (50 uploads per minute)
    """
    logger.info(f"User {current_user.id} uploading video for camera {camera_id}")
    
    # Get client metadata for audit logging
    client_ip = get_client_ip(request)
    user_agent = get_user_agent(request)
    
    try:
        # Comprehensive file validation
        validation_result = await file_validator.validate_video_file(file)
        file_size = validation_result["file_size"]
        file_hash = validation_result["file_hash"]
        
        logger.info(f"File validation passed: {validation_result['sanitized_filename']}")
        
    except HTTPException as e:
        # Log failed upload attempt
        audit_service.log_failed_upload(
            db=db,
            user_id=current_user.id,
            reason=e.detail,
            file_name=file.filename,
            file_size=None,
            ip_address=client_ip,
            user_agent=user_agent
        )
        raise
    
    # Verify camera exists
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        audit_service.log_failed_upload(
            db=db,
            user_id=current_user.id,
            reason=f"Camera {camera_id} not found",
            file_name=file.filename,
            file_size=file_size,
            ip_address=client_ip,
            user_agent=user_agent
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Camera with ID {camera_id} not found"
        )
    
    try:
        # Upload to Cloudinary
        logger.info(f"Uploading video to Cloudinary for camera {camera_id}")
        upload_result = cloudinary_service.upload_video(
            file=file,
            folder="traffic_videos",
            camera_id=camera_id
        )
        
        # Generate thumbnail
        thumbnail_url = cloudinary_service.generate_thumbnail(
            public_id=upload_result["public_id"],
            timestamp=0.0
        )
        
        # Create video record in database
        video = CameraVideo(
            camera_id=camera_id,
            cloudinary_public_id=upload_result["public_id"],
            cloudinary_url=upload_result["secure_url"],
            thumbnail_url=thumbnail_url,
            duration=upload_result.get("duration"),
            file_size=upload_result.get("bytes"),
            format=upload_result.get("format"),
            uploaded_by=current_user.id,
            processing_status=ProcessingStatus.COMPLETED,
            has_violations=False,
            violation_count=0,
            video_metadata={
                "width": upload_result.get("width"),
                "height": upload_result.get("height"),
                "resource_type": upload_result.get("resource_type"),
                "cloudinary_created_at": upload_result.get("created_at"),
            }
        )
        
        db.add(video)
        db.commit()
        db.refresh(video)
        
        logger.info(f"Video uploaded successfully: video_id={video.id}")
        
        # Invalidate camera stats cache since we added a new video
        cache_service.invalidate_camera_stats(camera_id)
        
        # Log successful upload
        audit_service.log_video_upload(
            db=db,
            user_id=current_user.id,
            video_id=video.id,
            camera_id=camera_id,
            file_size=file_size,
            ip_address=client_ip,
            user_agent=user_agent,
            status="success"
        )
        
        return VideoUploadResponse(
            video_id=video.id,
            cloudinary_url=video.cloudinary_url,
            thumbnail_url=video.thumbnail_url,
            processing_job_id=None,
            status=video.processing_status
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error uploading video: {str(e)}")
        db.rollback()
        
        # Log failed upload
        audit_service.log_failed_upload(
            db=db,
            user_id=current_user.id,
            reason=str(e),
            file_name=file.filename,
            file_size=file_size if 'file_size' in locals() else None,
            ip_address=client_ip,
            user_agent=user_agent
        )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload video: {str(e)}"
        )


@router.get("/cameras/{camera_id}/videos", response_model=VideoListResponse)
def get_camera_videos(
    camera_id: int,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of records to return"),
    has_violations: Optional[bool] = Query(None, description="Filter by videos with violations"),
    processing_status: Optional[str] = Query(None, description="Filter by processing status (pending, processing, completed, failed)"),
    date_from: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get videos for a specific camera
    
    - **camera_id**: ID of the camera
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return (pagination)
    - **has_violations**: Optional filter for videos with violations
    - **processing_status**: Optional filter for processing status (pending, processing, completed, failed)
    - **date_from**: Optional start date filter (YYYY-MM-DD)
    - **date_to**: Optional end date filter (YYYY-MM-DD)
    
    Returns list of videos with pagination
    """
    logger.info(f"User {current_user.id} fetching videos for camera {camera_id}")
    
    # Verify camera exists
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Camera with ID {camera_id} not found"
        )
    
    # Build query
    query = db.query(CameraVideo).filter(CameraVideo.camera_id == camera_id)
    
    # Apply has_violations filter
    if has_violations is not None:
        query = query.filter(CameraVideo.has_violations == has_violations)
    
    # Apply processing_status filter
    if processing_status is not None:
        try:
            status_enum = ProcessingStatus(processing_status.lower())
            query = query.filter(CameraVideo.processing_status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid processing_status. Must be one of: {', '.join([s.value for s in ProcessingStatus])}"
            )
    
    # Apply date filters
    if date_from:
        try:
            start_date = datetime.strptime(date_from, "%Y-%m-%d")
            query = query.filter(CameraVideo.created_at >= start_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date_from format. Use YYYY-MM-DD"
            )
    
    if date_to:
        try:
            end_date = datetime.strptime(date_to, "%Y-%m-%d")
            # Add one day to include the entire end date
            end_date = end_date + timedelta(days=1)
            query = query.filter(CameraVideo.created_at < end_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date_to format. Use YYYY-MM-DD"
            )
    
    # Order by created_at (most recent first)
    query = query.order_by(CameraVideo.created_at.desc())
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    videos = query.offset(skip).limit(limit).all()
    
    # Convert to response format
    video_list = [
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
            uploaded_at=video.created_at,
            processed_at=video.processed_at,
            processing_status=video.processing_status,
            has_violations=video.has_violations,
            violation_count=video.violation_count
        )
        for video in videos
    ]
    
    logger.info(f"Found {total} videos for camera {camera_id}, returning {len(video_list)}")
    
    return VideoListResponse(
        videos=video_list,
        total=total,
        page=skip // limit + 1 if limit > 0 else 1,
        size=len(video_list)
    )


@router.get("/{video_id}", response_model=VideoResponse)
def get_video(
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get details of a specific video
    
    - **video_id**: ID of the video
    
    Returns video details including metadata and processing status
    
    Uses caching to improve performance for frequently accessed videos
    """
    logger.info(f"User {current_user.id} fetching video {video_id}")
    
    # Try to get from cache first
    cached_video = cache_service.get_video_metadata(video_id)
    if cached_video:
        logger.debug(f"Returning cached video metadata for video {video_id}")
        return VideoResponse(**cached_video)
    
    # Cache miss - fetch from database
    video = db.query(CameraVideo).filter(CameraVideo.id == video_id).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video with ID {video_id} not found"
        )
    
    # Prepare response
    video_response = VideoResponse(
        id=video.id,
        camera_id=video.camera_id,
        cloudinary_public_id=video.cloudinary_public_id,
        cloudinary_url=video.cloudinary_url,
        thumbnail_url=video.thumbnail_url,
        duration=video.duration,
        file_size=video.file_size,
        format=video.format,
        uploaded_by=video.uploaded_by,
        uploaded_at=video.created_at,
        processed_at=video.processed_at,
        processing_status=video.processing_status,
        has_violations=video.has_violations,
        violation_count=video.violation_count
    )
    
    # Cache the video metadata for 1 hour
    cache_service.set_video_metadata(video_id, video_response.model_dump(), ttl=3600)
    
    return video_response


@router.delete("/{video_id}")
def delete_video(
    video_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete a video from both Cloudinary and database
    
    - **video_id**: ID of the video to delete
    
    Returns success message
    
    Security: Audit logged for compliance
    """
    logger.info(f"User {current_user.id} deleting video {video_id}")
    
    # Get client metadata for audit logging
    client_ip = get_client_ip(request)
    user_agent = get_user_agent(request)
    
    video = db.query(CameraVideo).filter(CameraVideo.id == video_id).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video with ID {video_id} not found"
        )
    
    try:
        camera_id = video.camera_id
        
        # Delete from Cloudinary
        logger.info(f"Deleting video from Cloudinary: {video.cloudinary_public_id}")
        cloudinary_service.delete_video(video.cloudinary_public_id)
        
        # Delete from database (cascade will delete related records)
        db.delete(video)
        db.commit()
        
        # Invalidate caches
        cache_service.invalidate_video_metadata(video_id)
        cache_service.invalidate_camera_stats(camera_id)
        
        # Log successful deletion
        audit_service.log_video_delete(
            db=db,
            user_id=current_user.id,
            video_id=video_id,
            ip_address=client_ip,
            user_agent=user_agent,
            status="success"
        )
        
        logger.info(f"Video {video_id} deleted successfully")
        
        return {
            "success": True,
            "message": "Video deleted from Cloudinary and database"
        }
        
    except Exception as e:
        logger.error(f"Error deleting video {video_id}: {str(e)}")
        db.rollback()
        
        # Log failed deletion
        audit_service.log_video_delete(
            db=db,
            user_id=current_user.id,
            video_id=video_id,
            ip_address=client_ip,
            user_agent=user_agent,
            status="failure"
        )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete video: {str(e)}"
        )


@router.get("/cameras/{camera_id}/video-stats", response_model=VideoStatsResponse)
def get_camera_video_stats(
    camera_id: int,
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get video statistics for a specific camera
    
    - **camera_id**: ID of the camera
    - **date_from**: Optional start date filter (YYYY-MM-DD)
    - **date_to**: Optional end date filter (YYYY-MM-DD)
    
    Returns:
    - Total videos count
    - Total duration (seconds)
    - Total violations detected
    - Videos with violations count
    - Average video duration
    - Statistics grouped by date for charts
    """
    logger.info(f"User {current_user.id} fetching video stats for camera {camera_id}")
    
    # Verify camera exists
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Camera with ID {camera_id} not found"
        )
    
    # Try to get from cache if no date filters (common case)
    if not date_from and not date_to:
        cached_stats = cache_service.get_camera_video_stats(camera_id)
        if cached_stats:
            logger.debug(f"Returning cached stats for camera {camera_id}")
            return VideoStatsResponse(**cached_stats)
    
    # Build base query
    query = db.query(CameraVideo).filter(CameraVideo.camera_id == camera_id)
    
    # Apply date filters if provided
    if date_from:
        try:
            start_date = datetime.strptime(date_from, "%Y-%m-%d")
            query = query.filter(CameraVideo.created_at >= start_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date_from format. Use YYYY-MM-DD"
            )
    
    if date_to:
        try:
            end_date = datetime.strptime(date_to, "%Y-%m-%d")
            end_date = end_date + timedelta(days=1)
            query = query.filter(CameraVideo.created_at < end_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date_to format. Use YYYY-MM-DD"
            )
    
    # Get aggregate statistics
    videos = query.all()
    
    total_videos = len(videos)
    total_duration = sum(v.duration or 0 for v in videos)
    total_violations = sum(v.violation_count or 0 for v in videos)
    videos_with_violations = sum(1 for v in videos if v.has_violations)
    avg_duration = total_duration / total_videos if total_videos > 0 else 0
    
    # Get stats by date
    stats_by_date_query = db.query(
        cast(CameraVideo.created_at, Date).label('date'),
        func.count(CameraVideo.id).label('video_count'),
        func.sum(CameraVideo.violation_count).label('violation_count'),
        func.sum(CameraVideo.duration).label('total_duration')
    ).filter(CameraVideo.camera_id == camera_id)
    
    if date_from:
        stats_by_date_query = stats_by_date_query.filter(CameraVideo.created_at >= start_date)
    if date_to:
        stats_by_date_query = stats_by_date_query.filter(CameraVideo.created_at < end_date)
    
    stats_by_date_query = stats_by_date_query.group_by(cast(CameraVideo.created_at, Date)).order_by(cast(CameraVideo.created_at, Date))
    
    stats_by_date = [
        VideoStatsByDate(
            date=str(row.date),
            video_count=row.video_count,
            violation_count=int(row.violation_count or 0),
            total_duration=float(row.total_duration or 0)
        )
        for row in stats_by_date_query.all()
    ]
    
    response = VideoStatsResponse(
        camera_id=camera_id,
        total_videos=total_videos,
        total_duration=total_duration,
        total_violations=total_violations,
        videos_with_violations=videos_with_violations,
        avg_duration=avg_duration,
        stats_by_date=stats_by_date
    )
    
    # Cache the response if no date filters
    if not date_from and not date_to:
        cache_service.set_camera_video_stats(camera_id, response.model_dump(), ttl=3600)
    
    return response
