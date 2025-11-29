"""Add AI Camera System models

Revision ID: 001_ai_camera_system
Revises: 
Create Date: 2025-11-18

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_ai_camera_system'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Update camera_videos table
    op.drop_column('camera_videos', 'drive_file_id')
    op.drop_column('camera_videos', 'file_name')
    op.drop_column('camera_videos', 'mime_type')
    op.drop_column('camera_videos', 'size_bytes')
    op.drop_column('camera_videos', 'duration_seconds')
    op.drop_column('camera_videos', 'resolution')
    op.drop_column('camera_videos', 'is_active_feed')
    op.drop_column('camera_videos', 'description')
    
    # Add new columns to camera_videos
    op.add_column('camera_videos', sa.Column('cloudinary_public_id', sa.String(length=255), nullable=False))
    op.add_column('camera_videos', sa.Column('cloudinary_url', sa.String(length=500), nullable=False))
    op.add_column('camera_videos', sa.Column('thumbnail_url', sa.String(length=500), nullable=True))
    op.add_column('camera_videos', sa.Column('duration', sa.Integer(), nullable=True))
    op.add_column('camera_videos', sa.Column('file_size', sa.Integer(), nullable=True))
    op.add_column('camera_videos', sa.Column('format', sa.String(length=20), nullable=True))
    op.add_column('camera_videos', sa.Column('uploaded_by', sa.Integer(), nullable=False))
    op.add_column('camera_videos', sa.Column('processed_at', sa.DateTime(), nullable=True))
    op.add_column('camera_videos', sa.Column('processing_status', sa.Enum('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', name='processingstatus'), nullable=False, server_default='PENDING'))
    op.add_column('camera_videos', sa.Column('has_violations', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('camera_videos', sa.Column('violation_count', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('camera_videos', sa.Column('video_metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    
    # Create indexes
    op.create_index(op.f('ix_camera_videos_camera_id'), 'camera_videos', ['camera_id'], unique=False)
    op.create_index(op.f('ix_camera_videos_processing_status'), 'camera_videos', ['processing_status'], unique=False)
    op.create_unique_constraint('uq_camera_videos_cloudinary_public_id', 'camera_videos', ['cloudinary_public_id'])
    
    # Create foreign key
    op.create_foreign_key('fk_camera_videos_uploaded_by', 'camera_videos', 'users', ['uploaded_by'], ['id'])
    
    # Create ai_detections table
    op.create_table('ai_detections',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('video_id', sa.Integer(), nullable=False),
        sa.Column('detection_type', sa.Enum('LICENSE_PLATE', 'VEHICLE_COUNT', 'VIOLATION', name='detectiontype'), nullable=False),
        sa.Column('detected_at', sa.DateTime(), nullable=False),
        sa.Column('frame_timestamp', sa.DECIMAL(precision=10, scale=3), nullable=False),
        sa.Column('confidence_score', sa.DECIMAL(precision=5, scale=4), nullable=False),
        sa.Column('detection_data', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('violation_id', sa.Integer(), nullable=True),
        sa.Column('reviewed', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('reviewed_by', sa.Integer(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('review_status', sa.Enum('PENDING', 'APPROVED', 'REJECTED', name='reviewstatus'), nullable=False, server_default='PENDING'),
        sa.Column('review_notes', sa.String(length=1000), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['video_id'], ['camera_videos.id'], name='fk_ai_detections_video_id'),
        sa.ForeignKeyConstraint(['violation_id'], ['violations.id'], name='fk_ai_detections_violation_id'),
        sa.ForeignKeyConstraint(['reviewed_by'], ['users.id'], name='fk_ai_detections_reviewed_by')
    )
    op.create_index(op.f('ix_ai_detections_video_id'), 'ai_detections', ['video_id'], unique=False)
    op.create_index(op.f('ix_ai_detections_detection_type'), 'ai_detections', ['detection_type'], unique=False)
    op.create_index(op.f('ix_ai_detections_detected_at'), 'ai_detections', ['detected_at'], unique=False)
    op.create_index(op.f('ix_ai_detections_violation_id'), 'ai_detections', ['violation_id'], unique=False)
    op.create_index(op.f('ix_ai_detections_reviewed'), 'ai_detections', ['reviewed'], unique=False)
    op.create_index(op.f('ix_ai_detections_review_status'), 'ai_detections', ['review_status'], unique=False)
    
    # Create video_processing_jobs table
    op.create_table('video_processing_jobs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('video_id', sa.Integer(), nullable=False),
        sa.Column('job_type', sa.Enum('UPLOAD', 'AI_ANALYSIS', 'THUMBNAIL', name='jobtype'), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', name='jobstatus'), nullable=False, server_default='PENDING'),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('error_message', sa.String(length=1000), nullable=True),
        sa.Column('retry_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('result_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['video_id'], ['camera_videos.id'], name='fk_video_processing_jobs_video_id')
    )
    op.create_index(op.f('ix_video_processing_jobs_video_id'), 'video_processing_jobs', ['video_id'], unique=False)
    op.create_index(op.f('ix_video_processing_jobs_job_type'), 'video_processing_jobs', ['job_type'], unique=False)
    op.create_index(op.f('ix_video_processing_jobs_status'), 'video_processing_jobs', ['status'], unique=False)


def downgrade() -> None:
    # Drop video_processing_jobs table
    op.drop_index(op.f('ix_video_processing_jobs_status'), table_name='video_processing_jobs')
    op.drop_index(op.f('ix_video_processing_jobs_job_type'), table_name='video_processing_jobs')
    op.drop_index(op.f('ix_video_processing_jobs_video_id'), table_name='video_processing_jobs')
    op.drop_table('video_processing_jobs')
    
    # Drop ai_detections table
    op.drop_index(op.f('ix_ai_detections_review_status'), table_name='ai_detections')
    op.drop_index(op.f('ix_ai_detections_reviewed'), table_name='ai_detections')
    op.drop_index(op.f('ix_ai_detections_violation_id'), table_name='ai_detections')
    op.drop_index(op.f('ix_ai_detections_detected_at'), table_name='ai_detections')
    op.drop_index(op.f('ix_ai_detections_detection_type'), table_name='ai_detections')
    op.drop_index(op.f('ix_ai_detections_video_id'), table_name='ai_detections')
    op.drop_table('ai_detections')
    
    # Revert camera_videos table
    op.drop_constraint('fk_camera_videos_uploaded_by', 'camera_videos', type_='foreignkey')
    op.drop_constraint('uq_camera_videos_cloudinary_public_id', 'camera_videos', type_='unique')
    op.drop_index(op.f('ix_camera_videos_processing_status'), table_name='camera_videos')
    op.drop_index(op.f('ix_camera_videos_camera_id'), table_name='camera_videos')
    
    op.drop_column('camera_videos', 'video_metadata')
    op.drop_column('camera_videos', 'violation_count')
    op.drop_column('camera_videos', 'has_violations')
    op.drop_column('camera_videos', 'processing_status')
    op.drop_column('camera_videos', 'processed_at')
    op.drop_column('camera_videos', 'uploaded_by')
    op.drop_column('camera_videos', 'format')
    op.drop_column('camera_videos', 'file_size')
    op.drop_column('camera_videos', 'duration')
    op.drop_column('camera_videos', 'thumbnail_url')
    op.drop_column('camera_videos', 'cloudinary_url')
    op.drop_column('camera_videos', 'cloudinary_public_id')
    
    # Add back old columns
    op.add_column('camera_videos', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('camera_videos', sa.Column('is_active_feed', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('camera_videos', sa.Column('resolution', sa.String(length=50), nullable=True))
    op.add_column('camera_videos', sa.Column('duration_seconds', sa.Integer(), nullable=True))
    op.add_column('camera_videos', sa.Column('size_bytes', sa.Integer(), nullable=True))
    op.add_column('camera_videos', sa.Column('mime_type', sa.String(length=100), nullable=True))
    op.add_column('camera_videos', sa.Column('file_name', sa.String(length=255), nullable=True))
    op.add_column('camera_videos', sa.Column('drive_file_id', sa.String(length=200), nullable=False))
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS processingstatus')
    op.execute('DROP TYPE IF EXISTS detectiontype')
    op.execute('DROP TYPE IF EXISTS reviewstatus')
    op.execute('DROP TYPE IF EXISTS jobtype')
    op.execute('DROP TYPE IF EXISTS jobstatus')
