# API Endpoints Documentation

Backend URL: `https://exe-201-veena-travel-be.vercel.app/api`

## Cách kiểm tra API đã deploy

### 1. Sử dụng Browser DevTools

Mở Chrome DevTools (F12) → Tab Network → Thực hiện các thao tác trên app → Xem các requests được gửi đi

### 2. Sử dụng Postman/Insomnia

Import các endpoints dưới đây vào Postman để test

### 3. Sử dụng curl (Terminal)

```bash
# Test health endpoint (nếu có)
curl https://exe-201-veena-travel-be.vercel.app/api/health

# Test một endpoint cụ thể
curl -X GET https://exe-201-veena-travel-be.vercel.app/api/destinations
```

### 4. Truy cập trực tiếp trong browser

Thử các URL sau:

- `https://exe-201-veena-travel-be.vercel.app/api/docs` (Swagger/OpenAPI docs)
- `https://exe-201-veena-travel-be.vercel.app/api/health` (Health check)
- `https://exe-201-veena-travel-be.vercel.app/api/status` (Status check)

---

## Danh sách API Endpoints

### 🔐 Authentication

| Method | Endpoint             | Mô tả                       |
| ------ | -------------------- | --------------------------- |
| POST   | `/api/auth/login`    | Đăng nhập                   |
| POST   | `/api/auth/register` | Đăng ký                     |
| POST   | `/api/auth/logout`   | Đăng xuất                   |
| GET    | `/api/auth/profile`  | Lấy thông tin user hiện tại |
| POST   | `/api/auth/refresh`  | Refresh token               |

**Ví dụ Login:**

```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

### 🗺️ Destinations

| Method | Endpoint                    | Mô tả                      |
| ------ | --------------------------- | -------------------------- |
| GET    | `/api/destinations`         | Lấy danh sách destinations |
| GET    | `/api/destinations/:id`     | Lấy chi tiết destination   |
| GET    | `/api/destinations/search`  | Tìm kiếm destinations      |
| GET    | `/api/destinations/popular` | Lấy destinations phổ biến  |

**Ví dụ:**

```
GET /api/destinations
GET /api/destinations/123
GET /api/destinations/search?q=paris
GET /api/destinations/popular
```

---

### ✈️ Trips

| Method | Endpoint         | Mô tả               |
| ------ | ---------------- | ------------------- |
| GET    | `/api/trips`     | Lấy danh sách trips |
| POST   | `/api/trips`     | Tạo trip mới        |
| GET    | `/api/trips/:id` | Lấy chi tiết trip   |
| PUT    | `/api/trips/:id` | Cập nhật trip       |
| DELETE | `/api/trips/:id` | Xóa trip            |

**Ví dụ:**

```
GET /api/trips
POST /api/trips
GET /api/trips/123
PUT /api/trips/123
DELETE /api/trips/123
```

---

### 💬 Chat

| Method | Endpoint            | Mô tả            |
| ------ | ------------------- | ---------------- |
| POST   | `/api/chat`         | Gửi message      |
| GET    | `/api/chat/history` | Lấy lịch sử chat |

**Ví dụ:**

```
POST /api/chat
{
  "message": "Hello",
  "sessionId": "session123"
}

GET /api/chat/history?sessionId=session123
```

---

### 📝 Chat Sessions

| Method | Endpoint                                | Mô tả                      |
| ------ | --------------------------------------- | -------------------------- |
| GET    | `/api/chat-sessions`                    | Lấy danh sách sessions     |
| GET    | `/api/chat-sessions/:id`                | Lấy chi tiết session       |
| GET    | `/api/chat-sessions/session/:sessionId` | Lấy session theo sessionId |
| GET    | `/api/chat-sessions/user/:userId`       | Lấy sessions của user      |
| POST   | `/api/chat-sessions`                    | Tạo session mới            |
| PUT    | `/api/chat-sessions/:id`                | Cập nhật session           |
| DELETE | `/api/chat-sessions/:id`                | Xóa session                |

**Ví dụ:**

```
GET /api/chat-sessions
GET /api/chat-sessions/123
GET /api/chat-sessions/session/abc123
GET /api/chat-sessions/user/user123
POST /api/chat-sessions
PUT /api/chat-sessions/123
DELETE /api/chat-sessions/123
```

---

### 👤 User

| Method | Endpoint                | Mô tả                |
| ------ | ----------------------- | -------------------- |
| GET    | `/api/user/profile`     | Lấy profile user     |
| PUT    | `/api/user/profile`     | Cập nhật profile     |
| GET    | `/api/user/preferences` | Lấy preferences      |
| PUT    | `/api/user/preferences` | Cập nhật preferences |

**Ví dụ:**

```
GET /api/user/profile
PUT /api/user/profile
{
  "name": "New Name",
  "avatar": "https://..."
}
```

---

### 👥 Users Management (Dashboard - Admin)

| Method | Endpoint         | Mô tả                       |
| ------ | ---------------- | --------------------------- |
| GET    | `/api/users`     | Lấy danh sách users (Admin) |
| POST   | `/api/users`     | Tạo user mới (Admin)        |
| GET    | `/api/users/:id` | Lấy chi tiết user           |
| PUT    | `/api/users/:id` | Cập nhật user               |
| DELETE | `/api/users/:id` | Xóa user                    |

**Lưu ý:** Các endpoints này yêu cầu quyền Admin.

---

### 💳 Payments

| Method | Endpoint                          | Mô tả                 |
| ------ | --------------------------------- | --------------------- |
| POST   | `/api/payments/create`            | Tạo payment           |
| GET    | `/api/payments/info/:orderCode`   | Lấy thông tin payment |
| GET    | `/api/payments/user-payments`     | Lấy payments của user |
| POST   | `/api/payments/cancel/:orderCode` | Hủy payment           |

**Ví dụ:**

```
POST /api/payments/create
{
  "amount": 100000,
  "description": "Premium subscription"
}

GET /api/payments/info/ORDER123
GET /api/payments/user-payments
POST /api/payments/cancel/ORDER123
```

---

## 🔍 Cách test nhanh các endpoints

### Sử dụng script test (tạo file test-api.js)

```javascript
const BASE_URL = "https://exe-201-veena-travel-be.vercel.app/api";

const endpoints = [
  "/auth/login",
  "/auth/register",
  "/destinations",
  "/destinations/popular",
  "/chat-sessions",
  "/payments/user-payments",
];

endpoints.forEach((endpoint) => {
  fetch(`${BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => console.log(`✅ ${endpoint}:`, data))
    .catch((err) => console.error(`❌ ${endpoint}:`, err.message));
});
```

### Sử dụng PowerShell (Windows)

```powershell
# Test một endpoint
Invoke-WebRequest -Uri "https://exe-201-veena-travel-be.vercel.app/api/destinations" -Method GET

# Test với headers
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_TOKEN"
}
Invoke-WebRequest -Uri "https://exe-201-veena-travel-be.vercel.app/api/auth/profile" -Method GET -Headers $headers
```

---

## ⚠️ Lưu ý

1. **CORS**: Backend cần cấu hình CORS để cho phép requests từ frontend
2. **Authentication**: Hầu hết các endpoints yêu cầu token trong header:
   ```
   Authorization: Bearer <token>
   ```
3. **Base URL**: Tất cả endpoints đều có prefix `/api`
4. **Error Response**: Khi có lỗi, response sẽ có format:
   ```json
   {
     "success": false,
     "error": "Error message",
     "message": "Detailed message"
   }
   ```

---

## 📞 Liên hệ

Nếu cần thêm thông tin về API, vui lòng liên hệ với team backend.

