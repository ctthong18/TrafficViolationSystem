from app.api.middleware.auth_middleware import AuthMiddleware

from app.api.middleware.logging_middleware import LoggingMiddleware
from app.api.middleware.rate_limiting import RateLimitingMiddleware
from app.api.middleware.error_handler import ErrorHandlerMiddleware
from app.api.middleware.security_middleware import SecurityMiddleware
from app.api.middleware.cors_middleware import setup_cors_middleware

__all__ = [
    # Authentication
    "AuthMiddleware",
    
    # Middleware classes
    "LoggingMiddleware",
    "RateLimitingMiddleware", 
    "ErrorHandlerMiddleware",
    "SecurityMiddleware",
    
    # CORS setup function
    "setup_cors_middleware"
]

__version__ = "1.0.0"
__description__ = "Middleware components for API security and monitoring"