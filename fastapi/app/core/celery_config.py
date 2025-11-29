"""
Celery configuration for background task processing.

This module configures Celery for:
- Video processing tasks
- AI detection tasks
- Task routing and queues
- Error handling and retries

Requirements: 5.1, 5.2
"""

from celery import Celery
from app.core.config import settings

# Create Celery instance
celery_app = Celery(
    "traffic_violation_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.workers.video_worker",
        "app.workers.detection_worker"
    ]
)

# Celery configuration
celery_app.conf.update(
    # Task settings
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    # Task execution settings
    task_track_started=True,
    task_time_limit=900,  # 15 minutes hard limit
    task_soft_time_limit=600,  # 10 minutes soft limit
    
    # Task result settings
    result_expires=3600,  # Results expire after 1 hour
    result_extended=True,
    
    # Worker settings
    worker_prefetch_multiplier=1,  # Process one task at a time
    worker_max_tasks_per_child=50,  # Restart worker after 50 tasks
    
    # Task routing
    task_routes={
        "app.workers.video_worker.*": {"queue": "video_processing"},
        "app.workers.detection_worker.*": {"queue": "detection_processing"},
    },
    
    # Retry settings
    task_acks_late=True,  # Acknowledge task after completion
    task_reject_on_worker_lost=True,  # Reject task if worker dies
    
    # Beat schedule (for periodic tasks)
    beat_schedule={
        "retry-failed-jobs-every-hour": {
            "task": "app.workers.video_worker.retry_failed_jobs_task",
            "schedule": 3600.0,  # Every hour
        },
        "cleanup-old-jobs-daily": {
            "task": "app.workers.video_worker.cleanup_old_jobs_task",
            "schedule": 86400.0,  # Every day
        },
    },
)

# Task default settings
celery_app.conf.task_default_queue = "default"
celery_app.conf.task_default_exchange = "default"
celery_app.conf.task_default_routing_key = "default"

# Error handling
celery_app.conf.task_annotations = {
    "*": {
        "on_failure": lambda self, exc, task_id, args, kwargs, einfo: 
            print(f"Task {task_id} failed: {exc}")
    }
}
