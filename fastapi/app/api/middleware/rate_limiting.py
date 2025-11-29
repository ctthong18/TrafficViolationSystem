import time
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from typing import Dict, Tuple
import redis
from app.core.config import settings
from app.core.security_config import security_config
import os
import logging

logger = logging.getLogger(__name__)


class RateLimitingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, redis_url: str = None):
        super().__init__(app)
        try:
            self.redis_client = redis.from_url(
                redis_url or os.getenv("REDIS_URL", "redis://redis:6379"),
                socket_connect_timeout=5
            )
            # Test connection
            self.redis_client.ping()
            logger.info("Rate limiting middleware initialized with Redis")
        except Exception as e:
            logger.warning(f"Redis connection failed, rate limiting disabled: {e}")
            self.redis_client = None
        
        # Enhanced rate limits with security focus
        self.rate_limits = {
            "/api/v1/auth/": (100, 60),  # 100 requests per minute for auth
            "/api/v1/videos/upload": (50, 60),  # 50 uploads per minute
            "/api/v1/videos/": (500, 60),  # 500 requests per minute for video operations
            "/api/v1/detections/": (500, 60),  # 500 requests per minute for detections
            "/api/v1/violations/": (1000, 60),  # 1000 requests per minute
            "/api/v1/admin/": (500, 60),  # 500 requests per minute for admin
            "default": (1000, 60)  # Default rate limit
        }
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for certain paths
        if request.url.path in ["/", "/health", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        # Skip if rate limiting is disabled or Redis unavailable
        if not security_config.enable_rate_limiting or not self.redis_client:
            return await call_next(request)
        
        # Get client identifier
        client_id = self.get_client_identifier(request)
        
        # Get rate limit for this endpoint
        rate_limit = self.get_rate_limit_for_path(request.url.path)
        
        if rate_limit:
            max_requests, window_seconds = rate_limit
            key = f"rate_limit:{client_id}:{request.url.path}"
            
            try:
                # Check current count
                current = self.redis_client.get(key)
                if current and int(current) >= max_requests:
                    logger.warning(
                        f"Rate limit exceeded for {client_id} on {request.url.path}: "
                        f"{current}/{max_requests} requests"
                    )
                    raise HTTPException(
                        status_code=429,
                        detail=f"Rate limit exceeded. Maximum {max_requests} requests per {window_seconds} seconds"
                    )
                
                # Increment counter
                pipeline = self.redis_client.pipeline()
                pipeline.incr(key, 1)
                pipeline.expire(key, window_seconds)
                pipeline.execute()
                
            except redis.RedisError as e:
                logger.error(f"Redis error in rate limiting: {e}")
                # Continue without rate limiting if Redis fails
        
        return await call_next(request)
    
    def get_client_identifier(self, request: Request) -> str:
        """Get unique identifier for client"""
        # Prefer X-Forwarded-For for proxy setups
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0]
        else:
            client_ip = request.client.host if request.client else "unknown"
        
        # Add user agent for more granularity
        user_agent = request.headers.get("User-Agent", "unknown")
        return f"{client_ip}:{hash(user_agent) % 10000}"
    
    def get_rate_limit_for_path(self, path: str) -> Tuple[int, int]:
        """Get rate limit for specific path"""
        for endpoint, limit in self.rate_limits.items():
            if path.startswith(endpoint):
                return limit
        return self.rate_limits["default"]