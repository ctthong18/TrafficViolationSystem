"""
Database models package
"""

from app.models.base import Base
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.violation import Violation
from app.models.complaint import Complaint, ComplaintStatus, ComplaintType
from app.models.complaint_appeal import ComplaintAppeal, AppealStatus
from app.models.complaint_activity import ComplaintActivity
from app.models.denunciation import Denunciation, DenunciationStatus, DenunciationType
from app.models.denunciation_activity import DenunciationActivity
from app.models.payment import Payment
from app.models.evidence import Evidence
from app.models.camera import Camera
from app.models.notification import Notification, NotificationStatus, NotificationChannel
from app.models.notification_template import NotificationTemplate, NotificationType
from app.models.audit_log import AuditLog
from app.models.system_config import SystemConfig

# Analytics models
from app.models.daily_stats import DailyStats
from app.models.location_hotspots import LocationHotspots
from app.models.time_series_trends import TimeSeriesTrends
from app.models.confidence_analytics import ConfidenceAnalytics
from app.models.model_performance import ModelPerformance
from app.models.violation_forecasts import ViolationForecasts
from app.models.action_recommendations import ActionRecommendations

__all__ = [
    'Base',
    'User',
    'Vehicle',
    'Violation',
    'Complaint', 'ComplaintStatus', 'ComplaintType',
    'ComplaintAppeal', 'AppealStatus', 
    'ComplaintActivity',
    'Denunciation', 'DenunciationStatus', 'DenunciationType',
    'DenunciationActivity',
    'Payment',
    'Evidence', 
    'Camera',
    'Notification', 'NotificationStatus', 'NotificationChannel',
    'NotificationTemplate', 'NotificationType',
    'AuditLog',
    'SystemConfig',
    'DailyStats',
    'LocationHotspots', 
    'TimeSeriesTrends',
    'ConfidenceAnalytics',
    'ModelPerformance',
    'ViolationForecasts',
    'ActionRecommendations'
]