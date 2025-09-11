@echo off
echo ========================================
echo    Crop Trading & Inventory System
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo Node.js found! ✓
echo.

echo Installing dependencies (if needed)...
if not exist "node_modules" (
    echo Running npm install...
    npm install
) else (
    echo Dependencies already installed ✓
)
echo.

echo Initializing database (if needed)...
if not exist "local-database.db" (
    echo Creating database...
    npx tsx scripts/init-db.ts
) else (
    echo Database already exists ✓
)
echo.

echo ========================================
echo Starting the application...
echo ========================================
echo.
echo Once started, open your web browser and go to:
echo http://localhost:5000
echo.
echo Login credentials:
echo Email: admin@example.com
echo Password: admin123
echo.
echo Press Ctrl+C to stop the application
echo ========================================
echo.

npm run dev