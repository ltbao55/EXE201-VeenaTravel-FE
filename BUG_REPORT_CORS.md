# 🐛 BÁO CÁO LỖI: 404 Not Found - Endpoints Không Tồn Tại

**Ngày báo cáo:** $(date)  
**Frontend URL:** `http://localhost:5173`  
**Backend URL:** `https://exe-201-veena-travel-be.vercel.app`  
**Môi trường:** Development (Vite Dev Server)

---

## 📋 TÓM TẮT VẤN ĐỀ

**✅ CORS ĐÃ ĐƯỢC FIX** - Requests đã đến được server  
**❌ LỖI MỚI: 404 Not Found** - Endpoints không tồn tại trên server

Frontend đang gọi các endpoints nhưng nhận được lỗi **404 (Not Found)** với thông báo "The requested endpoint does not exist". Điều này cho thấy:

- ✅ CORS đã được cấu hình đúng (requests đã đến được server)
- ❌ Endpoints không tồn tại hoặc URL không đúng

### 🔍 PHÂN TÍCH LỖI

**Lỗi hiện tại: 404 Not Found**

- `GET https://exe-201-veena-travel-be.vercel.app/auth/profile` → **404**
- `POST https://exe-201-veena-travel-be.vercel.app/auth/login` → **404**
- Error message: "The requested endpoint does not exist"

**Nguyên nhân có thể:**

1. **Backend endpoints không có prefix `/api`**

   - Frontend đang gọi: `https://exe-201-veena-travel-be.vercel.app/auth/login`
   - Nhưng có thể backend routes là: `https://exe-201-veena-travel-be.vercel.app/api/auth/login`

2. **Hoặc ngược lại: Backend có prefix `/api` nhưng frontend đang gọi sai**

   - Frontend config: `BASE_URL = "https://exe-201-veena-travel-be.vercel.app/api"`
   - Nhưng actual requests: `https://exe-201-veena-travel-be.vercel.app/auth/login` (thiếu `/api`)

3. **Backend chưa deploy hoặc routes chưa được định nghĩa**

---

## 🔴 CÁC LỖI CHI TIẾT

### 1. **404 Not Found - Auth Profile Endpoint**

**Thông báo lỗi:**

```
GET https://exe-201-veena-travel-be.vercel.app/auth/profile
Status: 404 (Not Found)
Error: The requested endpoint does not exist
```

**Call Stack:**

- `api.ts:114` - Request được gửi đi
- `AuthService.getCurrentUser` (authService.ts:39:13)
- `AuthContext.tsx:107` - Auth check failed

**Nguyên nhân:**

- Endpoint `/auth/profile` không tồn tại trên backend
- Hoặc URL không đúng (thiếu prefix `/api`?)

---

### 2. **404 Not Found - Auth Login Endpoint**

**Thông báo lỗi:**

```
POST https://exe-201-veena-travel-be.vercel.app/auth/login
Status: 404 (Not Found)
Error: The requested endpoint does not exist
```

**Call Stack:**

- `api.ts:114` - Request được gửi đi
- `AuthService.login` (authService.ts:14:13)
- `login` (AuthContext.tsx:143:24)
- `handleSubmit` (AuthModal.tsx:37:9)

**Nguyên nhân:**

- Endpoint `/auth/login` không tồn tại trên backend
- Hoặc URL không đúng (thiếu prefix `/api`?)

---

### 3. **Authentication Check Failed**

**Thông báo lỗi:**

```
Auth check failed, user may not be authenticated:
Error: The requested endpoint does not exist
```

**Nguyên nhân:**

- Không thể gọi API `/auth/profile` do endpoint không tồn tại (404)

---

### 4. **Login Failed**

**Thông báo lỗi:**

```
Login failed: Error: The requested endpoint does not exist
Auth error: Error: The requested endpoint does not exist
```

**Nguyên nhân:**

- Không thể gửi POST request đến `/auth/login` do endpoint không tồn tại (404)

---

## 🔍 PHÂN TÍCH KỸ THUẬT

### Request Details

**Frontend Configuration:**

```typescript
// src/config/api.ts
BASE_URL: "https://exe-201-veena-travel-be.vercel.app/api";
```

**Actual Request URLs:**

- `POST https://exe-201-veena-travel-be.vercel.app/auth/login`
- `GET https://exe-201-veena-travel-be.vercel.app/auth/profile`

**Lưu ý:** Frontend đang gọi trực tiếp đến domain backend (không có `/api` prefix), trong khi theo documentation, backend URL nên là `https://exe-201-veena-travel-be.vercel.app/api`.

### Headers được gửi từ Frontend

```http
Content-Type: application/json
Authorization: Bearer <token> (nếu có)
Origin: http://localhost:5173
```

### Preflight Request (OPTIONS)

Browser tự động gửi preflight request trước khi gửi actual request. Backend cần trả về:

```http
OPTIONS /auth/login HTTP/1.1
Host: exe-201-veena-travel-be.vercel.app
Origin: http://localhost:5173
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type,authorization
```

**Response cần có:**

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

---

## ✅ GIẢI PHÁP ĐỀ XUẤT

### 🔍 BƯỚC 1: XÁC ĐỊNH ĐÚNG URL ENDPOINTS

**Cần xác nhận với Backend Team:**

1. **Backend có prefix `/api` hay không?**

   ```bash
   # Test với /api prefix
   curl -X GET https://exe-201-veena-travel-be.vercel.app/api/auth/profile
   curl -X POST https://exe-201-veena-travel-be.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"test"}'

   # Test không có /api prefix
   curl -X GET https://exe-201-veena-travel-be.vercel.app/auth/profile
   curl -X POST https://exe-201-veena-travel-be.vercel.app/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"test"}'
   ```

2. **Kiểm tra base URL thực tế:**

   - Frontend config hiện tại: `https://exe-201-veena-travel-be.vercel.app/api`
   - Actual requests đang gọi: `https://exe-201-veena-travel-be.vercel.app/auth/login` (thiếu `/api`)
   - **Cần xác nhận:** Backend routes thực sự là gì?

3. **Kiểm tra Swagger/API Documentation:**
   - Backend có Swagger docs không? (thường ở `/api/docs` hoặc `/docs`)
   - Xem chính xác các endpoints được định nghĩa như thế nào

### 🔧 BƯỚC 2: FIX FRONTEND (Nếu cần)

**Nếu backend không có prefix `/api`:**

Cần tạo file `.env` trong thư mục gốc:

```env
VITE_API_BASE_URL=https://exe-201-veena-travel-be.vercel.app
```

**Nếu backend có prefix `/api`:**

Đảm bảo file `.env` có:

```env
VITE_API_BASE_URL=https://exe-201-veena-travel-be.vercel.app/api
```

Sau đó restart dev server.

---

## ✅ GIẢI PHÁP CHO BACKEND (Nếu cần)

### 1. **Cấu hình CORS Middleware** (Đã được fix - không cần làm nữa)

Backend cần cấu hình CORS để cho phép requests từ frontend:

**Ví dụ với Express.js:**

```javascript
const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite dev server
      "http://localhost:3000", // Alternative dev port
      "https://your-production-domain.com", // Production domain
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
    maxAge: 86400, // 24 hours
  })
);
```

**Ví dụ với FastAPI (Python):**

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://your-production-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=86400
)
```

### 2. **Xử lý Preflight Requests (OPTIONS)**

Backend cần xử lý OPTIONS requests đúng cách:

```javascript
// Express.js example
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Max-Age", "86400");
  res.sendStatus(200);
});
```

### 3. **Vấn đề URL - Cần Xác Nhận**

**⚠️ PHÁT HIỆN:**

Từ console log và lỗi 404, có sự không khớp về URL:

**Frontend Configuration:**

```typescript
// src/config/environment.ts
API_BASE_URL: "https://exe-201-veena-travel-be.vercel.app/api";
```

**Actual Requests đang gọi (từ console log):**

- `POST https://exe-201-veena-travel-be.vercel.app/auth/login` ❌ (404)
- `GET https://exe-201-veena-travel-be.vercel.app/auth/profile` ❌ (404)

**Phân tích:**

- Requests đang gọi **KHÔNG có prefix `/api`**
- Nhưng config có `/api`
- Có thể environment variable `VITE_API_BASE_URL` không được set hoặc set sai

**Cần kiểm tra:**

1. Có file `.env` trong thư mục gốc không?
2. Giá trị `VITE_API_BASE_URL` trong `.env` là gì?
3. Backend thực sự có prefix `/api` hay không?

**Đề xuất test:**

```bash
# Test với /api prefix
curl -X POST https://exe-201-veena-travel-be.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'

# Test không có /api prefix
curl -X POST https://exe-201-veena-travel-be.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

### 4. **Health Check Endpoint**

Đề xuất thêm endpoint để test nhanh:

```bash
# Test health check
curl https://exe-201-veena-travel-be.vercel.app/api/health
# hoặc
curl https://exe-201-veena-travel-be.vercel.app/health
```

Response mong đợi:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## 🧪 CÁCH KIỂM TRA

### 1. **Test với curl (Terminal)**

```bash
# Test preflight request
curl -X OPTIONS https://exe-201-veena-travel-be.vercel.app/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v

# Kiểm tra headers trong response
# Cần thấy: Access-Control-Allow-Origin, Access-Control-Allow-Methods, etc.
```

### 2. **Test với Browser DevTools**

1. Mở Chrome DevTools (F12)
2. Tab Network
3. Thực hiện login trên frontend
4. Xem request `OPTIONS /auth/login` (preflight)
5. Kiểm tra Response Headers có `Access-Control-Allow-Origin` không

### 3. **Test với Postman**

```http
OPTIONS https://exe-201-veena-travel-be.vercel.app/auth/login
Headers:
  Origin: http://localhost:5173
  Access-Control-Request-Method: POST
  Access-Control-Request-Headers: content-type
```

---

## 📝 THÔNG TIN BỔ SUNG

### Frontend Code References

**API Client Configuration:**

- File: `src/config/api.ts`
- Base URL: `https://exe-201-veena-travel-be.vercel.app/api`
- Timeout: 60000ms (60 seconds)

**Request Implementation:**

- File: `src/services/api.ts`
- Sử dụng Axios với interceptors
- Tự động thêm `Authorization: Bearer <token>` header

**Authentication Service:**

- File: `src/services/authService.ts`
- Endpoints sử dụng: `/auth/login`, `/auth/profile`

### Environment Variables

```env
VITE_API_BASE_URL=https://exe-201-veena-travel-be.vercel.app/api
```

---

## 🎯 CHECKLIST CHO BACKEND TEAM

### ✅ Đã Hoàn Thành (CORS)

- [x] Cấu hình CORS middleware với origin `http://localhost:5173` ✅
- [x] Xử lý OPTIONS requests (preflight) đúng cách ✅
- [x] Trả về header `Access-Control-Allow-Origin` trong responses ✅

### ❌ Cần Xác Nhận (404 Errors)

- [ ] **Xác nhận base URL:** Backend có prefix `/api` hay không?
- [ ] **Kiểm tra endpoints:** Các routes sau có tồn tại không?
  - `POST /auth/login` hoặc `POST /api/auth/login`?
  - `GET /auth/profile` hoặc `GET /api/auth/profile`?
- [ ] **Cung cấp API documentation:** Swagger/OpenAPI docs URL?
- [ ] **Test endpoints:** Verify các endpoints hoạt động với curl/Postman
- [ ] **Health check:** Có endpoint `/health` hoặc `/api/health` để test không?

### 📋 Thông Tin Cần Cung Cấp

- [ ] Base URL chính xác của backend
- [ ] Danh sách đầy đủ các endpoints (có hoặc không có prefix `/api`)
- [ ] API documentation URL (nếu có)

---

## 📞 LIÊN HỆ

Nếu cần thêm thông tin hoặc có câu hỏi, vui lòng liên hệ:

- Frontend Team
- Issue: CORS blocking all API requests from `http://localhost:5173`

---

## 📎 FILES LIÊN QUAN

- `src/config/api.ts` - API configuration
- `src/services/api.ts` - API client implementation
- `src/services/authService.ts` - Authentication service
- `src/context/AuthContext.tsx` - Auth context với error handling
- `API_ENDPOINTS.md` - API documentation

---

---

## 📊 TÓM TẮT NHANH

### ✅ Đã Fix

- **CORS:** Backend đã cấu hình CORS đúng, requests đã đến được server

### ❌ Lỗi Hiện Tại

- **404 Not Found:** Endpoints không tồn tại hoặc URL không đúng
  - `POST /auth/login` → 404
  - `GET /auth/profile` → 404

### 🔍 NGUYÊN NHÂN ĐÃ XÁC ĐỊNH

**✅ Đã tìm ra nguyên nhân:**

1. **Backend endpoints:** Tất cả đều có prefix `/api` (đã xác nhận từ API docs)

   - `POST /api/auth/login` ✅
   - `GET /api/auth/profile` ✅
   - `POST /api/auth/register` ✅

2. **File `.env` hiện tại:** `VITE_API_BASE_URL=exe-201-veena-travel-be.vercel.app`

   - ❌ **THIẾU `/api`** → Đây là nguyên nhân chính!
   - ❌ Thiếu `https://` (nhưng code sẽ tự thêm)

3. **Kết quả:** Frontend đang gọi `https://exe-201-veena-travel-be.vercel.app/auth/login` (thiếu `/api`)

### ✅ GIẢI PHÁP (FIX NGAY)

**Sửa file `.env` trong thư mục gốc:**

```env
# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=AIzaSyB3Neqq7RmYZDEwtsbRww9idoZm0nwDD6E

# Backend API URL
# ⚠️ QUAN TRỌNG: Phải có prefix /api
VITE_API_BASE_URL=https://exe-201-veena-travel-be.vercel.app/api

# Environment
VITE_NODE_ENV=development
```

**Sau đó:**

1. **Restart dev server** (Ctrl+C và chạy lại `npm run dev`)
2. **Test lại login** → Sẽ hoạt động!

---

**Lưu ý:** Sau khi fix `.env` và restart server, frontend sẽ hoạt động bình thường.
