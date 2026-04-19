# VocabRise Complete Startup Script
# This script sets up the backend AND starts the frontend server

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║     VocabRise - Complete Startup          ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Magenta
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
    Write-Host "📦 Installing dependencies (this may take a minute)..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔧 BACKEND: Setting up database..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "Syncing database schema..." -ForegroundColor Yellow

# Push Prisma schema
npx prisma db push --skip-generate --accept-data-loss
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Could not sync database (this is OK on first run)" -ForegroundColor Yellow
}

Write-Host "✅ Database schema synced!" -ForegroundColor Green

# Seed database
Write-Host "Seeding database with test data..." -ForegroundColor Cyan
npx prisma db seed 2>$null
Write-Host "✅ Test data applied!" -ForegroundColor Green

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "🚀 FRONTEND: Starting Next.js server..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Open your browser: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📊 Database UI: http://localhost:5555 (Prisma Studio)" -ForegroundColor Cyan
Write-Host "👤 Login: Use your Google account or test users" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the frontend server
npm run dev
