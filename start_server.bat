@echo off
title CREATIVE MODEL SCHOOL - SQLite Sync Server
setlocal enabledelayedexpansion

:: 1. Check if server.py is in the batch file's directory
set "TARGET_DIR=%~dp0"
if exist "!TARGET_DIR!server.py" (
    cd /d "!TARGET_DIR!"
    goto start_server
)

:: 2. Fallback to default hardcoded path if run from Desktop on the host machine
set "FALLBACK_DIR=H:\My Drive\My Webside\School"
if exist "!FALLBACK_DIR!\server.py" (
    cd /d "!FALLBACK_DIR!"
    goto start_server
)

:: 3. Error if server.py not found in either location
echo ==========================================================
echo [ERROR] server.py was not found!
echo ==========================================================
echo Checked locations:
echo 1. %~dp0 (Batch folder)
echo 2. H:\My Drive\My Webside\School (Default folder)
echo.
echo Suggestions:
echo - If you want a launcher on your Desktop, please create a SHORTCUT
echo   to the batch file inside the School folder instead of copying it.
echo.
pause
exit /b

:start_server
:: Kill any process currently using port 8000 to avoid "address already in use" errors
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo ==========================================================
echo    CREATIVE MODEL SCHOOL - SQLite Sync Server Launcher
echo ==========================================================
echo.
echo Server is launching...
echo Database File: school.db
echo.
echo To access the website:
echo - From this computer: http://localhost:8000
echo - From other computers: Use the host computer's IP address (e.g., http://192.168.x.x:8000)
echo.
echo Keep this window open to keep the server running.
echo.

:loop
python server.py
echo.
echo [WARNING] Server stopped or crashed unexpectedly!
echo Restarting in 3 seconds...
timeout /t 3 >nul
echo.
echo Restarting Server...
goto loop
