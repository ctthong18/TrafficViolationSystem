"""Add performance optimization indexes

Revision ID: 002_performance_indexes
Revises: 001_ai_camera_system
Create Date: 2025-11-19

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002_performance_indexes'
down_revision = '001_ai_camera_system'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Add performance optimization indexes for frequently queried columns
    """
    
    # CameraVideo table indexes
    # Index for uploaded_at (used in date range queries and ordering)
    op.create_index(
        'ix_camera_videos_uploaded_at',
        'camera_videos',
        ['uploaded_at'],
        unique=False
    )
    
    # Composite index for camera_id + uploaded_at (common query pattern)
    op.create_index(
        'ix_camera_videos_camera_uploaded',
        'camera_videos',
        ['camera_id', 'uploaded_at'],
        unique=False
    )
    
    # Composite index for camera_id + has_violations (filtering videos with violations)
    op.create_index(
        'ix_camera_videos_camera_violations',
        'camera_videos',
        ['camera_id', 'has_violations'],
        unique=False
    )
    
    # Composite index for processing_status + uploaded_at (monitoring processing)
    op.create_index(
        'ix_camera_videos_status_uploaded',
        'camera_videos',
        ['processing_status', 'uploaded_at'],
        unique=False
    )
    
    # AIDetection table indexes
    # Composite index for video_id + detection_type (common filter)
    op.create_index(
        'ix_ai_detections_video_type',
        'ai_detections',
        ['video_id', 'detection_type'],
        unique=False
    )
    
    # Composite index for reviewed + review_status (pending detections query)
    op.create_index(
        'ix_ai_detections_reviewed_status',
        'ai_detections',
        ['reviewed', 'review_status'],
        unique=False
    )
    
    # Composite index for detection_type + confidence_score (filtering by confidence)
    op.create_index(
        'ix_ai_detections_type_confidence',
        'ai_detections',
        ['detection_type', 'confidence_score'],
        unique=False
    )
    
    # Composite index for detected_at + review_status (time-based filtering)
    op.create_index(
        'ix_ai_detections_detected_status',
        'ai_detections',
        ['detected_at', 'review_status'],
        unique=False
    )
    
    # VideoProcessingJob table indexes
    # Composite index for video_id + status (checking job status for video)
    op.create_index(
        'ix_video_jobs_video_status',
        'video_processing_jobs',
        ['video_id', 'status'],
        unique=False
    )
    
    # Composite index for status + job_type (monitoring specific job types)
    op.create_index(
        'ix_video_jobs_status_type',
        'video_processing_jobs',
        ['status', 'job_type'],
        unique=False
    )
    
    # Index for created_at (job queue ordering)
    op.create_index(
        'ix_video_jobs_created_at',
        'video_processing_jobs',
        ['created_at'],
        unique=False
    )


def downgrade() -> None:
    """
    Remove performance optimization indexes
    """
    
    # Drop VideoProcessingJob indexes
    op.drop_index('ix_video_jobs_created_at', table_name='video_processing_jobs')
    op.drop_index('ix_video_jobs_status_type', table_name='video_processing_jobs')
    op.drop_index('ix_video_jobs_video_status', table_name='video_processing_jobs')
    
    # Drop AIDetection indexes
    op.drop_index('ix_ai_detections_detected_status', table_name='ai_detections')
    op.drop_index('ix_ai_detections_type_confidence', table_name='ai_detections')
    op.drop_index('ix_ai_detections_reviewed_status', table_name='ai_detections')
    op.drop_index('ix_ai_detections_video_type', table_name='ai_detections')
    
    # Drop CameraVideo indexes
    op.drop_index('ix_camera_videos_status_uploaded', table_name='camera_videos')
    op.drop_index('ix_camera_videos_camera_violations', table_name='camera_videos')
    op.drop_index('ix_camera_videos_camera_uploaded', table_name='camera_videos')
    op.drop_index('ix_camera_videos_uploaded_at', table_name='camera_videos')
