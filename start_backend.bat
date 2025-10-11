@echo off
cd /d "%~dp0"
title Dark Matter Classification - Backend Server
color 0A
echo.
echo ========================================
echo  DARK MATTER CLASSIFICATION BACKEND
echo ========================================
echo.
echo Starting server on http://localhost:5001
echo.
python webapp_backend.py
echo.
echo Server stopped!
pause
