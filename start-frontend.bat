@echo off
REM VocabRise Frontend Development Server (Batch File)
REM Starts the Next.js development server

cls
echo.
echo ====================================
echo   VocabRise Frontend Server
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
    echo Installing dependencies (this may take a minute)...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencies already installed
)

REM Start server
echo.
echo ====================================
echo   Starting Development Server
echo ====================================
echo.
echo Opening: http://localhost:3000
echo.
echo Press Ctrl+C to stop...
echo.

call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error starting server!
    pause
    exit /b 1
)
