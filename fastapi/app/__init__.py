"""
Traffic Violation System Backend
"""

__version__ = "1.0.0"
__author__ = "Traffic System Team"

# Import Base from models
from app.models.base import Base

# Import database utilities
# from core.database import engine, get_db

# Import settings
from core.config import settings

# Import all models to ensure they are registered
from app.models import (
    user, vehicle, violation, complaint, complaint_appeal, complaint_activity,
    denunciation, denunciation_activity, payment, evidence, camera,
    notification, notification_template, audit_log, system_config,
    daily_stats, location_hotspots, time_series_trends, confidence_analytics,
    model_performance, violation_forecasts, action_recommendations
)

__all__ = [
    'settings', 'Base'
]