# Start Sentinel Portal (PowerShell)
# Academic Research Demonstration — all telemetry is synthetic

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  SENTINEL PORTAL — Autonomous Web Attack Detection" -ForegroundColor White
Write-Host "  All telemetry is synthetic. No real traffic is generated." -ForegroundColor Gray
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Starting backend on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload" -WindowStyle Normal

Start-Sleep 2

Write-Host "[2/2] Starting frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev" -WindowStyle Normal

Start-Sleep 3

Write-Host ""
Write-Host "Application starting at: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Start-Process "http://localhost:5173"
