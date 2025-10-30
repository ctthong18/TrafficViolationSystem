from fastapi import APIRouter
from app.api.endpoints import (
    auth, 
    admin, 
    officer, 
    citizen, 
    violations,
    complaints,
    denuciations, 
    vehicles,
    calendar_analytics
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
api_router.include_router(complaints.router, prefix="/complaints", tags=["Complaints"])
api_router.include_router(denuciations.router, prefix="/denunciations", tags=["Denunciations"])
api_router.include_router(calendar_analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["Vehicles"])