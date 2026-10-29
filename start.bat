@echo off
echo.
echo  ================================================================
echo   SENTINEL PORTAL — Autonomous Web Attack Detection
echo   Academic Research Demonstration
echo   All telemetry is synthetic. No real traffic is generated.
echo  ================================================================
echo.

echo [1/2] Starting backend (FastAPI on port 8000)...
start "Sentinel-Backend" cmd /k "cd /d "%~dp0backend" && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo [2/2] Starting frontend (Vite dev server on port 5173)...
start "Sentinel-Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo  Application is starting...
echo  Open: http://localhost:5173
echo.
start http://localhost:5173
