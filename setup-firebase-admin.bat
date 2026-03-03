@echo off
echo ========================================
echo Firebase Admin SDK Setup
echo ========================================
echo.

echo Step 1: Check if firebase-service-account.json exists
if exist firebase-service-account.json (
    echo [OK] firebase-service-account.json found!
    echo.
    echo Checking file size...
    for %%A in (firebase-service-account.json) do (
        if %%~zA LSS 100 (
            echo [WARNING] File is too small (%%~zA bytes^)
            echo This is likely an empty template file.
            goto :download_instructions
        ) else (
            echo [OK] File size: %%~zA bytes
            echo.
            goto :test_backend
        )
    )
) else (
    echo [ERROR] firebase-service-account.json NOT found!
    echo.
    goto :download_instructions
)

:download_instructions
echo ========================================
echo Firebase Service Account Download Steps
echo ========================================
echo.
echo 1. Open: https://console.firebase.google.com/
echo 2. Select project: paaso-app
echo 3. Click Settings (gear icon) -^> Project settings
echo 4. Go to "Service accounts" tab
echo 5. Click "Generate new private key"
echo 6. Click "Generate key" to confirm
echo 7. Save the downloaded JSON file as:
echo    firebase-service-account.json
echo 8. Move it to: %CD%
echo.
echo Press any key after downloading the file...
pause >nul
echo.
echo Checking again...
if exist firebase-service-account.json (
    echo [OK] File found! Continuing...
    echo.
    goto :test_backend
) else (
    echo [ERROR] File still not found!
    echo Please download and place the file, then run this script again.
    pause
    exit /b 1
)

:test_backend
echo ========================================
echo Testing Backend Connection
echo ========================================
echo.
echo Starting backend server...
echo.
npm start

:end
