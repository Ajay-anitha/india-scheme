@echo off
title AI Government Scheme Assistant Launcher
echo Launching Backend API Server and Frontend Application...
start "Backend API (FastAPI)" cmd /k "%~dp0start-backend.bat"
start "Frontend App (Vite)" cmd /k "%~dp0start-frontend.bat"
echo.
echo ===================================================
echo  AI Government Scheme Assistant is starting!
echo ===================================================
echo  Opening browser at http://localhost:5173 ...
echo ===================================================
timeout /t 3 /nobreak >nul
start http://localhost:5173

