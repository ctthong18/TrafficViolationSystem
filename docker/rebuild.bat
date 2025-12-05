@echo off
echo 🔨 Rebuilding and restarting services...
echo.

docker-compose up -d --build

echo.
echo ✅ Services rebuilt and restarted!
echo.
pause
