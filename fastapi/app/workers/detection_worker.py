"""
Detection Processing Worker for Celery.

This worker handles:
- AI detection result processing
- Violation creation from detections
- Detection review notifications

Requirements: 5.1, 5.2
"""

import logging
from typing import Dict, Any, List

from celery import Task
from sqlalchemy.orm import Session

from app.core.celery_config import celery_app
from app.core.database import SessionLocal
from app.models.ai_detection import AIDetection, DetectionType, ReviewStatus
from app.models.violation import Violation

logger = logging.getLogger(__name__)


class DatabaseTask(Task):
    _db: Session = None
    
    @property
    def db(self) -> Session:
        """Get or create database session."""
        if self._db is None:
            self._db = SessionLocal()
        return self._db
    
    def after_return(self, *args, **kwargs):
        """Close database session after task completion."""
        if self._db is not None:
            self._db.close()
            self._db = None


@celery_app.task(
    bind=True,
    base=DatabaseTask,
    name="app.workers.detection_worker.process_detection_task",
    max_retries=3,
    default_retry_delay=30
)
def process_detection_task(self, detection_id: int) -> Dict[str, Any]:
    db = self.db
    
    try:
        logger.info(f"Processing detection {detection_id}")
        
        # Get detection
        detection = db.query(AIDetection).filter(AIDetection.id == detection_id).first()
        if not detection:
            error_msg = f"Detection {detection_id} not found"
            logger.error(error_msg)
            return {
                'success': False,
                'detection_id': detection_id,
                'error': error_msg
            }
        
        # Check if detection is a violation with high confidence
        if (detection.detection_type == DetectionType.VIOLATION and 
            detection.confidence_score >= 0.85 and
            not detection.violation_id):
            
            logger.info(f"Creating violation for high-confidence detection {detection_id}")
            
            # Create violation record
            violation = create_violation_from_detection(db, detection)
            
            if violation:
                detection.violation_id = violation.id
                detection.reviewed = True
                detection.review_status = ReviewStatus.APPROVED
                db.commit()
                
                logger.info(f"Created violation {violation.id} from detection {detection_id}")
                
                return {
                    'success': True,
                    'detection_id': detection_id,
                    'violation_id': violation.id,
                    'action': 'violation_created'
                }
        
        logger.info(f"Detection {detection_id} processed (no action needed)")
        
        return {
            'success': True,
            'detection_id': detection_id,
            'action': 'no_action'
        }
        
    except Exception as e:
        error_msg = f"Error processing detection: {str(e)}"
        logger.error(error_msg, exc_info=True)
        
        # Retry the task
        raise self.retry(exc=e)


@celery_app.task(
    bind=True,
    base=DatabaseTask,
    name="app.workers.detection_worker.batch_process_detections_task"
)
def batch_process_detections_task(
    self,
    video_id: int,
    min_confidence: float = 0.85
) -> Dict[str, Any]:
    db = self.db
    
    try:
        logger.info(f"Batch processing detections for video {video_id}")
        
        # Get all high-confidence violation detections for the video
        detections = db.query(AIDetection).filter(
            AIDetection.video_id == video_id,
            AIDetection.detection_type == DetectionType.VIOLATION,
            AIDetection.confidence_score >= min_confidence,
            AIDetection.violation_id.is_(None),
            AIDetection.reviewed == False
        ).all()
        
        if not detections:
            logger.info(f"No detections to process for video {video_id}")
            return {
                'success': True,
                'video_id': video_id,
                'processed': 0,
                'message': 'No detections to process'
            }
        
        # Process each detection
        violations_created = 0
        for detection in detections:
            try:
                violation = create_violation_from_detection(db, detection)
                if violation:
                    detection.violation_id = violation.id
                    detection.reviewed = True
                    detection.review_status = ReviewStatus.APPROVED
                    violations_created += 1
            except Exception as e:
                logger.error(f"Error processing detection {detection.id}: {e}")
        
        db.commit()
        
        logger.info(f"Batch processed {len(detections)} detections, created {violations_created} violations")
        
        return {
            'success': True,
            'video_id': video_id,
            'processed': len(detections),
            'violations_created': violations_created
        }
        
    except Exception as e:
        error_msg = f"Error batch processing detections: {str(e)}"
        logger.error(error_msg, exc_info=True)
        db.rollback()
        return {
            'success': False,
            'video_id': video_id,
            'error': error_msg
        }


def create_violation_from_detection(db: Session, detection: AIDetection) -> Violation:
    try:
        # Extract violation data from detection
        detection_data = detection.detection_data or {}
        
        # Get violation type from detection data
        violation_type = detection_data.get('violation_type', 'unknown')
        license_plate = detection_data.get('license_plate', 'UNKNOWN')
        vehicle_type = detection_data.get('vehicle_type', 'car')
        description = detection_data.get('description', f'AI detected {violation_type}')
        
        # Create violation record
        violation = Violation(
            license_plate=license_plate,
            violation_type=violation_type,
            description=description,
            status='ai_detected',
            confidence_score=detection.confidence_score,
            detected_at=detection.detected_at,
            video_id=detection.video_id,
            frame_timestamp=detection.frame_timestamp,
            metadata={
                'detection_id': detection.id,
                'vehicle_type': vehicle_type,
                'ai_generated': True,
                'bbox': detection_data.get('bbox')
            }
        )
        
        db.add(violation)
        db.flush()  # Get the violation ID without committing
        
        logger.info(f"Created violation {violation.id} from detection {detection.id}")
        
        return violation
        
    except Exception as e:
        logger.error(f"Error creating violation from detection: {e}")
        return None


@celery_app.task(
    bind=True,
    base=DatabaseTask,
    name="app.workers.detection_worker.send_detection_notification_task"
)
def send_detection_notification_task(
    self,
    detection_id: int,
    notification_type: str = "new_violation"
) -> Dict[str, Any]:
    db = self.db
    
    try:
        logger.info(f"Sending {notification_type} notification for detection {detection_id}")
        
        # Get detection
        detection = db.query(AIDetection).filter(AIDetection.id == detection_id).first()
        if not detection:
            error_msg = f"Detection {detection_id} not found"
            logger.error(error_msg)
            return {
                'success': False,
                'detection_id': detection_id,
                'error': error_msg
            }
        
        # TODO: Implement actual notification logic
        # This could be:
        # - Email notification
        # - WebSocket notification
        # - Push notification
        # - SMS notification
        
        logger.info(f"Notification sent for detection {detection_id}")
        
        return {
            'success': True,
            'detection_id': detection_id,
            'notification_type': notification_type,
            'message': 'Notification sent (placeholder)'
        }
        
    except Exception as e:
        error_msg = f"Error sending notification: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return {
            'success': False,
            'detection_id': detection_id,
            'error': error_msg
        }
