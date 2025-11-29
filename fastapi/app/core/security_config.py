"""
Security Configuration
Centralized security settings and utilities for the AI Camera System
"""
import os
from typing import Optional
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)


class SecurityConfig(BaseModel):
    """Security configuration settings"""
    
    # File upload security
    max_file_size_mb: int = 100
    allowed_video_formats: list = ["mp4", "avi", "mov"]
    enable_file_scanning: bool = True
    
    # Rate limiting
    enable_rate_limiting: bool = True
    default_rate_limit: int = 1000  # requests per minute
    auth_rate_limit: int = 100  # requests per minute for auth endpoints
    upload_rate_limit: int = 50  # requests per minute for uploads
    
    # Audit logging
    enable_audit_logging: bool = True
    audit_log_retention_days: int = 90
    
    # API security
    require_https: bool = False  # Set to True in production
    enable_cors: bool = True
    allowed_origins: list = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Cloudinary security
    cloudinary_secure_urls: bool = True
    cloudinary_signed_urls: bool = False  # Enable for extra security
    
    # Session security
    session_timeout_minutes: int = 30
    max_failed_login_attempts: int = 5
    lockout_duration_minutes: int = 15
    
    # Content security
    enable_content_validation: bool = True
    enable_malware_scanning: bool = True
    
    class Config:
        env_prefix = "SECURITY_"


def get_security_config() -> SecurityConfig:
    """Get security configuration from environment or defaults"""
    return SecurityConfig(
        max_file_size_mb=int(os.getenv("SECURITY_MAX_FILE_SIZE_MB", "100")),
        enable_rate_limiting=os.getenv("SECURITY_ENABLE_RATE_LIMITING", "true").lower() == "true",
        enable_audit_logging=os.getenv("SECURITY_ENABLE_AUDIT_LOGGING", "true").lower() == "true",
        require_https=os.getenv("SECURITY_REQUIRE_HTTPS", "false").lower() == "true",
    )


def validate_cloudinary_credentials() -> bool:
    """
    Validate that Cloudinary credentials are properly configured
    
    Returns:
        True if credentials are valid, False otherwise
    """
    from app.core.config import settings
    
    required_fields = [
        settings.cloudinary_cloud_name,
        settings.cloudinary_api_key,
        settings.cloudinary_api_secret
    ]
    
    # Check if any field is missing or has default value
    if not all(required_fields):
        logger.error("Cloudinary credentials are missing")
        return False
    
    if settings.cloudinary_cloud_name == "your_cloud_name":
        logger.error("Cloudinary credentials not configured (using default values)")
        return False
    
    logger.info("Cloudinary credentials validated successfully")
    return True


def get_client_ip(request) -> Optional[str]:
    """
    Extract client IP address from request, handling proxies
    
    Args:
        request: FastAPI request object
        
    Returns:
        Client IP address or None
    """
    # Check X-Forwarded-For header (for proxies/load balancers)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # Take the first IP in the chain
        return forwarded_for.split(",")[0].strip()
    
    # Check X-Real-IP header
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
    
    # Fall back to direct client IP
    if request.client:
        return request.client.host
    
    return None


def get_user_agent(request) -> Optional[str]:
    """
    Extract user agent from request
    
    Args:
        request: FastAPI request object
        
    Returns:
        User agent string or None
    """
    return request.headers.get("User-Agent")


# Global security config instance
security_config = get_security_config()
