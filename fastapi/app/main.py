import asyncio
from fastapi import FastAPI
from app.core.config import settings  
from app.core.database import create_tables  
from app.api.router import api_router 

from app.api.middleware.cors_middleware import setup_cors_middleware
from app.api.middleware.logging_middleware import LoggingMiddleware
from app.api.middleware.rate_limiting import RateLimitingMiddleware
from app.api.middleware.error_handler import ErrorHandlerMiddleware
from app.api.middleware.security_middleware import SecurityMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG
)

# Add middleware
app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(SecurityMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitingMiddleware)

# CORS setup
setup_cors_middleware(app)

# Include router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Traffic Violation System API",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Startup
@app.on_event("startup")
async def startup_event():
    create_tables()
    
    # Start UDP receiver for camera streams
    from app.core.udp_stream import start_udp_receiver
    asyncio.create_task(start_udp_receiver(port=9999))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)  # Đổi tương ứng