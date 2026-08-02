@echo off
title AI Government Scheme Assistant Launcher
echo Launching Backend API Server and Frontend Application...
start "Backend API (FastAPI)" cmd /k "%~dp0start-backend.bat"
start "Frontend App (Vite)" cmd /k "%~dp0start-frontend.bat"
echo.
echo ===================================================
echo  AI Government Scheme Assistant is starting!
echo ===================================================
echo  Frontend UI:  http://localhost:5173
echo  Backend API:   http://127.0.0.1:8000
echo  Swagger Docs:  http://127.0.0.1:8000/docs
echo ===================================================
