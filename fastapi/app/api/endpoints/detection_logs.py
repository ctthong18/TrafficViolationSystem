"""
Detection Log API endpoints.

Provides REST API for accessing detection logs:
- List available logs
- Get log summary
- Get detections by frame/range
- Start/stop log replay
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.services.detection_log_service import detection_log_service
from app.services.log_replay_service import log_replay_service

router = APIRouter()


class LogInfoResponse(BaseModel):
    """Response model for log file information."""
    filename: str
    filepath: str
    size_bytes: int
    created_at: str
    modified_at: str
    video_path: Optional[str] = None
    total_frames: int = 0
    total_vehicles: int = 0
    total_violations: int = 0
    fps: Optional[float] = None


class LogSummaryResponse(BaseModel):
    """Response model for log summary."""
    video_info: dict
    model_info: dict
    summary: dict
    total_detections: int


class FrameDetectionResponse(BaseModel):
    """Response model for frame detection."""
    frame_number: int
    timestamp: float
    detections: List[dict]
    violations: List[dict]
    bbox: List[List[int]]
    vehicle_count: int
    processing_time_ms: float


class ReplayRequest(BaseModel):
    """Request model for starting replay."""
    log_filename: str
    camera_id: Optional[int] = None
    speed_multiplier: float = 1.0
    start_frame: int = 0
    end_frame: Optional[int] = None


class ReplayResponse(BaseModel):
    """Response model for replay status."""
    session_id: str
    status: str
    message: str


@router.get("/logs", response_model=List[LogInfoResponse])
async def list_logs():
    """
    Get list of available detection log files.
    
    Returns:
        List of log file information
    """
    try:
        logs = detection_log_service.get_available_logs()
        return logs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing logs: {str(e)}")


@router.get("/logs/{log_filename}/summary", response_model=LogSummaryResponse)
async def get_log_summary(log_filename: str):
    """
    Get summary information from a log file.
    
    Args:
        log_filename: Name of the log file
        
    Returns:
        Log summary with video info, statistics, etc.
    """
    try:
        summary = detection_log_service.get_log_summary(log_filename)
        if not summary:
            raise HTTPException(status_code=404, detail=f"Log file {log_filename} not found")
        return summary
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting log summary: {str(e)}")


@router.get("/logs/{log_filename}/frame/{frame_number}", response_model=FrameDetectionResponse)
async def get_frame_detection(
    log_filename: str,
    frame_number: int
):
    """
    Get detection data for a specific frame.
    
    Args:
        log_filename: Name of the log file
        frame_number: Frame number to get
        
    Returns:
        Frame detection data
    """
    try:
        frame_data = detection_log_service.get_frame_detections(log_filename, frame_number)
        if not frame_data:
            raise HTTPException(
                status_code=404,
                detail=f"Frame {frame_number} not found in log {log_filename}"
            )
        return frame_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting frame detection: {str(e)}")


@router.get("/logs/{log_filename}/range", response_model=List[FrameDetectionResponse])
async def get_detections_range(
    log_filename: str,
    start_frame: int = Query(0, ge=0, description="Starting frame number"),
    end_frame: Optional[int] = Query(None, description="Ending frame number"),
    limit: int = Query(1000, ge=1, le=10000, description="Maximum number of frames to return")
):
    """
    Get detection data for a range of frames.
    
    Args:
        log_filename: Name of the log file
        start_frame: Starting frame number
        end_frame: Ending frame number (None for all)
        limit: Maximum number of frames to return
        
    Returns:
        List of frame detection data
    """
    try:
        detections = detection_log_service.get_detections_by_time_range(
            log_filename,
            start_frame,
            end_frame,
            limit
        )
        return detections
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting detections range: {str(e)}")


@router.post("/logs/replay/start", response_model=ReplayResponse)
async def start_replay(request: ReplayRequest):
    """
    Start replaying a detection log.
    
    Args:
        request: Replay configuration
        
    Returns:
        Replay session information
    """
    try:
        session_id = await log_replay_service.start_replay(
            log_filename=request.log_filename,
            camera_id=request.camera_id,
            speed_multiplier=request.speed_multiplier,
            start_frame=request.start_frame,
            end_frame=request.end_frame
        )
        
        return ReplayResponse(
            session_id=session_id,
            status="running",
            message=f"Replay started for {request.log_filename}"
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting replay: {str(e)}")


@router.post("/logs/replay/{session_id}/stop", response_model=ReplayResponse)
async def stop_replay(session_id: str):
    """
    Stop an active replay.
    
    Args:
        session_id: Replay session ID
        
    Returns:
        Replay status
    """
    try:
        stopped = await log_replay_service.stop_replay(session_id)
        if not stopped:
            raise HTTPException(status_code=404, detail=f"Replay session {session_id} not found")
        
        return ReplayResponse(
            session_id=session_id,
            status="stopped",
            message="Replay stopped"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error stopping replay: {str(e)}")


@router.get("/logs/replay/active")
async def get_active_replays():
    """
    Get list of active replays.
    
    Returns:
        Dictionary of active replay sessions
    """
    try:
        replays = log_replay_service.get_active_replays()
        return {"active_replays": replays}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting active replays: {str(e)}")
