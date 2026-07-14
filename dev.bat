@echo off
setlocal
set PORT=3000
cd /d "%~dp0"

set PID=
for /f "tokens=5" %%p in ('netstat -aon ^| findstr :%PORT% ^| findstr LISTENING') do set PID=%%p

if defined PID (
    echo Dev server is running, PID %PID% - stopping...
    taskkill /PID %PID% /F >nul 2>&1
    echo Stopped. Port %PORT% is free.
) else (
    echo Starting dev server on port %PORT%...
    start "sum-mun-dev" cmd /k "npm run dev"
    echo Started in a new window. Run this file again to stop.
)

pause
