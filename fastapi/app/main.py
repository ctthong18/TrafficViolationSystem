from fastapi import FastAPI
from app.core.config import settings
from app.core.database import create_tables
from app.api.router import api_router

# Middleware imports
from app.api.middleware.cors_middleware import setup_cors_middleware
from app.api.middleware.logging_middleware import LoggingMiddleware
from app.api.middleware.rate_limiting import RateLimitingMiddleware
from app.api.middleware.error_handler import ErrorHandlerMiddleware
from app.api.middleware.security_middleware import SecurityMiddleware

# Create tables
create_tables()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG
)

# Add middleware (order matters!)
app.add_middleware(ErrorHandlerMiddleware)  # First - catch all errors
app.add_middleware(SecurityMiddleware)      # Security checks
app.add_middleware(LoggingMiddleware)       # Request logging
app.add_middleware(RateLimitingMiddleware)  # Rate limiting

# CORS setup
setup_cors_middleware(app)

# Include main router
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)