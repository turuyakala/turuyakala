@echo off
REM LastMinuteTour Setup Script for Windows
REM This script helps you set up the project quickly

echo ==============================
echo LastMinuteTour Setup
echo ==============================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed. Please install Node.js 18+ first.
    echo   Download: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js found
node -v

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X npm is not installed.
    pause
    exit /b 1
)

echo [OK] npm found
npm -v
echo.

REM Install dependencies
echo Installing dependencies...
call npm install
echo.

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo Creating .env.local file...
    copy .env.local.example .env.local
    echo [OK] .env.local created. Please edit it with your configuration.
) else (
    echo [OK] .env.local already exists
)

echo.
echo ==============================
echo Setup complete!
echo ==============================
echo.
echo Next steps:
echo.
echo 1. Setup database:
echo    npm run db:generate
echo    npm run db:push
echo    npm run db:seed
echo.
echo 2. Start development server:
echo    npm run dev
echo.
echo For more details, see:
echo    - README.md (full documentation)
echo.
pause

