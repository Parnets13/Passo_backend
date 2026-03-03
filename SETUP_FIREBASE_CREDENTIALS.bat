@echo off
echo ========================================
echo Firebase Credentials Setup
echo ========================================
echo.

echo Step 1: Checking current credentials...
node check-firebase-credentials.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo All checks passed! Starting backend...
    echo ========================================
    echo.
    npm start
) else (
    echo.
    echo ========================================
    echo Please fix the issues above first
    echo ========================================
    echo.
    echo Quick Steps:
    echo 1. Go to: https://console.firebase.google.com/
    echo 2. Select project: paaso-app
    echo 3. Settings ^(gear icon^) ^> Project settings
    echo 4. Service accounts tab
    echo 5. Click "Generate new private key"
    echo 6. Save downloaded file as: firebase-service-account.json
    echo 7. Place it in: Passo_backend folder
    echo.
    pause
)
