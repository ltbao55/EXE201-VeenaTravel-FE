@echo off
echo 🚀 Khởi động Backend Server cho Veena Travel...
echo.

cd /d "%~dp0"

echo 📦 Kiểm tra và cài đặt dependencies...
if not exist node_modules (
    echo Installing Node.js dependencies...
    npm install express cors bcryptjs jsonwebtoken nodemon
) else (
    echo Dependencies đã được cài đặt.
)

echo.
echo 🔥 Khởi động server...
echo Server sẽ chạy tại: http://localhost:5001
echo API endpoints: http://localhost:5001/api
echo Health check: http://localhost:5001/api/health
echo.
echo Nhấn Ctrl+C để dừng server
echo.

npm start

pause
