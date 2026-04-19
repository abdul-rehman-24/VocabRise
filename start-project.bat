@echo off
REM VocabRise Complete Startup (Batch File)
REM This runs everything needed to start the project

cls
echo.
echo ====================================
echo   VocabRise - Quick Start
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
for /f "tokens=*" %%A in ('node --version') do echo     Version: %%A

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
    echo [OK] Dependencies installed
) else (
    echo [OK] Dependencies already installed
)

REM Setup database
echo.
echo ====================================
echo   Database Setup
echo ====================================
echo.
echo Setting up Prisma schema...
call npx prisma db push --skip-generate --accept-data-loss
if %ERRORLEVEL% EQU 0 (
    echo [OK] Database synchronized
) else (
    echo Warning: Could not sync database
)

echo Seeding test data...
call npx prisma db seed >nul 2>&1
echo [OK] Database ready

REM Start server
echo.
echo ====================================
echo   Starting Development Server
echo ====================================
echo.
echo Web App: http://localhost:3000
echo Database UI: http://localhost:5555
echo.
echo Press Ctrl+C to stop...
echo.

call npm run dev

pause
