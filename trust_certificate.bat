@echo off
title Install Local School Server SSL Certificate (1-Click Trust)
chcp 65001 >nul
cd /d "%~dp0"

echo =================================================================
echo  AL-HAJ MOBARAK HOSSAIN ANIRBAN BYDDA TIRTHA M,L HIGH SCHOOL
echo       SSL CERTIFICATE 1-CLICK TRUST INSTALLER
echo =================================================================
echo.

if not exist "%~dp0cert.pem" (
    color 0C
    echo [!] ERROR: cert.pem not found in folder.
    echo Please run start_server.bat once to generate cert.pem first.
    echo.
    pause
    exit /b 1
)

echo [*] Adding cert.pem to Windows Trusted Root Authorities...
echo [*] If Windows shows a security prompt asking "Do you want to install this certificate?", click [Yes].
echo.

certutil -addstore -user "ROOT" "%~dp0cert.pem"

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo =================================================================
    echo  [SUCCESS] Certificate installed and trusted by Windows & Browsers!
    echo  - Chrome, Edge, and other browsers will now show [Secure Connection].
    echo  - The warning "Your connection isn't private" will NO LONGER appear.
    echo =================================================================
) else (
    color 0C
    echo.
    echo [!] Installation encountered an issue. Please run as Administrator or install manually.
)

echo.
pause
