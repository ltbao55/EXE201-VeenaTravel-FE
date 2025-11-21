# Environment Setup Guide

## Tạo file .env cho Frontend

Tạo file `.env` trong thư mục gốc của project (cùng cấp với `package.json`) với nội dung:

```env
# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_GOOGLE_MAPS_API_KEY_HERE

# Backend API URL
# Development: http://localhost:5001/api
# Production: https://api.veenatravel.online/api (hoặc URL backend thực tế của bạn)
VITE_API_BASE_URL=https://api.veenatravel.online/api

# Environment
VITE_NODE_ENV=development
```

## Cách lấy Google Maps API Key

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Bật **Maps JavaScript API**
4. Tạo **API Key** trong **Credentials**
5. Thay thế `YOUR_ACTUAL_GOOGLE_MAPS_API_KEY_HERE` bằng API key thật

## Lưu ý

- File `.env` sẽ không được commit vào Git (đã có trong `.gitignore`)
- Tất cả biến môi trường trong Vite phải bắt đầu bằng `VITE_`
- Sau khi tạo file `.env`, restart lại dev server

## Kiểm tra

Sau khi tạo file `.env`, bạn có thể kiểm tra trong console:

- Nếu thấy "Using Google Maps API key from environment" → Thành công
- Nếu thấy "Fetching Google Maps API key from backend..." → Đang fallback về backend
