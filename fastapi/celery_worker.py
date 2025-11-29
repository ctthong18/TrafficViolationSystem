#!/usr/bin/env python
"""
Celery Worker Startup Script

This script starts the Celery worker for processing background tasks.

Usage:
    # Start worker for all queues
    celery -A celery_worker worker --loglevel=info

    # Start worker for specific queue
    celery -A celery_worker worker -Q video_processing --loglevel=info
    celery -A celery_worker worker -Q detection_processing --loglevel=info

    # Start worker with concurrency
    celery -A celery_worker worker --concurrency=4 --loglevel=info

    # Start Celery Beat (for periodic tasks)
    celery -A celery_worker beat --loglevel=info

    # Start Flower (monitoring UI)
    celery -A celery_worker flower --port=5555

Requirements: 5.1, 5.2
"""

import sys
import os

# Add the app directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.celery_config import celery_app

# Import workers to register tasks
from app.workers import video_worker, detection_worker

if __name__ == '__main__':
    celery_app.start()
