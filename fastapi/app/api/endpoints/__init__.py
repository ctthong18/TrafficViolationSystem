"""
API endpoints package
"""

from app.api.endpoints import (
    auth, admin, officer, citizen, violations, 
    complaints, denuciations, vehicles, driving_licenses, calendar_analytics,
    payments, users, notifications
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
    'driving_licenses',
    'calendar_analytics',
    'payments',
    'users',
    'notifications',
]