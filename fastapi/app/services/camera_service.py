from datetime import datetime
from typing import List, Optional, Tuple

from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from fastapi import HTTPException, status

from app.models.camera import Camera
from app.models.violation import Violation
from app.schemas.camera_schema import CameraCreate, CameraUpdate, CameraResponse


class CameraService:
    def __init__(self, db: Session):
        self.db = db

    def _to_response(self, camera: Camera) -> CameraResponse:
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        violations_today = (
            self.db.query(func.count(Violation.id))
            .filter(Violation.camera_id == camera.camera_id)
            .filter(Violation.detected_at >= today_start)
            .scalar()
        )
        last_violation_at = (
            self.db.query(func.max(Violation.detected_at))
            .filter(Violation.camera_id == camera.camera_id)
            .scalar()
        )
        return CameraResponse(
            id=camera.id,
            camera_id=camera.camera_id,
            name=camera.name,
            location_name=camera.location_name,
            latitude=float(camera.latitude) if camera.latitude is not None else None,
            longitude=float(camera.longitude) if camera.longitude is not None else None,
            address=camera.address,
            camera_type=camera.camera_type,
            resolution=camera.resolution,
            status=camera.status,
            enabled_detections=camera.enabled_detections,
            ai_model_version=camera.ai_model_version,
            confidence_threshold=float(camera.confidence_threshold) if camera.confidence_threshold is not None else None,
            last_maintenance=camera.last_maintenance,
            next_maintenance=camera.next_maintenance,
            violations_today=int(violations_today or 0),
            last_violation_at=last_violation_at,
            created_at=camera.created_at,
            updated_at=camera.updated_at,
        )

    def list_cameras(
        self,
        skip: int = 0,
        limit: int = 50,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[CameraResponse], int]:
        query = self.db.query(Camera)
        if status and status != "all":
            query = query.filter(Camera.status == status)
        if search:
            like = f"%{search}%"
            query = query.filter(
                or_(
                    Camera.camera_id.ilike(like),
                    Camera.name.ilike(like),
                    Camera.location_name.ilike(like),
                )
            )
        total = query.count()
        cameras = query.order_by(Camera.name.asc()).offset(skip).limit(limit).all()
        return [self._to_response(cam) for cam in cameras], total

    def get_camera(self, camera_id: str) -> CameraResponse:
        camera = self.db.query(Camera).filter(Camera.camera_id == camera_id).first()
        if not camera:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera not found")
        return self._to_response(camera)

    def create_camera(self, data: CameraCreate) -> CameraResponse:
        exists = self.db.query(Camera).filter(Camera.camera_id == data.camera_id).first()
        if exists:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Camera ID already exists")
        camera = Camera(**data.dict())
        self.db.add(camera)
        self.db.commit()
        self.db.refresh(camera)
        return self._to_response(camera)

    def update_camera(self, camera_id: str, data: CameraUpdate) -> CameraResponse:
        camera = self.db.query(Camera).filter(Camera.camera_id == camera_id).first()
        if not camera:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera not found")
        for field, value in data.dict(exclude_unset=True).items():
            setattr(camera, field, value)
        camera.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(camera)
        return self._to_response(camera)

    def delete_camera(self, camera_id: str) -> None:
        camera = self.db.query(Camera).filter(Camera.camera_id == camera_id).first()
        if not camera:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera not found")
        self.db.delete(camera)
        self.db.commit()


