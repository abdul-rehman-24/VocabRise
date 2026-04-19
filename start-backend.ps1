# VocabRise Backend Setup Script
# This script sets up the database and other backend services

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  VocabRise Backend Setup" -ForegroundColor Cyan
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
Write-Host "🗄️  Setting up database..." -ForegroundColor Cyan

# Push Prisma schema to database
npx prisma db push --skip-generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push Prisma schema!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database schema synced!" -ForegroundColor Green
Write-Host ""

# Seed database
Write-Host "🌱 Seeding database with test data..." -ForegroundColor Cyan
npx prisma db seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Seeding completed with some warnings (this is OK if data already exists)" -ForegroundColor Yellow
}

Write-Host "✅ Database ready!" -ForegroundColor Green
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Backend Setup Complete! ✅" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Run 'start-frontend.ps1' to start the development server" -ForegroundColor Yellow
Write-Host "Or run 'npm run dev' manually" -ForegroundColor Yellow
