"""
Video Processing Service for managing video processing queue and background tasks.

This service handles:
- Queueing videos for processing
- Processing videos (upload + AI analysis)
- Updating processing status in database
- Retry logic for failed jobs

Requirements: 5.1, 5.2, 5.3, 5.4
"""

import logging
import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.CameraVideo import CameraVideo, ProcessingStatus
from app.models.video_processing_job import VideoProcessingJob, JobType, JobStatus
from app.services.cloudinary_service import cloudinary_service
from app.services.ai_detection_service import ai_detection_service
from app.services.notification_service import NotificationService

logger = logging.getLogger(__name__)


class VideoProcessingService:
    """Service for managing video processing queue and background tasks."""
    
    def __init__(self):
        """Initialize Video Processing Service."""
        self.max_retries = 3
        self.processing_timeout = 600  # 10 minutes
        self.ai_analysis_timeout = 300  # 5 minutes
        
    def queue_video_processing(
        self,
        db: Session,
        video_id: int,
        job_type: JobType = JobType.AI_ANALYSIS
    ) -> VideoProcessingJob:
        """
        Add video to processing queue.
        
        Creates a new processing job for the video if one doesn't already exist.
        
        Args:
            db: Database session
            video_id: ID of the video to process
            job_type: Type of processing job (AI_ANALYSIS, UPLOAD, THUMBNAIL)
        
        Returns:
            VideoProcessingJob: The created or existing job
        
        Raises:
            ValueError: If video not found
        
        Requirements: 5.1
        """
        try:
            # Verify video exists
            video = db.query(CameraVideo).filter(CameraVideo.id == video_id).first()
            if not video:
                raise ValueError(f"Video with ID {video_id} not found")
            
            # Check if there's already a pending or processing job for this video and type
            existing_job = db.query(VideoProcessingJob).filter(
                and_(
                    VideoProcessingJob.video_id == video_id,
                    VideoProcessingJob.job_type == job_type,
                    VideoProcessingJob.status.in_([JobStatus.PENDING, JobStatus.PROCESSING])
                )
            ).first()
            
            if existing_job:
                logger.info(f"Job already exists for video {video_id}, type {job_type.value}: {existing_job.id}")
                return existing_job
            
            # Create new job
            job = VideoProcessingJob(
                video_id=video_id,
                job_type=job_type,
                status=JobStatus.PENDING,
                retry_count=0
            )
            
            db.add(job)
            db.commit()
            db.refresh(job)
            
            logger.info(f"Created processing job {job.id} for video {video_id}, type {job_type.value}")
            
            # Update video status to pending if not already processing
            if video.processing_status == ProcessingStatus.FAILED:
                video.processing_status = ProcessingStatus.PENDING
                db.commit()
            
            return job
            
        except Exception as e:
            logger.error(f"Error queueing video processing: {e}")
            db.rollback()
            raise
    
    async def process_video(
        self,
        db: Session,
        job_id: int
    ) -> Dict[str, Any]:
        """
        Process video: perform AI analysis and update database.
        
        This method:
        1. Updates job status to PROCESSING
        2. Downloads video from Cloudinary (if needed)
        3. Runs AI analysis
        4. Saves detection results
        5. Updates job status to COMPLETED or FAILED
        
        Args:
            db: Database session
            job_id: ID of the processing job
        
        Returns:
            Dictionary containing:
            - success: bool
            - job_id: int
            - video_id: int
            - results: Analysis results (if successful)
            - error: Error message (if failed)
        
        Requirements: 5.2
        """
        job = None
        video = None
        
        try:
            # Get job
            job = db.query(VideoProcessingJob).filter(VideoProcessingJob.id == job_id).first()
            if not job:
                raise ValueError(f"Job with ID {job_id} not found")
            
            # Get video
            video = db.query(CameraVideo).filter(CameraVideo.id == job.video_id).first()
            if not video:
                raise ValueError(f"Video with ID {job.video_id} not found")
            
            # Update job status to processing
            self.update_processing_status(
                db=db,
                job_id=job_id,
                status=JobStatus.PROCESSING,
                started_at=datetime.utcnow()
            )
            
            # Update video status
            video.processing_status = ProcessingStatus.PROCESSING
            db.commit()
            
            logger.info(f"Starting video processing for job {job_id}, video {video.id}")
            
            # Process based on job type
            if job.job_type == JobType.AI_ANALYSIS:
                result = await self._process_ai_analysis(db, video, job)
            elif job.job_type == JobType.THUMBNAIL:
                result = await self._process_thumbnail(db, video, job)
            else:
                raise ValueError(f"Unsupported job type: {job.job_type.value}")
            
            # Update job status to completed
            self.update_processing_status(
                db=db,
                job_id=job_id,
                status=JobStatus.COMPLETED,
                completed_at=datetime.utcnow(),
                result_data=result
            )
            
            logger.info(f"Video processing completed for job {job_id}")
            
            # Send notification to uploader about successful completion
            try:
                notification_service = NotificationService(db)
                notification_service.notify_uploader_processing_complete(
                    video_id=video.id,
                    job_id=job_id,
                    success=True
                )
            except Exception as e:
                logger.error(f"Failed to send completion notification: {e}")
            
            return {
                'success': True,
                'job_id': job_id,
                'video_id': video.id,
                'results': result
            }
            
        except asyncio.TimeoutError:
            error_msg = f"Video processing timed out after {self.processing_timeout} seconds"
            logger.error(error_msg)
            
            if job:
                self._handle_job_failure(db, job, error_msg)
            
            # Send notification to uploader about failure
            if video:
                try:
                    notification_service = NotificationService(db)
                    notification_service.notify_uploader_processing_complete(
                        video_id=video.id,
                        job_id=job_id,
                        success=False,
                        error_message=error_msg
                    )
                except Exception as e:
                    logger.error(f"Failed to send failure notification: {e}")
            
            return {
                'success': False,
                'job_id': job_id,
                'video_id': video.id if video else None,
                'error': error_msg
            }
            
        except Exception as e:
            error_msg = f"Error processing video: {str(e)}"
            logger.error(error_msg)
            
            if job:
                self._handle_job_failure(db, job, error_msg)
            
            # Send notification to uploader about failure
            if video:
                try:
                    notification_service = NotificationService(db)
                    notification_service.notify_uploader_processing_complete(
                        video_id=video.id,
                        job_id=job_id,
                        success=False,
                        error_message=error_msg
                    )
                except Exception as e:
                    logger.error(f"Failed to send failure notification: {e}")
            
            return {
                'success': False,
                'job_id': job_id,
                'video_id': video.id if video else None,
                'error': error_msg
            }
    
    async def _process_ai_analysis(
        self,
        db: Session,
        video: CameraVideo,
        job: VideoProcessingJob
    ) -> Dict[str, Any]:
        """
        Process AI analysis for a video.
        
        Args:
            db: Database session
            video: CameraVideo record
            job: VideoProcessingJob record
        
        Returns:
            Analysis results
        """
        logger.info(f"Running AI analysis for video {video.id}")
        
        # Use Cloudinary URL for analysis
        video_url = video.cloudinary_url
        
        # Run AI analysis with timeout
        analysis_results = await ai_detection_service.analyze_video(
            video_path=video_url,
            timeout=self.ai_analysis_timeout
        )
        
        # Save detection results to database
        saved_counts = ai_detection_service.save_detection_results(
            db=db,
            video_id=video.id,
            analysis_results=analysis_results
        )
        
        logger.info(f"AI analysis completed for video {video.id}: {saved_counts}")
        
        return {
            'analysis_results': analysis_results,
            'saved_counts': saved_counts
        }
    
    async def _process_thumbnail(
        self,
        db: Session,
        video: CameraVideo,
        job: VideoProcessingJob
    ) -> Dict[str, Any]:
        """
        Generate thumbnail for a video.
        
        Args:
            db: Database session
            video: CameraVideo record
            job: VideoProcessingJob record
        
        Returns:
            Thumbnail generation results
        """
        logger.info(f"Generating thumbnail for video {video.id}")
        
        # Generate thumbnail at 0 seconds
        thumbnail_url = cloudinary_service.generate_thumbnail(
            public_id=video.cloudinary_public_id,
            timestamp=0.0
        )
        
        # Update video record
        video.thumbnail_url = thumbnail_url
        db.commit()
        
        logger.info(f"Thumbnail generated for video {video.id}: {thumbnail_url}")
        
        return {
            'thumbnail_url': thumbnail_url
        }
    
    def _handle_job_failure(
        self,
        db: Session,
        job: VideoProcessingJob,
        error_message: str
    ):
        """
        Handle job failure with retry logic.
        
        Args:
            db: Database session
            job: VideoProcessingJob record
            error_message: Error message
        
        Requirements: 5.4
        """
        try:
            job.retry_count += 1
            
            if job.retry_count < self.max_retries:
                # Retry: set status back to pending
                logger.info(f"Job {job.id} failed, retry {job.retry_count}/{self.max_retries}")
                job.status = JobStatus.PENDING
                job.error_message = f"Retry {job.retry_count}: {error_message}"
            else:
                # Max retries reached: mark as failed
                logger.error(f"Job {job.id} failed after {self.max_retries} retries")
                job.status = JobStatus.FAILED
                job.error_message = f"Failed after {self.max_retries} retries: {error_message}"
                job.completed_at = datetime.utcnow()
                
                # Update video status
                video = db.query(CameraVideo).filter(CameraVideo.id == job.video_id).first()
                if video:
                    video.processing_status = ProcessingStatus.FAILED
            
            db.commit()
            
        except Exception as e:
            logger.error(f"Error handling job failure: {e}")
            db.rollback()
    
    def update_processing_status(
        self,
        db: Session,
        job_id: int,
        status: JobStatus,
        started_at: Optional[datetime] = None,
        completed_at: Optional[datetime] = None,
        error_message: Optional[str] = None,
        result_data: Optional[Dict[str, Any]] = None
    ) -> VideoProcessingJob:
        """
        Update processing status in database.
        
        Args:
            db: Database session
            job_id: ID of the processing job
            status: New job status
            started_at: Optional start timestamp
            completed_at: Optional completion timestamp
            error_message: Optional error message
            result_data: Optional result data
        
        Returns:
            Updated VideoProcessingJob
        
        Requirements: 5.3
        """
        try:
            job = db.query(VideoProcessingJob).filter(VideoProcessingJob.id == job_id).first()
            if not job:
                raise ValueError(f"Job with ID {job_id} not found")
            
            # Update status
            job.status = status
            
            # Update timestamps
            if started_at:
                job.started_at = started_at
            if completed_at:
                job.completed_at = completed_at
            
            # Update error message
            if error_message:
                job.error_message = error_message
            
            # Update result data
            if result_data:
                job.result_data = result_data
            
            db.commit()
            db.refresh(job)
            
            logger.info(f"Updated job {job_id} status to {status.value}")
            
            return job
            
        except Exception as e:
            logger.error(f"Error updating processing status: {e}")
            db.rollback()
            raise
    
    def get_pending_jobs(
        self,
        db: Session,
        job_type: Optional[JobType] = None,
        limit: int = 10
    ) -> List[VideoProcessingJob]:
        """
        Get pending jobs from the queue.
        
        Args:
            db: Database session
            job_type: Optional filter by job type
            limit: Maximum number of jobs to return
        
        Returns:
            List of pending VideoProcessingJob records
        """
        query = db.query(VideoProcessingJob).filter(
            VideoProcessingJob.status == JobStatus.PENDING
        )
        
        if job_type:
            query = query.filter(VideoProcessingJob.job_type == job_type)
        
        # Order by created_at (oldest first)
        query = query.order_by(VideoProcessingJob.created_at)
        
        jobs = query.limit(limit).all()
        
        logger.info(f"Found {len(jobs)} pending jobs")
        
        return jobs
    
    def retry_failed_jobs(
        self,
        db: Session,
        max_age_hours: int = 24
    ) -> List[VideoProcessingJob]:
        """
        Retry failed jobs that haven't exceeded max retries.
        
        Args:
            db: Database session
            max_age_hours: Only retry jobs failed within this many hours
        
        Returns:
            List of jobs that were reset to pending
        
        Requirements: 5.4
        """
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=max_age_hours)
            
            # Find failed jobs that can be retried
            failed_jobs = db.query(VideoProcessingJob).filter(
                and_(
                    VideoProcessingJob.status == JobStatus.FAILED,
                    VideoProcessingJob.retry_count < self.max_retries,
                    VideoProcessingJob.updated_at >= cutoff_time
                )
            ).all()
            
            retried_jobs = []
            
            for job in failed_jobs:
                logger.info(f"Retrying failed job {job.id}")
                job.status = JobStatus.PENDING
                job.error_message = None
                retried_jobs.append(job)
            
            db.commit()
            
            logger.info(f"Reset {len(retried_jobs)} failed jobs to pending")
            
            return retried_jobs
            
        except Exception as e:
            logger.error(f"Error retrying failed jobs: {e}")
            db.rollback()
            raise
    
    def get_job_status(
        self,
        db: Session,
        job_id: int
    ) -> Dict[str, Any]:
        """
        Get status of a processing job.
        
        Args:
            db: Database session
            job_id: ID of the processing job
        
        Returns:
            Dictionary with job status information
        """
        job = db.query(VideoProcessingJob).filter(VideoProcessingJob.id == job_id).first()
        if not job:
            raise ValueError(f"Job with ID {job_id} not found")
        
        return {
            'job_id': job.id,
            'video_id': job.video_id,
            'job_type': job.job_type.value,
            'status': job.status.value,
            'retry_count': job.retry_count,
            'created_at': job.created_at.isoformat() if job.created_at else None,
            'started_at': job.started_at.isoformat() if job.started_at else None,
            'completed_at': job.completed_at.isoformat() if job.completed_at else None,
            'error_message': job.error_message,
            'result_data': job.result_data
        }
    
    def cancel_job(
        self,
        db: Session,
        job_id: int
    ) -> bool:
        """
        Cancel a pending or processing job.
        
        Args:
            db: Database session
            job_id: ID of the processing job
        
        Returns:
            True if job was cancelled, False otherwise
        """
        try:
            job = db.query(VideoProcessingJob).filter(VideoProcessingJob.id == job_id).first()
            if not job:
                raise ValueError(f"Job with ID {job_id} not found")
            
            if job.status in [JobStatus.PENDING, JobStatus.PROCESSING]:
                job.status = JobStatus.FAILED
                job.error_message = "Job cancelled by user"
                job.completed_at = datetime.utcnow()
                
                db.commit()
                
                logger.info(f"Cancelled job {job_id}")
                return True
            else:
                logger.warning(f"Cannot cancel job {job_id} with status {job.status.value}")
                return False
                
        except Exception as e:
            logger.error(f"Error cancelling job: {e}")
            db.rollback()
            raise


# Global instance
video_processing_service = VideoProcessingService()