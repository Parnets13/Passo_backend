@echo off
chcp 65001 >nul
color 0A
cls

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     🔥 Firebase Admin SDK - Quick Fix                     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:check_file
echo [1/3] Checking firebase-service-account.json...
echo.

if exist firebase-service-account.json (
    for %%A in (firebase-service-account.json) do set size=%%~zA
    
    if !size! LSS 500 (
        echo ❌ File exists but is too small ^(!size! bytes^)
        echo    This is likely a template file, not the actual key.
        echo.
        goto :instructions
    ) else (
        echo ✅ File found ^(!size! bytes^)
        echo.
        goto :verify
    )
) else (
    echo ❌ File NOT found!
    echo.
    goto :instructions
)

:instructions
echo ╔════════════════════════════════════════════════════════════╗
echo ║  📋 Download करने के Steps:                               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 1. Browser में खोलें:
echo    👉 https://console.firebase.google.com/
echo.
echo 2. Project select करें: paaso-app
echo.
echo 3. Settings ⚙️ ^> Project settings ^> Service accounts
echo.
echo 4. "Generate new private key" button पर click करें
echo.
echo 5. "Generate key" confirm करें
echo.
echo 6. Downloaded file को rename करें:
echo    👉 firebase-service-account.json
echo.
echo 7. इस folder में paste करें:
echo    👉 %CD%
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo File download करने के बाद कोई key press करें...
pause >nul

cls
echo.
echo Checking again...
echo.
goto :check_file

:verify
echo [2/3] Verifying file content...
echo.
node check-firebase-admin.js
if errorlevel 1 (
    echo.
    echo ❌ Verification failed!
    echo    Please download the correct file from Firebase Console.
    echo.
    pause
    exit /b 1
)

:start_backend
echo.
echo [3/3] Starting backend server...
echo.
echo ════════════════════════════════════════════════════════════
echo.
npm start

:end
