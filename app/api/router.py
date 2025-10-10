from fastapi import APIRouter
from app.api.endpoints import auth, admin, officer, citizen, violations

api_router = APIRouter()

api_router.include_router(auth.router, prefix='auth', tags=["Auth"])
api_router.include_router(admin.router, prefix='admin', tags=["Admin"])
api_router.include_router(officer.router, prefix='officer', tags=["Officer"])
api_router.include_router(citizen.router, prefix='citizen', tags=["Citizen"])
api_router.include_router(violations.router, prefix='violations', tags=["Violations"])