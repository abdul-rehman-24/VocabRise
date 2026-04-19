@echo off
REM VocabRise Backend Setup (Batch File)
REM Sets up database and Prisma

cls
echo.
echo ====================================
echo   VocabRise Backend Setup
echo ====================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed!
     echo Please install from: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed

REM Install dependencies
if not exist "node_modules" (
    echo.
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencies already installed
)

REM Setup database
echo.
echo Setting up database schema...
call npx prisma db push --skip-generate --accept-data-loss

echo.
echo Seeding test data...
call npx prisma db seed >nul 2>&1

echo.
echo ====================================
echo   Backend Ready!
echo ====================================
echo.
echo Next: Run 'start-frontend.bat' to start the web server
echo.
pause
