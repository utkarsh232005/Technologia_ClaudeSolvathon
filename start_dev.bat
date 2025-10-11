@echo off
echo ========================================
echo Dark Matter Classification System
echo Starting Backend and Frontend Together
echo ========================================
echo.

REM Start Backend Server
echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0 && color 0A && python webapp_backend.py"
timeout /t 3 /nobreak >nul

REM Start Frontend Development Server
echo [2/2] Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d %~dp0webapp && color 0B && npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend: http://localhost:5001
echo Frontend: http://localhost:5173
echo.
echo Close this window to stop watching.
echo Press any key to exit this launcher...
pause >nul
