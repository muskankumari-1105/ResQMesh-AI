Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Launching ResQMesh AI (Build With Bharat 5.0)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "`n[1/2] Starting Backend Server (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\backend'; npm.cmd run dev"

Write-Host "[2/2] Starting Frontend Client (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\frontend'; npm.cmd run dev"

Start-Sleep -Seconds 3

Write-Host "`nOpening http://localhost:3000 in your browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`nBoth servers are running in separate windows. Keep them open!" -ForegroundColor Green
