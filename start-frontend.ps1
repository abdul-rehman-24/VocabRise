# VocabRise Frontend Development Server Script
# This script starts the Next.js development server

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  VocabRise Frontend Server" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Node.js found: $(node --version)" -ForegroundColor Green

# Check if npm is installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ npm found: $(npm --version)" -ForegroundColor Green
Write-Host ""

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting Next.js development server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Server is starting..." -ForegroundColor Yellow
Write-Host "📍 App will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the development server
npm run dev

# Handle exit
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Development server stopped with an error!" -ForegroundColor Red
    exit 1
}
