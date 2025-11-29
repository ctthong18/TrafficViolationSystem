"""
Video management endpoints
Handles video upload, retrieval, and management for AI camera system
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
from app.models.ai_detection import AIDetection, DetectionType, ReviewStatus
from app.schemas.video_schema import (
    VideoUploadResponse, 
    VideoResponse, 
    VideoListResponse,
    VideoStatsResponse,
    VideoStatsByDate,
    VideoAnalysisResponse,
    DetectionResponse,
    VideoDetectionsResponse,
    PendingDetectionsResponse,
    DetectionReviewRequest,
    DetectionReviewResponse
)
from app.services.cloudinary_service import cloudinary_service
from app.services.ai_detection_service import ai_detection_service
from app.services.video_processing_service import video_processing_service
from app.services.violation_service import ViolationService
from app.services.cache_service import cache_service
from app.services.audit_service import audit_service, AuditAction, AuditResource
from app.utils.file_validator import file_validator
from app.core.security_config import get_client_ip, get_user_agent
from app.schemas.violation_schema import ViolationCreate
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Import Celery tasks (only if Celery is available)
try:
    from app.workers.video_worker import process_video_task
    CELERY_AVAILABLE = True
except ImportError:
    CELERY_AVAILABLE = False
    logger.warning("Celery not available, background processing disabled")

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
    
    Returns video information and processing job ID
    
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
            processing_status=ProcessingStatus.PENDING,
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
        db.flush()  # Get video ID without committing
        
        # Create processing job for AI analysis
        processing_job = VideoProcessingJob(
            video_id=video.id,
            job_type=JobType.AI_ANALYSIS,
            status=JobStatus.PENDING,
            retry_count=0
        )
        
        db.add(processing_job)
        db.commit()
        db.refresh(video)
        db.refresh(processing_job)
        
        # Queue the video for background processing using Celery
        if CELERY_AVAILABLE:
            try:
                process_video_task.apply_async(
                    args=[processing_job.id],
                    queue='video_processing'
                )
                logger.info(f"Queued video {video.id} for background processing (job {processing_job.id})")
            except Exception as e:
                logger.error(f"Failed to queue video for background processing: {e}")
                # Continue anyway - job can be processed manually later
        else:
            logger.warning(f"Celery not available, video {video.id} not queued for background processing")
        
        logger.info(f"Video uploaded successfully: video_id={video.id}, job_id={processing_job.id}")
        
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
            processing_job_id=processing_job.id,
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


@router.get("/detections/pending", response_model=PendingDetectionsResponse)
def get_pending_detections(
    camera_id: Optional[int] = Query(None, description="Filter by camera ID"),
    violation_type: Optional[str] = Query(None, description="Filter by violation type"),
    min_confidence: Optional[float] = Query(None, description="Minimum confidence score (0.0-1.0)", ge=0.0, le=1.0),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of records to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get pending AI detections that need review
    
    - **camera_id**: Optional filter by camera
    - **violation_type**: Optional filter by violation type
    - **min_confidence**: Optional minimum confidence threshold
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return (pagination)
    
    Returns list of pending detections across all videos
    
    Requirements: 4.2, 7.1, 7.4
    """
    logger.info(f"User {current_user.id} fetching pending detections")
    
    try:
        # Build query for pending detections
        query = db.query(AIDetection).filter(
            AIDetection.review_status == ReviewStatus.PENDING
        )
        
        # Apply camera filter if provided
        if camera_id is not None:
            query = query.join(CameraVideo).filter(CameraVideo.camera_id == camera_id)
        
        # Apply violation type filter if provided
        if violation_type:
            # Filter for violation detections with specific type
            query = query.filter(
                AIDetection.detection_type == DetectionType.VIOLATION,
                AIDetection.detection_data['violation_type'].astext == violation_type
            )
        
        # Apply confidence filter if provided
        if min_confidence is not None:
            query = query.filter(AIDetection.confidence_score >= min_confidence)
        
        # Order by detected_at (most recent first)
        query = query.order_by(AIDetection.detected_at.desc())
        
        # Get total count before pagination
        total = query.count()
        
        # Apply pagination
        detections = query.offset(skip).limit(limit).all()
        
        # Convert to response format
        detection_list = []
        for det in detections:
            detection_list.append(DetectionResponse(
                id=det.id,
                detection_type=det.detection_type.value,
                timestamp=float(det.frame_timestamp),
                confidence=float(det.confidence_score),
                data=det.detection_data,
                detected_at=det.detected_at.isoformat(),
                reviewed=det.reviewed,
                review_status=det.review_status.value if det.review_status else None,
                violation_id=det.violation_id
            ))
        
        logger.info(f"Found {total} pending detections, returning {len(detection_list)}")
        
        return PendingDetectionsResponse(
            detections=detection_list,
            total=total,
            page=skip // limit + 1 if limit > 0 else 1,
            size=len(detection_list)
        )
        
    except Exception as e:
        logger.error(f"Error fetching pending detections: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch pending detections: {str(e)}"
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
    
    Requirements: 2.1, 6.1, 6.2
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
            uploaded_at=video.created_at,  # Use created_at as uploaded_at
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
        uploaded_at=video.created_at,  # Use created_at as uploaded_at
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



@router.post("/{video_id}/analyze", response_model=VideoAnalysisResponse)
def analyze_video(
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Queue video for AI processing
    
    - **video_id**: ID of the video to analyze
    
    Returns job ID and status for tracking the processing
    """
    logger.info(f"User {current_user.id} queueing video {video_id} for AI analysis")
    
    # Get video record
    video = db.query(CameraVideo).filter(CameraVideo.id == video_id).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video with ID {video_id} not found"
        )
    
    # Check if there's already a pending or processing job for this video
    existing_job = db.query(VideoProcessingJob).filter(
        VideoProcessingJob.video_id == video_id,
        VideoProcessingJob.job_type == JobType.AI_ANALYSIS,
        VideoProcessingJob.status.in_([JobStatus.PENDING, JobStatus.PROCESSING])
    ).first()
    
    if existing_job:
        logger.info(f"Video {video_id} already has a processing job: {existing_job.id}")
        return {
            "job_id": existing_job.id,
            "status": existing_job.status.value,
            "message": "Video is already queued or being processed"
        }
    
    try:
        # Create a new processing job
        processing_job = VideoProcessingJob(
            video_id=video_id,
            job_type=JobType.AI_ANALYSIS,
            status=JobStatus.PENDING,
            retry_count=0
        )
        
        db.add(processing_job)
        db.commit()
        db.refresh(processing_job)
        
        # Queue the video for background processing using Celery
        if CELERY_AVAILABLE:
            try:
                process_video_task.apply_async(
                    args=[processing_job.id],
                    queue='video_processing'
                )
                logger.info(f"Queued video {video_id} for background AI analysis (job {processing_job.id})")
            except Exception as e:
                logger.error(f"Failed to queue video for background processing: {e}")
                # Continue anyway - job can be processed manually later
        else:
            logger.warning(f"Celery not available, video {video_id} not queued for background processing")
        
        logger.info(f"Created AI analysis job {processing_job.id} for video {video_id}")
        
        return {
            "job_id": processing_job.id,
            "status": processing_job.status.value,
            "video_id": video_id,
            "message": "Video queued for AI processing"
        }
        
    except Exception as e:
        logger.error(f"Error queueing video {video_id} for analysis: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to queue video for analysis: {str(e)}"
        )


@router.get("/{video_id}/detections", response_model=VideoDetectionsResponse)
def get_video_detections(
    video_id: int,
    detection_type: Optional[str] = Query(None, description="Filter by detection type (license_plate, vehicle_count, violation)"),
    min_confidence: Optional[float] = Query(None, description="Minimum confidence score (0.0-1.0)", ge=0.0, le=1.0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get AI detection results for a specific video
    
    - **video_id**: ID of the video
    - **detection_type**: Optional filter by type (license_plate, vehicle_count, violation)
    - **min_confidence**: Optional minimum confidence threshold
    
    Returns list of detections with timestamps and confidence scores
    
    Requirements: 4.2, 7.1, 7.4
    """
    logger.info(f"User {current_user.id} fetching detections for video {video_id}")
    
    # Verify video exists
    video = db.query(CameraVideo).filter(CameraVideo.id == video_id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video with ID {video_id} not found"
        )
    
    try:
        detections = ai_detection_service.get_video_detections(
            db=db,
            video_id=video_id,
            detection_type=detection_type,
            min_confidence=min_confidence
        )
        
        return VideoDetectionsResponse(
            video_id=video_id,
            total_detections=len(detections),
            detections=detections
        )
        
    except Exception as e:
        logger.error(f"Error fetching detections for video {video_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch detections: {str(e)}"
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
            # Add one day to include the entire end date
            end_date = end_date + timedelta(days=1)
            query = query.filter(CameraVideo.created_at < end_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date_to format. Use YYYY-MM-DD"
            )
    
    # Calculate overall statistics
    total_videos = query.count()
    
    # Calculate total duration (sum of all video durations)
    total_duration_result = query.with_entities(
        func.sum(CameraVideo.duration)
    ).scalar()
    total_duration = int(total_duration_result or 0)
    
    # Calculate total violations
    total_violations_result = query.with_entities(
        func.sum(CameraVideo.violation_count)
    ).scalar()
    total_violations = int(total_violations_result or 0)
    
    # Count videos with violations
    videos_with_violations = query.filter(
        CameraVideo.has_violations == True
    ).count()
    
    # Calculate average duration
    avg_duration = float(total_duration / total_videos) if total_videos > 0 else 0.0
    
    # Group by date for charts
    # Query videos grouped by upload date
    date_stats = query.with_entities(
        cast(CameraVideo.created_at, Date).label('date'),
        func.count(CameraVideo.id).label('video_count'),
        func.sum(CameraVideo.duration).label('total_duration'),
        func.sum(CameraVideo.violation_count).label('violation_count')
    ).group_by(
        cast(CameraVideo.created_at, Date)
    ).order_by(
        cast(CameraVideo.created_at, Date)
    ).all()
    
    # Format date statistics
    by_date = [
        VideoStatsByDate(
            date=stat.date.strftime("%Y-%m-%d"),
            video_count=stat.video_count,
            total_duration=int(stat.total_duration or 0),
            violation_count=int(stat.violation_count or 0)
        )
        for stat in date_stats
    ]
    
    logger.info(f"Video stats for camera {camera_id}: {total_videos} videos, {total_violations} violations")
    
    stats_response = VideoStatsResponse(
        total_videos=total_videos,
        total_duration=total_duration,
        total_violations=total_violations,
        videos_with_violations=videos_with_violations,
        avg_duration=round(avg_duration, 2),
        by_date=by_date
    )
    
    # Cache stats for 5 minutes if no date filters
    if not date_from and not date_to:
        cache_service.set_camera_video_stats(camera_id, stats_response.model_dump(), ttl=300)
    
    return stats_response


@router.get("/detections/pending", response_model=PendingDetectionsResponse)
def get_pending_detections(
    camera_id: Optional[int] = Query(None, description="Filter by camera ID"),
    violation_type: Optional[str] = Query(None, description="Filter by violation type"),
    min_confidence: Optional[float] = Query(None, description="Minimum confidence score (0.0-1.0)", ge=0.0, le=1.0),
    date_from: Optional[str] = Query(None, description="Start date (ISO format)"),
    date_to: Optional[str] = Query(None, description="End date (ISO format)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of records to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get pending AI detections that need review
    
    - **camera_id**: Optional filter by camera
    - **violation_type**: Optional filter by violation type
    - **min_confidence**: Optional minimum confidence threshold
    - **date_from**: Optional start date filter (ISO format)
    - **date_to**: Optional end date filter (ISO format)
    - **skip**: Pagination offset
    - **limit**: Maximum results per page
    
    Returns list of unreviewed detections for officer review
    
    Requirements: 7.1, 7.2, 7.5
    """
    logger.info(f"User {current_user.id} fetching pending detections")
    
    try:
        # Build base query for pending detections
        query = db.query(AIDetection).filter(
            AIDetection.reviewed == False,
            AIDetection.review_status == ReviewStatus.PENDING
        )
        
        # Apply camera filter
        if camera_id is not None:
            # Join with CameraVideo to filter by camera
            query = query.join(CameraVideo, AIDetection.video_id == CameraVideo.id).filter(
                CameraVideo.camera_id == camera_id
            )
        
        # Apply violation type filter
        if violation_type:
            query = query.filter(
                AIDetection.detection_type == DetectionType.VIOLATION,
                AIDetection.detection_data['violation_type'].astext == violation_type
            )
        
        # Apply confidence filter
        if min_confidence is not None:
            query = query.filter(AIDetection.confidence_score >= min_confidence)
        
        # Apply date range filters
        if date_from:
            try:
                start_date = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                query = query.filter(AIDetection.detected_at >= start_date)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid date_from format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"
                )
        
        if date_to:
            try:
                end_date = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                query = query.filter(AIDetection.detected_at <= end_date)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid date_to format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"
                )
        
        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        detections = query.order_by(AIDetection.detected_at.desc()).offset(skip).limit(limit).all()
        
        # Convert to response format
        detection_responses = [
            DetectionResponse(
                id=d.id,
                video_id=d.video_id,
                detection_type=d.detection_type.value,
                timestamp=float(d.frame_timestamp),
                confidence=float(d.confidence_score),
                data=d.detection_data,
                detected_at=d.detected_at.isoformat(),
                reviewed=d.reviewed,
                review_status=d.review_status.value if d.review_status else None,
                violation_id=d.violation_id
            )
            for d in detections
        ]
        
        logger.info(f"Found {total} pending detections, returning {len(detection_responses)}")
        
        return PendingDetectionsResponse(
            detections=detection_responses,
            total=total,
            page=skip // limit + 1,
            size=len(detection_responses)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching pending detections: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch pending detections: {str(e)}"
        )


@router.post("/detections/{detection_id}/review", response_model=DetectionReviewResponse)
def review_detection(
    detection_id: int,
    review_request: DetectionReviewRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Review an AI detection (approve, reject, or modify)
    
    - **detection_id**: ID of the detection to review
    - **action**: Action to take ('approve', 'reject', or 'modify')
    - **notes**: Optional review notes from officer
    - **modified_data**: Optional modified detection data (for 'modify' action)
    
    When approved:
    - Creates a violation record if detection is a violation type
    - Links the violation to the detection
    - Updates detection status to 'approved'
    
    Requirements: 4.3, 4.4, 10.1
    
    Security: All review actions are audit logged
    """
    logger.info(f"User {current_user.id} reviewing detection {detection_id} with action '{review_request.action}'")
    
    # Get client metadata for audit logging
    client_ip = get_client_ip(request)
    user_agent = get_user_agent(request)
    
    # Get the detection
    detection = db.query(AIDetection).filter(AIDetection.id == detection_id).first()
    
    if not detection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Detection with ID {detection_id} not found"
        )
    
    # Check if already reviewed
    if detection.reviewed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Detection {detection_id} has already been reviewed"
        )
    
    # Validate action
    action = review_request.action.lower().strip()
    if action not in ['approve', 'reject', 'modify']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid action. Must be 'approve', 'reject', or 'modify'"
        )
    
    try:
        violation_created = False
        violation_id = None
        
        # Handle modify action - update detection data
        if action == 'modify':
            if not review_request.modified_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="modified_data is required for 'modify' action"
                )
            
            # Update detection data with modified data
            detection.detection_data = review_request.modified_data
            logger.info(f"Modified detection {detection_id} data")
        
        # Update detection review status
        if action == 'approve':
            detection.review_status = ReviewStatus.APPROVED
        elif action == 'reject':
            detection.review_status = ReviewStatus.REJECTED
        elif action == 'modify':
            # Modified detections remain pending for re-review
            detection.review_status = ReviewStatus.PENDING
        
        detection.reviewed = True
        detection.reviewed_by = current_user.id
        detection.reviewed_at = datetime.now()
        detection.review_notes = review_request.notes
        
        db.flush()  # Flush to get updated detection data
        
        # Create violation record if approved and detection is a violation type
        if action == 'approve' and detection.detection_type == DetectionType.VIOLATION:
            logger.info(f"Creating violation record for approved detection {detection_id}")
            
            # Get video information for location context
            video = db.query(CameraVideo).filter(CameraVideo.id == detection.video_id).first()
            camera = db.query(Camera).filter(Camera.id == video.camera_id).first() if video else None
            
            # Extract violation data from detection
            violation_data = detection.detection_data
            license_plate = violation_data.get('license_plate', 'UNKNOWN')
            violation_type = violation_data.get('violation_type', 'Unknown Violation')
            vehicle_type = violation_data.get('vehicle_type')
            
            # Create violation using ViolationService
            violation_service = ViolationService(db)
            
            violation_create = ViolationCreate(
                license_plate=license_plate,
                vehicle_type=vehicle_type,
                violation_type=violation_type,
                location_name=camera.location if camera else None,
                latitude=camera.latitude if camera else None,
                longitude=camera.longitude if camera else None,
                camera_id=str(camera.camera_id) if camera else None,
                detected_at=detection.detected_at,
                confidence_score=float(detection.confidence_score),
                evidence_images=[video.thumbnail_url] if video and video.thumbnail_url else [],
                ai_metadata={
                    'detection_id': detection.id,
                    'video_id': detection.video_id,
                    'frame_timestamp': float(detection.frame_timestamp),
                    'detection_data': violation_data,
                    'reviewed_by': current_user.id,
                    'reviewed_at': detection.reviewed_at.isoformat()
                }
            )
            
            violation = violation_service.create_violation(violation_create)
            
            # Link violation to detection
            detection.violation_id = violation.id
            
            # Update video violation count
            if video:
                video.has_violations = True
                video.violation_count = db.query(AIDetection).filter(
                    AIDetection.video_id == video.id,
                    AIDetection.violation_id.isnot(None)
                ).count()
            
            violation_created = True
            violation_id = violation.id
            
            logger.info(f"Created violation {violation_id} from detection {detection_id}")
        
        db.commit()
        db.refresh(detection)
        
        # Invalidate caches
        if video:
            cache_service.invalidate_video_metadata(video.id)
            cache_service.invalidate_camera_stats(video.camera_id)
        cache_service.invalidate_all_detections()
        
        # Prepare response
        detection_response = DetectionResponse(
            id=detection.id,
            detection_type=detection.detection_type.value,
            timestamp=float(detection.frame_timestamp),
            confidence=float(detection.confidence_score),
            data=detection.detection_data,
            detected_at=detection.detected_at.isoformat(),
            reviewed=detection.reviewed,
            review_status=detection.review_status.value,
            violation_id=detection.violation_id
        )
        
        message = f"Detection {action}d successfully"
        if violation_created:
            message += f" and violation record created (ID: {violation_id})"
        
        logger.info(f"Detection {detection_id} reviewed successfully: {message}")
        
        # Log detection review
        audit_service.log_detection_review(
            db=db,
            user_id=current_user.id,
            detection_id=detection_id,
            review_action=action,
            violation_created=violation_created,
            ip_address=client_ip,
            user_agent=user_agent,
            status="success"
        )
        
        return DetectionReviewResponse(
            detection=detection_response,
            violation_created=violation_created,
            violation_id=violation_id,
            message=message
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        db.rollback()
        
        # Log failed review
        audit_service.log_detection_review(
            db=db,
            user_id=current_user.id,
            detection_id=detection_id,
            review_action=review_request.action,
            violation_created=False,
            ip_address=client_ip,
            user_agent=user_agent,
            status="failure"
        )
        
        raise
    except Exception as e:
        logger.error(f"Error reviewing detection {detection_id}: {str(e)}")
        db.rollback()
        
        # Log failed review
        audit_service.log_detection_review(
            db=db,
            user_id=current_user.id,
            detection_id=detection_id,
            review_action=review_request.action,
            violation_created=False,
            ip_address=client_ip,
            user_agent=user_agent,
            status="failure"
        )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to review detection: {str(e)}"
        )


@router.post("/detections/{detection_id}/create-violation", response_model=dict)
def create_violation_from_detection(
    detection_id: int,
    officer_id: Optional[int] = Query(None, description="Officer ID to assign for review"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a violation record from an approved AI detection.
    
    This endpoint:
    - Converts an approved detection to a violation record
    - Links video evidence to the violation
    - Sets violation status to "ai_detected"
    - Optionally assigns to an officer for review
    
    Requirements: 4.1, 10.1, 10.2
    
    Args:
        detection_id: ID of the approved detection to convert
        officer_id: Optional officer ID to assign the violation to
        
    Returns:
        Created violation details
        
    Raises:
        404: Detection not found
        400: Detection not approved or already has violation
    """
    logger.info(f"User {current_user.id} creating violation from detection {detection_id}")
    
    try:
        # Use ViolationService to create violation from detection
        violation_service = ViolationService(db)
        violation = violation_service.create_violation_from_detection(
            detection_id=detection_id,
            officer_id=officer_id
        )
        
        logger.info(f"Successfully created violation {violation.id} from detection {detection_id}")
        
        return {
            "success": True,
            "violation_id": violation.id,
            "detection_id": detection_id,
            "status": violation.status,
            "license_plate": violation.license_plate,
            "violation_type": violation.violation_type,
            "assigned_to": violation.reviewed_by,
            "message": f"Violation created successfully from detection {detection_id}"
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error creating violation from detection {detection_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create violation: {str(e)}"
        )
