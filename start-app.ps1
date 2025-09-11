# Crop Trading & Inventory System - PowerShell Launcher
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Crop Trading & Inventory System" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js found! Version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Install dependencies if needed
Write-Host "Installing dependencies (if needed)..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    Write-Host "Running npm install..." -ForegroundColor Cyan
    npm install
} else {
    Write-Host "Dependencies already installed ✓" -ForegroundColor Green
}

Write-Host ""

# Initialize database if needed
Write-Host "Initializing database (if needed)..." -ForegroundColor Yellow
if (!(Test-Path "local-database.db")) {
    Write-Host "Creating database..." -ForegroundColor Cyan
    npx tsx scripts/init-db.ts
} else {
    Write-Host "Database already exists ✓" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Starting the application..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Once started, open your web browser and go to:" -ForegroundColor Cyan
Write-Host "http://localhost:5000" -ForegroundColor White -BackgroundColor Blue
Write-Host ""
Write-Host "Login credentials:" -ForegroundColor Cyan
Write-Host "Email: admin@example.com" -ForegroundColor White
Write-Host "Password: admin123" -ForegroundColor White  
Write-Host ""
Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Start the application
npm run dev