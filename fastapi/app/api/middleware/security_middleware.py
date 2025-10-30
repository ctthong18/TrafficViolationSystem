from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import re

class SecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.sql_injection_patterns = [
            r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC)\b)",
            r"(\b(OR|AND)\b\s*\d+\s*=\s*\d+)",
            r"(--|\#|\/\*)",
        ]
        
        self.xss_patterns = [
            r"<script.*?>.*?</script>",
            r"javascript:",
            r"on\w+\s*=",
        ]
    
    async def dispatch(self, request: Request, call_next):
        # Check for SQL injection in query parameters
        for param_name, param_value in request.query_params.items():
            if self.detect_sql_injection(str(param_value)):
                raise HTTPException(
                    status_code=400,
                    detail="Yêu cầu chứa nội dung không hợp lệ"
                )
        
        # Check for XSS in headers
        user_agent = request.headers.get("user-agent", "")
        if self.detect_xss(user_agent):
            raise HTTPException(
                status_code=400,
                detail="User-Agent không hợp lệ"
            )
        
        # Add security headers
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        
        return response
    
    def detect_sql_injection(self, input_string: str) -> bool:
        """Detect potential SQL injection patterns"""
        input_upper = input_string.upper()
        for pattern in self.sql_injection_patterns:
            if re.search(pattern, input_upper, re.IGNORECASE):
                return True
        return False
    
    def detect_xss(self, input_string: str) -> bool:
        """Detect potential XSS patterns"""
        for pattern in self.xss_patterns:
            if re.search(pattern, input_string, re.IGNORECASE):
                return True
        return False