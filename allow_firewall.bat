@echo off
title Allow Port 8000 in Windows Firewall
chcp 65001 >nul
echo =================================================================
echo  Opening Port 8000 in Windows Firewall for School Management Server
echo =================================================================
echo.

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Requesting Administrator Privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

netsh advfirewall firewall delete rule name="School Server HTTP2 (Port 8000)" >nul 2>&1
netsh advfirewall firewall add rule name="School Server HTTP2 (Port 8000)" dir=in action=allow protocol=TCP localport=8000 >nul 2>&1
netsh advfirewall firewall add rule name="School Server HTTP3 UDP (Port 8000)" dir=in action=allow protocol=UDP localport=8000 >nul 2>&1

echo [+] Port 8000 (TCP & UDP) successfully allowed in Windows Firewall!
echo [+] Devices on your local Wi-Fi / LAN can now connect to:
echo     https://%1:8000 (or https://[Your-PC-IP]:8000)
echo.
pause
