@echo off
title Launching ResQMesh AI
echo ========================================================
echo  Launching ResQMesh AI (Build With Bharat 5.0)
echo ========================================================
echo.
echo [1/2] Starting Backend API Server on Port 5000...
start "ResQMesh AI - Backend Server" cmd /k "cd /d %~dp0backend && npm.cmd run dev"

echo [2/2] Starting Frontend Client on Port 3000...
start "ResQMesh AI - Frontend Client" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo.
echo Waiting 3 seconds for servers to initialize...
timeout /t 3 /nobreak >nul

echo Opening ResQMesh AI in your default browser...
start http://localhost:3000

echo.
echo Both servers are now running in separate windows!
echo Keep those windows open while testing or presenting.
echo ========================================================
