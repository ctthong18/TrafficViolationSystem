"""
API endpoints package
"""

from app.api.endpoints import (
    auth, admin, officer, citizen, violations, 
    complaints, denuciations, vehicles, calendar_analytics
)

__all__ = [
    'auth',
    'admin', 
    'officer',
    'citizen',
    'violations',
    'complaints',
    'denuciations', 
    'vehicles',
    'calendar_analytics'
]