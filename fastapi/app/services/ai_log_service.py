from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from fastapi import HTTPException
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from app.models.ai_log import AILog
from app.models.camera import Camera
from app.schemas.ai_log_schema import (
    AILogCreate, AILogUpdate, AILogResponse, 
    AILogFilter, AILogStats
)

class AILogService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_ai_log(self, ai_log_data: AILogCreate) -> AILog:
        """Tạo AI log mới"""
        # Kiểm tra camera tồn tại
        camera = self.db.query(Camera).filter(Camera.id == ai_log_data.camera_id).first()
        if not camera:
            raise HTTPException(status_code=404, detail="Camera not found")
        
        # Tạo AI log
        ai_log = AILog(
            camera_id=ai_log_data.camera_id,
            video_path=ai_log_data.video_path,
            frame_number=ai_log_data.frame_number,
            timestamp=ai_log_data.timestamp or datetime.utcnow(),
            detection_type=ai_log_data.detection_type,
            confidence_score=ai_log_data.confidence_score,
            bbox_x=ai_log_data.bbox_x,
            bbox_y=ai_log_data.bbox_y,
            bbox_width=ai_log_data.bbox_width,
            bbox_height=ai_log_data.bbox_height,
            detection_data=ai_log_data.detection_data,
            license_plate=ai_log_data.license_plate,
            vehicle_type=ai_log_data.vehicle_type,
            violation_type=ai_log_data.violation_type,
            model_version=ai_log_data.model_version,
            processing_time=ai_log_data.processing_time,
            is_violation=bool(ai_log_data.violation_type)  # Auto-detect violation
        )
        
        self.db.add(ai_log)
        self.db.commit()
        self.db.refresh(ai_log)
        
        return ai_log
    
    def get_ai_log(self, log_id: int) -> Optional[AILog]:
        """Lấy AI log theo ID"""
        return self.db.query(AILog).filter(AILog.id == log_id).first()
    
    def update_ai_log(self, log_id: int, update_data: AILogUpdate) -> Optional[AILog]:
        """Cập nhật AI log"""
        ai_log = self.get_ai_log(log_id)
        if not ai_log:
            return None
        
        # Cập nhật các field
        for field, value in update_data.dict(exclude_unset=True).items():
            setattr(ai_log, field, value)
        
        self.db.commit()
        self.db.refresh(ai_log)
        
        return ai_log
    
    def delete_ai_log(self, log_id: int) -> bool:
        """Xóa AI log"""
        ai_log = self.get_ai_log(log_id)
        if not ai_log:
            return False
        
        self.db.delete(ai_log)
        self.db.commit()
        
        return True
    
    def get_ai_logs(
        self, 
        filters: AILogFilter,
        skip: int = 0,
        limit: int = 100,
        order_by: str = "timestamp",
        order_desc: bool = True
    ) -> List[AILog]:
        """Lấy danh sách AI logs với filter"""
        query = self.db.query(AILog)
        
        # Apply filters
        if filters.camera_id:
            query = query.filter(AILog.camera_id == filters.camera_id)
        
        if filters.detection_type:
            query = query.filter(AILog.detection_type == filters.detection_type)
        
        if filters.is_processed is not None:
            query = query.filter(AILog.is_processed == filters.is_processed)
        
        if filters.is_violation is not None:
            query = query.filter(AILog.is_violation == filters.is_violation)
        
        if filters.license_plate:
            query = query.filter(AILog.license_plate.ilike(f"%{filters.license_plate}%"))
        
        if filters.vehicle_type:
            query = query.filter(AILog.vehicle_type == filters.vehicle_type)
        
        if filters.violation_type:
            query = query.filter(AILog.violation_type == filters.violation_type)
        
        if filters.start_date:
            query = query.filter(AILog.timestamp >= filters.start_date)
        
        if filters.end_date:
            query = query.filter(AILog.timestamp <= filters.end_date)
        
        if filters.min_confidence:
            query = query.filter(AILog.confidence_score >= filters.min_confidence)
        
        # Apply ordering
        if hasattr(AILog, order_by):
            order_column = getattr(AILog, order_by)
            if order_desc:
                query = query.order_by(desc(order_column))
            else:
                query = query.order_by(order_column)
        
        return query.offset(skip).limit(limit).all()
    
    def get_ai_logs_by_camera(
        self, 
        camera_id: int, 
        hours: int = 24,
        detection_type: Optional[str] = None
    ) -> List[AILog]:
        """Lấy AI logs của camera trong khoảng thời gian"""
        start_time = datetime.utcnow() - timedelta(hours=hours)
        
        query = self.db.query(AILog).filter(
            and_(
                AILog.camera_id == camera_id,
                AILog.timestamp >= start_time
            )
        )
        
        if detection_type:
            query = query.filter(AILog.detection_type == detection_type)
        
        return query.order_by(desc(AILog.timestamp)).all()
    
    def get_violation_logs(
        self,
        camera_id: Optional[int] = None,
        hours: int = 24
    ) -> List[AILog]:
        """Lấy các logs có vi phạm"""
        start_time = datetime.utcnow() - timedelta(hours=hours)
        
        query = self.db.query(AILog).filter(
            and_(
                AILog.is_violation == True,
                AILog.timestamp >= start_time
            )
        )
        
        if camera_id:
            query = query.filter(AILog.camera_id == camera_id)
        
        return query.order_by(desc(AILog.timestamp)).all()
    
    def get_ai_log_stats(
        self,
        camera_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> AILogStats:
        """Lấy thống kê AI logs"""
        query = self.db.query(AILog)
        
        if camera_id:
            query = query.filter(AILog.camera_id == camera_id)
        
        if start_date:
            query = query.filter(AILog.timestamp >= start_date)
        
        if end_date:
            query = query.filter(AILog.timestamp <= end_date)
        
        # Basic counts
        total_logs = query.count()
        processed_logs = query.filter(AILog.is_processed == True).count()
        violation_logs = query.filter(AILog.is_violation == True).count()
        
        # Detection types distribution
        detection_types = {}
        for detection_type, count in query.with_entities(
            AILog.detection_type, func.count(AILog.id)
        ).group_by(AILog.detection_type).all():
            detection_types[detection_type] = count
        
        # Vehicle types distribution
        vehicle_types = {}
        for vehicle_type, count in query.filter(
            AILog.vehicle_type.isnot(None)
        ).with_entities(
            AILog.vehicle_type, func.count(AILog.id)
        ).group_by(AILog.vehicle_type).all():
            vehicle_types[vehicle_type] = count
        
        # Violation types distribution
        violation_types = {}
        for violation_type, count in query.filter(
            AILog.violation_type.isnot(None)
        ).with_entities(
            AILog.violation_type, func.count(AILog.id)
        ).group_by(AILog.violation_type).all():
            violation_types[violation_type] = count
        
        # Average confidence and processing time
        avg_confidence = query.with_entities(
            func.avg(AILog.confidence_score)
        ).filter(AILog.confidence_score.isnot(None)).scalar()
        
        avg_processing_time = query.with_entities(
            func.avg(AILog.processing_time)
        ).filter(AILog.processing_time.isnot(None)).scalar()
        
        return AILogStats(
            total_logs=total_logs,
            processed_logs=processed_logs,
            violation_logs=violation_logs,
            detection_types=detection_types,
            vehicle_types=vehicle_types,
            violation_types=violation_types,
            avg_confidence=float(avg_confidence) if avg_confidence else None,
            avg_processing_time=float(avg_processing_time) if avg_processing_time else None
        )
    
    def bulk_create_ai_logs(self, ai_logs_data: List[AILogCreate]) -> List[AILog]:
        """Tạo nhiều AI logs cùng lúc"""
        ai_logs = []
        
        for log_data in ai_logs_data:
            ai_log = AILog(
                camera_id=log_data.camera_id,
                video_path=log_data.video_path,
                frame_number=log_data.frame_number,
                timestamp=log_data.timestamp or datetime.utcnow(),
                detection_type=log_data.detection_type,
                confidence_score=log_data.confidence_score,
                bbox_x=log_data.bbox_x,
                bbox_y=log_data.bbox_y,
                bbox_width=log_data.bbox_width,
                bbox_height=log_data.bbox_height,
                detection_data=log_data.detection_data,
                license_plate=log_data.license_plate,
                vehicle_type=log_data.vehicle_type,
                violation_type=log_data.violation_type,
                model_version=log_data.model_version,
                processing_time=log_data.processing_time,
                is_violation=bool(log_data.violation_type)
            )
            ai_logs.append(ai_log)
        
        self.db.add_all(ai_logs)
        self.db.commit()
        
        for ai_log in ai_logs:
            self.db.refresh(ai_log)
        
        return ai_logs
    
    def mark_as_processed(self, log_ids: List[int]) -> int:
        """Đánh dấu các logs đã được xử lý"""
        updated_count = self.db.query(AILog).filter(
            AILog.id.in_(log_ids)
        ).update(
            {"is_processed": True},
            synchronize_session=False
        )
        
        self.db.commit()
        return updated_count