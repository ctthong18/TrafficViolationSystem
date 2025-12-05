@echo off
echo 🚀 Starting Traffic Violation System...
echo.

REM Check if .env exists
if not exist "..\fastapi\.env" (
    echo ❌ Error: .env file not found in fastapi folder
    echo Please create .env file first
    exit /b 1
)

REM Build and start services
echo 📦 Building and starting services...
docker-compose up -d --build

echo.
echo ✅ Services started successfully!
echo.
echo 📍 Access points:
echo    Frontend:     http://localhost:3000
echo    Backend API:  http://localhost:8000
echo    API Docs:     http://localhost:8000/docs
echo    pgAdmin:      http://localhost:5050
echo    MinIO:        http://localhost:9001
echo    Portainer:    http://localhost:9002
echo.
echo 📊 View logs:
echo    docker-compose logs -f
echo.
echo 🛑 Stop services:
echo    docker-compose down
echo.
pause
