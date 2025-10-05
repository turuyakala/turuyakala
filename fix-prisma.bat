@echo off
echo ========================================
echo Prisma Client Fix Script
echo ========================================
echo.

echo [1/5] Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul
echo Done!
echo.

echo [2/5] Removing .prisma folder...
if exist "node_modules\.prisma" (
    rmdir /s /q "node_modules\.prisma"
    echo Done!
) else (
    echo Folder does not exist, skipping...
)
echo.

echo [3/5] Removing .next folder...
if exist ".next" (
    rmdir /s /q ".next"
    echo Done!
) else (
    echo Folder does not exist, skipping...
)
echo.

echo [4/5] Generating Prisma Client...
call npx prisma generate
echo.

echo [5/5] Starting dev server...
echo.
call npm run dev

