@echo off
echo.
echo ========================================
echo   RESTARTING BACKEND SERVER
echo ========================================
echo.

echo Step 1: Stopping old process on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    echo Found process: %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo Step 2: Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo.
echo Step 3: Starting backend server...
start "Backend Server" cmd /k "npm start"

echo.
echo ========================================
echo   BACKEND SERVER RESTARTED!
echo ========================================
echo.
echo Server starting at: http://localhost:5000
echo.
echo Wait 5 seconds, then test with:
echo   node test-unlock-flow-local.js
echo.
pause
