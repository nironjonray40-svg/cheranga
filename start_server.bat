@echo off
title School Management System - Fast Local Server
chcp 65001 >nul

REM =============================================================================
REM [1] Set Project Directory & Database File Location
REM =============================================================================
REM Project Folder Location:
set "DEFAULT_PROJECT_DIR=C:\Users\niron\OneDrive\Desktop\School2"

REM Check current folder or fallback to default project location:
if exist "%~dp0server.py" (
    cd /d "%~dp0"
    set "PROJECT_DIR=%CD%"
) else (
    cd /d "%DEFAULT_PROJECT_DIR%"
    set "PROJECT_DIR=%DEFAULT_PROJECT_DIR%"
)

REM Database File Location:
set "SCHOOL_DB_PATH=C:\Users\niron\OneDrive\Desktop\School2\school.db"

REM Dynamic fallback for database:
if not exist "%SCHOOL_DB_PATH%" (
    set "SCHOOL_DB_PATH=%PROJECT_DIR%\school.db"
)

if not exist "%PROJECT_DIR%\server.py" (
    color 0C
    echo =================================================================
    echo  [ERROR] Project directory / server.py not found!
    echo  Target Path: "%PROJECT_DIR%"
    echo =================================================================
    echo.
    pause
    exit /b 1
)

REM =============================================================================
REM [2] Locate Python Environment (.venv, System PATH, or Default Install Folders)
REM =============================================================================
set "PY_CMD="

if exist "%PROJECT_DIR%\.venv\Scripts\python.exe" (
    set "PY_CMD=%PROJECT_DIR%\.venv\Scripts\python.exe"
)

if not defined PY_CMD (
    where python >nul 2>nul
    if %errorlevel% equ 0 (
        set "PY_CMD=python"
    )
)

if not defined PY_CMD (
    where py >nul 2>nul
    if %errorlevel% equ 0 (
        set "PY_CMD=py"
    )
)

if not defined PY_CMD (
    where python3 >nul 2>nul
    if %errorlevel% equ 0 (
        set "PY_CMD=python3"
    )
)

if not defined PY_CMD (
    if exist "%LocalAppData%\Programs\Python\Python313\python.exe" set "PY_CMD=%LocalAppData%\Programs\Python\Python313\python.exe"
    if exist "%LocalAppData%\Programs\Python\Python312\python.exe" set "PY_CMD=%LocalAppData%\Programs\Python\Python312\python.exe"
    if exist "%LocalAppData%\Programs\Python\Python311\python.exe" set "PY_CMD=%LocalAppData%\Programs\Python\Python311\python.exe"
    if exist "%LocalAppData%\Programs\Python\Python310\python.exe" set "PY_CMD=%LocalAppData%\Programs\Python\Python310\python.exe"
    if exist "%LocalAppData%\Programs\Python\Python39\python.exe" set "PY_CMD=%LocalAppData%\Programs\Python\Python39\python.exe"
    if exist "%ProgramFiles%\Python313\python.exe" set "PY_CMD=%ProgramFiles%\Python313\python.exe"
    if exist "%ProgramFiles%\Python312\python.exe" set "PY_CMD=%ProgramFiles%\Python312\python.exe"
    if exist "%ProgramFiles%\Python311\python.exe" set "PY_CMD=%ProgramFiles%\Python311\python.exe"
    if exist "%ProgramFiles%\Python310\python.exe" set "PY_CMD=%ProgramFiles%\Python310\python.exe"
    if exist "C:\Python313\python.exe" set "PY_CMD=C:\Python313\python.exe"
    if exist "C:\Python312\python.exe" set "PY_CMD=C:\Python312\python.exe"
    if exist "C:\Python311\python.exe" set "PY_CMD=C:\Python311\python.exe"
    if exist "C:\Python310\python.exe" set "PY_CMD=C:\Python310\python.exe"
)

if not defined PY_CMD (
    color 0C
    echo =================================================================
    echo  [ERROR] Python is not installed or not found on this computer!
    echo  Please install Python from https://www.python.org/
    echo =================================================================
    echo.
    echo  Current Folder: "%PROJECT_DIR%"
    echo  Direct HTML   : "%PROJECT_DIR%\Home.html"
    echo.
    pause
    exit /b 1
)

REM =============================================================================
REM [3] Launch Smart Dashboard and High-Speed Server
REM =============================================================================
echo =================================================================
echo  AL-HAJ MOBARAK HOSSAIN ANIRBAN BYDDA TIRTHA M,L HIGH SCHOOL
echo  Ultra Fast Local Server (100%% Zero-Warning on Mobile ^& PC)
echo  Project Path  : %PROJECT_DIR%
echo  Database Path : %SCHOOL_DB_PATH%
echo  Python Path   : %PY_CMD%
echo =================================================================
echo.

"%PY_CMD%" launcher.py
