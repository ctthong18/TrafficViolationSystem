from fastapi import FastAPI
from core.config import settings  
from core.database import create_tables  
from api.router import api_router 
from api.endpoints import stream

from api.middleware.cors_middleware import setup_cors_middleware
from api.middleware.logging_middleware import LoggingMiddleware
from api.middleware.rate_limiting import RateLimitingMiddleware
from api.middleware.error_handler import ErrorHandlerMiddleware
from api.middleware.security_middleware import SecurityMiddleware

import logging

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
# WebSocket + realtime streams stay at root paths (ws/realtime-detections, etc.)
app.include_router(stream.router)

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
    ok = ai_detection_service.load_model()
    if not ok:
        logging.error("Failed to load AI model")
    else:
        logging.info("AI model loaded successfully")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)  # Đổi tương ứng