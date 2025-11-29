from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.security import verify_token
from app.core.database import get_db
from app.models.user import User
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger(__name__)

class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, excluded_paths: list[str] | None = None):
        super().__init__(app)
        self.excluded_paths = excluded_paths or [
            "/docs",
            "/redoc", 
            "/openapi.json",
            "/health",
            "/api/v1/login",
            "/api/v1/register",
            "/api/v1/auth/refresh"
        ]
    
    async def dispatch(self, request: Request, call_next):
        # Skip authentication for excluded paths
        if any(request.url.path.startswith(path) for path in self.excluded_paths):
            return await call_next(request)
        
        # Skip non-API paths
        if not request.url.path.startswith("/api/v1"):
            return await call_next(request)
        
        # Get token from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Missing or invalid authorization header"}
            )
        
        token = auth_header.split(" ")[1]
        
        # Verify token
        user_id = verify_token(token)
        if not user_id:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid or expired token"}
            )
        
        # Get user from database
        db = next(get_db())
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user or not user.is_active:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "User not found or inactive"}
                )
            
            # Add user to request state
            request.state.current_user = user
            
            response = await call_next(request)
            return response
            
        except Exception as e:
            logger.error(f"Auth middleware error: {e}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Authentication error"}
            )
        finally:
            db.close()