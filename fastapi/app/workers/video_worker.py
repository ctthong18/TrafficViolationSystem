"""
Video Processing Worker for Celery.

This worker handles:
- Video processing tasks (AI analysis, thumbnail generation)
- Retry logic for failed jobs
- Periodic cleanup of old jobs

Requirements: 5.1, 5.2, 5.4
"""

import logging
import asyncio
from typing import Dict, Any
from datetime import datetime, timedelta

from celery import Task
from sqlalchemy.orm import Session

from app.core.celery_config import celery_app
from app.core.database import SessionLocal
from app.services.video_processing_service import video_processing_service
from app.models.video_processing_job import VideoProcessingJob, JobStatus

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
        if self._db is not None:
            self._db.close()
            self._db = None


@celery_app.task(
    bind=True,
    base=DatabaseTask,
    name="app.workers.video_worker.process_video_task",
    max_retries=3,
    default_retry_delay=60,  # Retry after 60 seconds
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=600,  # Max 10 minutes between retries
    retry_jitter=True
)
def process_video_task(self, job_id: int) -> Dict[str, Any]:
    db = self.db
    
    try:
        logger.info(f"Starting video processing task for job {job_id}")
        
        # Verify job exists
        job = db.query(VideoProcessingJob).filter(VideoProcessingJob.id == job_id).first()
        if not job:
            error_msg = f"Job {job_id} not found"
            logger.error(error_msg)
            return {
                'success': False,
                'job_id': job_id,
                'error': error_msg
            }
        
        # Check if job is already completed or processing
        if job.status == JobStatus.COMPLETED:
            logger.info(f"Job {job_id} already completed")
            return {
                'success': True,
                'job_id': job_id,
                'message': 'Job already completed',
                'results': job.result_data
            }
        
        if job.status == JobStatus.PROCESSING:
            logger.warning(f"Job {job_id} is already being processed")
            return {
                'success': False,
                'job_id': job_id,
                'error': 'Job is already being processed'
            }
        
        # Process the video using async service
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(
                video_processing_service.process_video(db, job_id)
            )
        finally:
            loop.close()
        
        if result['success']:
            logger.info(f"Video processing completed successfully for job {job_id}")
        else:
            logger.error(f"Video processing failed for job {job_id}: {result.get('error')}")
        
        return result
        
    except Exception as e:
        error_msg = f"Error in video processing task: {str(e)}"
        logger.error(error_msg, exc_info=True)
        
        # Update job status to failed
        try:
            job = db.query(VideoProcessingJob).filter(VideoProcessingJob.id == job_id).first()
            if job:
                job.retry_count += 1
                if job.retry_count >= 3:
                    job.status = JobStatus.FAILED
                    job.error_message = error_msg
                    job.completed_at = datetime.utcnow()
                db.commit()
        except Exception as db_error:
            logger.error(f"Error updating job status: {db_error}")
            db.rollback()
        
        # Retry the task
        raise self.retry(exc=e)


@celery_app.task(
    bind=True,
    base=DatabaseTask,
    name="app.workers.video_worker.process_pending_jobs_task"
)
def process_pending_jobs_task(self, limit: int = 10) -> Dict[str, Any]:
    db = self.db
    
    try:
        logger.info(f"Processing pending jobs (limit: {limit})")
        
        # Get pending jobs
        pending_jobs = video_processing_service.get_pending_jobs(
            db=db,
            limit=limit
        )
        
        if not pending_jobs:
            logger.info("No pending jobs found")
            return {
                'success': True,
                'processed': 0,
                'message': 'No pending jobs'
            }
        
        # Queue each job for processing
        queued_count = 0
        for job in pending_jobs:
            try:
                # Queue the job asynchronously
                process_video_task.apply_async(
                    args=[job.id],
                    queue='video_processing'
                )
                queued_count += 1
                logger.info(f"Queued job {job.id} for processing")
            except Exception as e:
                logger.error(f"Error queueing job {job.id}: {e}")
        
        logger.info(f"Queued {queued_count} jobs for processing")
        
        return {
            'success': True,
            'processed': queued_count,
            'total_pending': len(pending_jobs)
        }
        
    except Exception as e:
        error_msg = f"Error processing pending jobs: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return {
            'success': False,
            'error': error_msg
        }


@celery_app.task(
    bind=True,
    base=DatabaseTask,
    name="app.workers.video_worker.retry_failed_jobs_task"
)
def retry_failed_jobs_task(self, max_age_hours: int = 24) -> Dict[str, Any]:
    db = self.db
    
    try:
        logger.info(f"Retrying failed jobs (max age: {max_age_hours} hours)")
        
        # Retry failed jobs
        retried_jobs = video_processing_service.retry_failed_jobs(
            db=db,
            max_age_hours=max_age_hours
        )
        
        # Queue retried jobs for processing
        queued_count = 0
        for job in retried_jobs:
            try:
                process_video_task.apply_async(
                    args=[job.id],
                    queue='video_processing'
                )
                queued_count += 1
                logger.info(f"Queued failed job {job.id} for retry")
            except Exception as e:
                logger.error(f"Error queueing job {job.id} for retry: {e}")
        
        logger.info(f"Retried {queued_count} failed jobs")
        
        return {
            'success': True,
            'retried': queued_count,
            'total_failed': len(retried_jobs)
        }
        
    except Exception as e:
        error_msg = f"Error retrying failed jobs: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return {
            'success': False,
            'error': error_msg
        }


@celery_app.task(
    bind=True,
    base=DatabaseTask,
    name="app.workers.video_worker.cleanup_old_jobs_task"
)
def cleanup_old_jobs_task(self, days: int = 30) -> Dict[str, Any]:
    db = self.db
    
    try:
        logger.info(f"Cleaning up jobs older than {days} days")
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Delete old completed and failed jobs
        deleted_count = db.query(VideoProcessingJob).filter(
            VideoProcessingJob.status.in_([JobStatus.COMPLETED, JobStatus.FAILED]),
            VideoProcessingJob.updated_at < cutoff_date
        ).delete(synchronize_session=False)
        
        db.commit()
        
        logger.info(f"Cleaned up {deleted_count} old jobs")
        
        return {
            'success': True,
            'deleted': deleted_count
        }
        
    except Exception as e:
        error_msg = f"Error cleaning up old jobs: {str(e)}"
        logger.error(error_msg, exc_info=True)
        db.rollback()
        return {
            'success': False,
            'error': error_msg
        }
