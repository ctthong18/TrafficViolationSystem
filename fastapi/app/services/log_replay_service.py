"""
Log Replay Service

Reads standardized detection logs and replays them via WebSocket
at the original FPS, simulating real-time AI detection.
"""

import asyncio
import json
import logging
import time
from typing import Dict, Any, Optional, Callable
from pathlib import Path
from datetime import datetime

from app.services.detection_log_service import detection_log_service
from app.services.detection_logger import detection_logger
from app.api.endpoints.stream import manager
from app.schemas.detection_result_schema import DetectionResult

logger = logging.getLogger(__name__)


class LogReplayService:
    """
    Service for replaying detection logs in real-time.
    
    Reads JSON logs and emits detection results via WebSocket
    at the original video FPS, simulating live AI detection.
    """
    
    def __init__(self):
        self.active_replays: Dict[str, asyncio.Task] = {}
        self._lock = asyncio.Lock()
    
    async def start_replay(
        self,
        log_filename: str,
        camera_id: Optional[int] = None,
        speed_multiplier: float = 1.0,
        start_frame: int = 0,
        end_frame: Optional[int] = None
    ) -> str:
        """
        Start replaying a detection log.
        
        Args:
            log_filename: Name of log file to replay
            camera_id: Optional camera ID (uses log's camera_id if not provided)
            speed_multiplier: Playback speed (1.0 = normal, 2.0 = 2x speed)
            start_frame: Starting frame number
            end_frame: Ending frame number (None for all)
            
        Returns:
            Replay session ID
        """
        async with self._lock:
            # Load log data
            log_data = detection_log_service.load_detection_log(log_filename)
            if not log_data:
                raise ValueError(f"Log file {log_filename} not found or invalid")
            
            # Generate session ID
            session_id = f"replay_{int(time.time())}_{log_filename}"
            
            # Check if already replaying
            if session_id in self.active_replays:
                logger.warning(f"Replay {session_id} already active")
                return session_id
            
            # Start replay task
            task = asyncio.create_task(
                self._replay_log(
                    session_id,
                    log_data,
                    log_filename,
                    camera_id,
                    speed_multiplier,
                    start_frame,
                    end_frame
                )
            )
            
            self.active_replays[session_id] = task
            
            logger.info(f"Started replay: {session_id} from {log_filename}")
            return session_id
    
    async def stop_replay(self, session_id: str) -> bool:
        """
        Stop an active replay.
        
        Args:
            session_id: Replay session ID
            
        Returns:
            True if stopped, False if not found
        """
        async with self._lock:
            task = self.active_replays.pop(session_id, None)
            if not task:
                return False
            
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
            
            logger.info(f"Stopped replay: {session_id}")
            return True
    
    async def _replay_log(
        self,
        session_id: str,
        log_data: Dict[str, Any],
        log_filename: str,
        camera_id: Optional[int],
        speed_multiplier: float,
        start_frame: int,
        end_frame: Optional[int]
    ) -> None:
        """
        Main replay loop.
        
        Reads log entries and emits them via WebSocket at original FPS.
        """
        try:
            # Extract video info
            video_info = log_data.get("video_info", {})
            fps = video_info.get("fps", 30.0)
            width = video_info.get("width")
            height = video_info.get("height")
            
            # Adjust FPS for speed multiplier
            effective_fps = fps * speed_multiplier
            frame_interval = 1.0 / effective_fps if effective_fps > 0 else 0.033
            
            # Get detections
            detections = log_data.get("detections", [])
            
            # Filter by frame range
            filtered_detections = []
            for det in detections:
                frame_num = det.get("frame_number", 0)
                if frame_num < start_frame:
                    continue
                if end_frame is not None and frame_num > end_frame:
                    break
                filtered_detections.append(det)
            
            logger.info(
                f"Replaying {len(filtered_detections)} frames "
                f"at {effective_fps:.2f} FPS (session: {session_id})"
            )
            
            # Use camera_id from log if not provided
            if camera_id is None:
                camera_id = log_data.get("camera_id")
            
            # Replay each frame
            last_frame_time = time.time()
            
            for i, frame_data in enumerate(filtered_detections):
                # Check if cancelled
                if session_id not in self.active_replays:
                    break
                
                # Calculate delay based on frame interval
                current_time = time.time()
                elapsed = current_time - last_frame_time
                
                if elapsed < frame_interval:
                    await asyncio.sleep(frame_interval - elapsed)
                
                last_frame_time = time.time()
                
                # Convert to DetectionResult
                detection_result = DetectionResult(
                    frame_number=frame_data.get("frame_number", i),
                    timestamp=frame_data.get("timestamp", time.time()),
                    processing_time_ms=frame_data.get("processing_time_ms", 0),
                    vehicle_count=frame_data.get("vehicle_count", 0),
                    detections=frame_data.get("detections", []),
                    violations=frame_data.get("violations", []),
                    session_id=session_id,
                    camera_id=camera_id,
                    fps=fps,
                    width=width,
                    height=height
                )
                
                # Broadcast via WebSocket
                await manager.broadcast_detection_result(detection_result)
                
                # Log to database (reuse DetectionLogger)
                try:
                    analytics_payload = await asyncio.to_thread(
                        detection_logger.log_detection_result,
                        detection_result
                    )
                    
                    if analytics_payload:
                        await manager.broadcast_analytics_update(analytics_payload)
                except Exception as e:
                    logger.error(f"Error logging replay detection: {e}")
                
                # Log progress periodically
                if (i + 1) % 30 == 0:
                    logger.info(
                        f"Replay progress: {i + 1}/{len(filtered_detections)} frames "
                        f"(session: {session_id})"
                    )
            
            logger.info(f"Replay completed: {session_id}")
            
        except asyncio.CancelledError:
            logger.info(f"Replay cancelled: {session_id}")
        except Exception as e:
            logger.error(f"Error in replay {session_id}: {e}", exc_info=True)
        finally:
            # Clean up
            async with self._lock:
                self.active_replays.pop(session_id, None)
    
    def get_active_replays(self) -> Dict[str, Dict[str, Any]]:
        """Get information about active replays."""
        return {
            session_id: {
                "session_id": session_id,
                "status": "running"
            }
            for session_id in self.active_replays.keys()
        }
    
    async def stop_all_replays(self) -> None:
        """Stop all active replays."""
        async with self._lock:
            for session_id in list(self.active_replays.keys()):
                await self.stop_replay(session_id)


# Global instance
log_replay_service = LogReplayService()

