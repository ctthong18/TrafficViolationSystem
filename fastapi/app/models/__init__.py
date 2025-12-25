from app.models.activity import Activity
from app.models.audit_log import AuditAction, AuditLog, AuditResource
from app.models.base import Base
from app.models.camera import Camera

# Camera System models
from app.models.CameraVideo import CameraVideo, ProcessingStatus
from app.models.complaint import Complaint, ComplaintStatus, ComplaintType
from app.models.complaint_activity import ComplaintActivity
from app.models.complaint_appeal import AppealStatus, ComplaintAppeal
from app.models.confidence_analytics import ConfidenceAnalytics

# Analytics models
from app.models.daily_stats import DailyStats
from app.models.denunciation import Denunciation, DenunciationStatus, DenunciationType
from app.models.denunciation_activity import DenunciationActivity
from app.models.evidence import Evidence
from app.models.location_hotspots import LocationHotspots
from app.models.model_performance import ModelPerformance
from app.models.notification import (
    Notification,
    NotificationChannel,
    NotificationStatus,
)
from app.models.notification_template import NotificationTemplate, NotificationType
from app.models.payment import Payment
from app.models.system_config import SystemConfig
from app.models.time_series_trends import TimeSeriesTrends
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.video_processing_job import JobStatus, JobType, VideoProcessingJob
from app.models.violation import Violation, ViolationStatus
from app.models.violation_forecasts import ViolationForecasts
from app.models.violation_rule import ViolationRule

__all__ = [
    "Base",
    "User",
    "Vehicle",
    "ViolationRule",
    "Violation",
    "ViolationStatus",
    "Activity",
    "Complaint",
    "ComplaintStatus",
    "ComplaintType",
    "ComplaintAppeal",
    "AppealStatus",
    "ComplaintActivity",
    "Denunciation",
    "DenunciationStatus",
    "DenunciationType",
    "DenunciationActivity",
    "Payment",
    "Evidence",
    "Camera",
    "Notification",
    "NotificationStatus",
    "NotificationChannel",
    "NotificationTemplate",
    "NotificationType",
    "AuditLog",
    "AuditAction",
    "AuditResource",
    "SystemConfig",
    "DailyStats",
    "LocationHotspots",
    "TimeSeriesTrends",
    "ConfidenceAnalytics",
    "ModelPerformance",
    "ViolationForecasts",
    "CameraVideo",
    "ProcessingStatus",
    "VideoProcessingJob",
    "JobType",
    "JobStatus",
]
