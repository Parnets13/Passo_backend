@echo off
echo ========================================
echo Removing Firebase secrets from Git history
echo ========================================
echo.

echo Step 1: Remove files from Git cache...
git rm --cached src/config/firebase-service-account.json
git rm --cached firebase-service-account.json

echo.
echo Step 2: Commit the removal...
git add .gitignore
git commit -m "Remove Firebase service account files from tracking"

echo.
echo Step 3: Remove from Git history using filter-branch...
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch src/config/firebase-service-account.json firebase-service-account.json" --prune-empty --tag-name-filter cat -- --all

echo.
echo Step 4: Clean up refs...
git for-each-ref --format="delete %%(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo.
echo ========================================
echo Done! Now force push to GitHub:
echo   git push origin main --force
echo ========================================
echo.
echo WARNING: This rewrites Git history!
echo Make sure no one else is working on this repo right now.
echo.
pause
