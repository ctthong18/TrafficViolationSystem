"""
Realtime control endpoints
Expose minimal REST controls to start/stop/check realtime AI streams.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

# from app.services.realtime_detection_service import realtime_detection_service

router = APIRouter(prefix="/realtime", tags=["Realtime"])


class RealtimeStartRequest(BaseModel):
    source: str = Field(..., description="Camera URL hoặc đường dẫn video")
    camera_id: Optional[int] = Field(None, description="ID camera (dùng cho thống kê)")
    confidence_threshold: float = Field(0.25, ge=0.0, le=1.0)
    iou_threshold: float = Field(0.5, ge=0.0, le=1.0)
    target_fps: int = Field(4, ge=1, le=30)
    enable_tracking: bool = True


@router.post("/start")
async def start_realtime(request: RealtimeStartRequest):
    started = await realtime_detection_service.start_stream(
        source=request.source,
        camera_id=request.camera_id,
        confidence_threshold=request.confidence_threshold,
        iou_threshold=request.iou_threshold,
        target_fps=request.target_fps,
        enable_tracking=request.enable_tracking,
    )
    if not started:
        raise HTTPException(status_code=400, detail="Không khởi động được realtime stream")
    return {"success": True, "status": realtime_detection_service.get_status()}


@router.post("/stop/{camera_id}")
async def stop_realtime(camera_id: int):
    stopped = await realtime_detection_service.stop_stream(camera_id)
    if not stopped:
        raise HTTPException(status_code=404, detail="Luồng realtime không tồn tại")
    return {"success": True, "status": realtime_detection_service.get_status()}


@router.get("/status")
async def realtime_status():
    return {"success": True, "status": realtime_detection_service.get_status()}

