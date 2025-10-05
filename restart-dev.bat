@echo off
echo Stopping Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul

echo.
echo Generating Prisma Client...
call npx prisma generate

echo.
echo Starting dev server...
call npm run dev

