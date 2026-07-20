# Nexora Full-Stack Automator Launcher

Write-Host "=============================================" -ForegroundColor Green
Write-Host "   NEXORA STORAGE GATEWAY ENGINE - LAUNCHER   " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# 1. Check Python virtual environment
if (-not (Test-Path "backend\venv")) {
    Write-Host "[SYSTEM] Initializing Python virtual environment..." -ForegroundColor Yellow
    python -m venv backend\venv
}

# 2. Check Python packages
Write-Host "[SYSTEM] Verifying backend dependencies..." -ForegroundColor Cyan
& "backend\venv\Scripts\pip" install -r backend\requirements.txt

# 3. Check Node package manager setup
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "[SYSTEM] Installing frontend node dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

# 4. Apply Database Migrations
Write-Host "[SYSTEM] Applying database schemas to Neon PostgreSQL..." -ForegroundColor Cyan
Set-Location backend
& "venv\Scripts\alembic" upgrade head
Set-Location ..

# 5. Build React production build to serve from FastAPI
Write-Host "[SYSTEM] Compiling React frontend production build..." -ForegroundColor Cyan
Set-Location frontend
npm run build
Set-Location ..

# 6. Start Unified ASGI Engine
Write-Host ""
Write-Host "[SYSTEM] Launcher checks complete!" -ForegroundColor Green
Write-Host "[SYSTEM] Launching unified full-stack server on: http://localhost:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to terminate the gateway engine." -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Green
Set-Location backend
& "venv\Scripts\uvicorn" app.main:app --host 0.0.0.0 --port 8000
Set-Location ..
