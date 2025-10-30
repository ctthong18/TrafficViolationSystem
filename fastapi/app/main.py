from fastapi import FastAPI
from core.config import settings  # Đổi: từ app.core
from core.database import create_tables  # Đổi: từ app.core
from api.router import api_router  # Đổi: từ app.api

# Middleware imports: Đổi prefix
from api.middleware.cors_middleware import setup_cors_middleware
from api.middleware.logging_middleware import LoggingMiddleware
from api.middleware.rate_limiting import RateLimitingMiddleware
from api.middleware.error_handler import ErrorHandlerMiddleware
from api.middleware.security_middleware import SecurityMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG
)

# Add middleware (giữ nguyên)
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

# Startup: Tạo tables khi start (tránh chạy sớm)
@app.on_event("startup")
async def startup_event():
    create_tables()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)  # Đổi tương ứng