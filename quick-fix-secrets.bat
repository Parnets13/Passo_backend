@echo off
echo ========================================
echo Quick Fix: Remove Firebase secrets from Git
echo ========================================
echo.

echo Step 1: Unstage current changes...
git reset HEAD~1

echo.
echo Step 2: Remove files from Git tracking...
git rm --cached src/config/firebase-service-account.json 2>nul
git rm --cached firebase-service-account.json 2>nul

echo.
echo Step 3: Verify .gitignore has the files...
findstr /C:"firebase-service-account.json" .gitignore >nul
if %errorlevel% equ 0 (
    echo ✓ .gitignore already contains firebase-service-account.json
) else (
    echo Adding to .gitignore...
    echo firebase-service-account.json >> .gitignore
    echo src/config/firebase-service-account.json >> .gitignore
)

echo.
echo Step 4: Commit without the secret files...
git add .
git commit -m "Remove Firebase service account from tracking (use env vars instead)"

echo.
echo Step 5: Force push to overwrite the commit with secrets...
echo Ready to push. This will overwrite the previous commit.
echo.
set /p confirm="Type YES to force push: "
if /i "%confirm%"=="YES" (
    git push origin main --force
    echo.
    echo ✓ Done! Secrets removed from GitHub.
) else (
    echo Push cancelled. Run manually: git push origin main --force
)

echo.
pause
