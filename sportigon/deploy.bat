@echo off
echo 🏆 Sportigon - Sports Social Network Deployment Script
echo ======================================================
echo.

REM Colors for output
set "GREEN=[92m"
set "BLUE=[94m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

echo Checking Docker status...
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo ✅ Docker is running

echo.
echo Checking project structure...
if not exist ".env.example" (
    echo ❌ Required file .env.example not found!
    pause
    exit /b 1
)
if not exist "docker-compose.yml" (
    echo ❌ Required file docker-compose.yml not found!
    pause
    exit /b 1
)
if not exist "Dockerfile" (
    echo ❌ Required file Dockerfile not found!
    pause
    exit /b 1
)
if not exist "package.json" (
    echo ❌ Required file package.json not found!
    pause
    exit /b 1
)
echo ✅ Project structure is complete

echo.
echo Stopping existing containers...
docker-compose down >nul 2>&1

echo.
echo Building and starting containers...
docker-compose up --build -d
if errorlevel 1 (
    echo ❌ Failed to start containers
    pause
    exit /b 1
)
echo ✅ Containers started successfully!

echo.
echo Waiting for services to be ready...
timeout /t 15 /nobreak >nul

echo.
echo Testing backend health...
curl -f http://localhost:3001/api/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Backend health check failed, but containers may still be starting
) else (
    echo ✅ Backend is responding!
)

echo.
echo Container status:
docker-compose ps

echo.
echo 🎉 Deployment Complete!
echo ==============================
echo Access your application:
echo   • Application: http://localhost:3001
echo   • Health Check: http://localhost:3001/api/health
echo   • API Users: http://localhost:3001/api/users
echo   • API Feed: http://localhost:3001/api/feed
echo.
echo Database Services:
echo   • MongoDB: localhost:27017
echo   • PostgreSQL: localhost:5432
echo   • Redis: localhost:6379
echo   • Redis Commander: http://localhost:8081
echo.
echo Useful commands:
echo   • View logs: docker-compose logs -f
echo   • Stop: docker-compose down
echo   • Restart: docker-compose restart
echo.
echo ✅ Sportigon is ready for development and production use!
pause