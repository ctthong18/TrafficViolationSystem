from fastapi import APIRouter
from app.api.endpoints import (
    auth, 
    admin, 
    officer, 
    citizen, 
    violations,
    violation_rules,
    cameras,
    complaints,
    denuciations, 
    vehicles,
    driving_licenses,
    calendar_analytics,
    payments,
    users,
    activities,
    statistics,
    videos,
    notifications,
    ai_config,
    video_analytics,
)

api_router = APIRouter()

# Authentication
api_router.include_router(auth.router, tags=["Authentication"])

# Role-based endpoints
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(officer.router, prefix="/officer", tags=["Officer"]) 
api_router.include_router(citizen.router, prefix="/citizen", tags=["Citizen"])

# Feature-based endpoints
api_router.include_router(violations.router, prefix="/violations", tags=["Violations"])
api_router.include_router(violation_rules.router, prefix="/violation-rules", tags=["Violation Rules"])
api_router.include_router(cameras.router, prefix="/cameras", tags=["Cameras"])
api_router.include_router(complaints.router, prefix="/complaints", tags=["Complaints"])
api_router.include_router(denuciations.router, prefix="/denunciations", tags=["Denunciations"])
api_router.include_router(calendar_analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["Vehicles"])
api_router.include_router(driving_licenses.router, prefix="/driving-licenses", tags=["Driving Licenses"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(activities.router, prefix="/activities", tags=["Activities"])
api_router.include_router(statistics.router, prefix="/statistics", tags=["Statistics"])
api_router.include_router(videos.router, prefix="/videos", tags=["Videos"])
api_router.include_router(video_analytics.router, prefix="/video-analytics", tags=["Video Analytics"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(ai_config.router, prefix="/ai-config", tags=["AI Configuration"])