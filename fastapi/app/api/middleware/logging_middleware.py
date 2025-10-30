import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.database import get_db
from app.models.audit_log import AuditLog
import json

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Start time
        start_time = time.time()
        
        # Get client info
        client_host = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        # Process request
        response = await call_next(request)
        
        # Calculate process time
        process_time = time.time() - start_time
        
        # Log the request
        log_data = {
            "method": request.method,
            "url": str(request.url),
            "status_code": response.status_code,
            "process_time": round(process_time, 4),
            "client_host": client_host,
            "user_agent": user_agent,
        }
        
        # Only log API calls (exclude static files)
        if request.url.path.startswith("/api/"):
            logger.info(f"API Request: {log_data}")
            
            # Save to audit log for important operations
            await self.save_audit_log(request, response, process_time, client_host)
        
        # Add process time to headers
        response.headers["X-Process-Time"] = str(process_time)
        
        return response
    
    async def save_audit_log(self, request: Request, response: Response, process_time: float, client_host: str):
        try:
            # Only log specific methods
            if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
                db = next(get_db())
                
                # Get user from request state if available
                user_id = None
                if hasattr(request.state, 'user'):
                    user_id = request.state.user.id
                
                # Get request body for relevant operations
                request_body = {}
                if request.method in ["POST", "PUT", "PATCH"]:
                    try:
                        body = await request.body()
                        if body:
                            request_body = json.loads(body.decode())
                    except:
                        request_body = {"error": "Could not parse body"}
                
                audit_log = AuditLog(
                    action=f"{request.method} {request.url.path}",
                    table_name="http_request",
                    record_id=0,
                    old_values={},
                    new_values=request_body,
                    user_id=user_id,
                    ip_address=client_host,
                    user_agent=request.headers.get("user-agent", "")
                )
                
                db.add(audit_log)
                db.commit()
                
        except Exception as e:
            logger.error(f"Error saving audit log: {e}")