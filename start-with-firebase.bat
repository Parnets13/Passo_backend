@echo off
color 0A
cls
echo.
echo  ================================================
echo   PaasoWork Backend - Firebase Ready
echo  ================================================
echo.
echo  Checking Firebase setup...
echo.

REM Check if firebase-service-account.json exists
if not exist "firebase-service-account.json" (
    color 0C
    echo  ❌ firebase-service-account.json NOT FOUND!
    echo.
    echo  Please ensure the file exists in Passo_backend/
    echo.
    pause
    exit /b 1
)

echo  ✅ firebase-service-account.json found
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo  Installing dependencies...
    call npm install
    echo.
)

echo  ✅ Dependencies ready
echo.

echo  Starting backend server...
echo.
echo  ================================================
echo   Server will start on http://localhost:5000
echo  ================================================
echo.
echo  API Endpoints:
echo   - POST /api/notifications/test
echo   - POST /api/notifications/send
echo   - POST /api/notifications/send-multiple
echo   - POST /api/notifications/send-to-worker/:id
echo.
echo  ================================================
echo.

npm start
