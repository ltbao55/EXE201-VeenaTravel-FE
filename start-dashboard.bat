@echo off
echo ========================================
echo    VeenaTravel Dashboard Server
echo ========================================
echo.
echo Khoi dong server localhost...
echo.

REM Kiem tra Python co cai dat khong
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python khong duoc cai dat!
    echo Vui long cai dat Python tu https://python.org
    pause
    exit /b 1
)

REM Chay server
python server.py

pause
