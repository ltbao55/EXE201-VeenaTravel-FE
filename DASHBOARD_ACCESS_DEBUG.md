# 🔍 HƯỚNG DẪN DEBUG: Không thể truy cập Dashboard

**Vấn đề:** Không thể đăng nhập vào dashboard mặc dù đã đăng nhập bằng tài khoản admin

---

## ✅ ĐÃ CẢI THIỆN

1. **ProtectedRoute:** Luôn fetch role từ backend khi kiểm tra admin
2. **Logging:** Thêm console logs để debug
3. **Error handling:** Cải thiện xử lý lỗi

---

## 🔍 CÁCH KIỂM TRA

### Bước 1: Đăng nhập lại và xem Console

1. Mở Chrome DevTools (F12)
2. Tab **Console**
3. Đăng nhập bằng tài khoản admin
4. Xem các logs:

```
[AuthService] Fetching current user from: /auth/profile
[AuthService] getCurrentUser response: {...}
[AuthService] User data: {...}
[AuthService] User role: "admin" hoặc undefined
[AuthContext] Login response: {...}
[AuthContext] User role: "admin" hoặc undefined
```

### Bước 2: Thử truy cập Dashboard

1. Sau khi đăng nhập, thử truy cập `/dashboard`
2. Xem console logs:

```
[ProtectedRoute] Fetching user role from backend...
[ProtectedRoute] Backend user data: {...}
[ProtectedRoute] User role: "admin" hoặc undefined
[ProtectedRoute] Checking admin access. User role: ...
[ProtectedRoute] Access denied. User role is not admin: ...
```

### Bước 3: Kiểm tra API Response

Mở tab **Network** trong DevTools:

1. Tìm request `GET /api/auth/profile`
2. Click vào request
3. Tab **Response** → Xem response JSON
4. Kiểm tra có field `role: "admin"` không

**Response mong đợi:**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "admin" // ← QUAN TRỌNG: Phải có field này
  }
}
```

---

## 🐛 CÁC VẤN ĐỀ CÓ THỂ

### 1. **API không trả về role**

**Triệu chứng:**

- Console log: `[AuthService] User role: undefined`
- Response không có field `role`

**Giải pháp:**

- Kiểm tra Backend API `/api/auth/profile` có trả về `role` không
- Xác nhận với Backend team về response format

### 2. **Role không phải "admin"**

**Triệu chứng:**

- Console log: `[AuthService] User role: "user"`
- Response có `role: "user"` thay vì `"admin"`

**Giải pháp:**

- Kiểm tra database: User có role = "admin" không?
- Backend có set role đúng khi login không?

### 3. **Token không hợp lệ**

**Triệu chứng:**

- Console log: `[AuthService] getCurrentUser response: {success: false, error: "..."}`
- Network tab: 401 Unauthorized

**Giải pháp:**

- Đăng xuất và đăng nhập lại
- Kiểm tra token trong localStorage: `localStorage.getItem("authToken")`

### 4. **ProtectedRoute không fetch role**

**Triệu chứng:**

- Console không có log `[ProtectedRoute] Fetching user role from backend...`
- Hoặc có log nhưng `userRole` vẫn undefined

**Giải pháp:**

- Kiểm tra `user` object có tồn tại không
- Kiểm tra `isAuthenticated` có true không

---

## 🛠️ TEST THỦ CÔNG

### Test 1: Kiểm tra API trực tiếp

Mở Console và chạy:

```javascript
// Lấy token
const token = localStorage.getItem("authToken");
console.log("Token:", token);

// Test API call
fetch("https://exe-201-veena-travel-be.vercel.app/api/auth/profile", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
})
  .then((res) => res.json())
  .then((data) => {
    console.log("API Response:", data);
    console.log("User role:", data.data?.role);
  })
  .catch((err) => console.error("Error:", err));
```

### Test 2: Kiểm tra User Object

```javascript
// Trong Console
const userData = JSON.parse(localStorage.getItem("userData") || "{}");
console.log("Stored user:", userData);
console.log("User role:", userData.role);
```

---

## 📋 CHECKLIST DEBUG

- [ ] Console có log `[AuthService] User role: "admin"` sau khi login?
- [ ] Network tab: Response từ `/api/auth/profile` có `role: "admin"`?
- [ ] Console có log `[ProtectedRoute] User role: "admin"` khi truy cập dashboard?
- [ ] `localStorage.getItem("userData")` có chứa `role: "admin"`?
- [ ] Token có hợp lệ? (không expired, không null)

---

## ✅ GIẢI PHÁP TẠM THỜI

Nếu Backend chưa trả về role, có thể hardcode tạm thời để test:

**⚠️ CHỈ DÙNG ĐỂ TEST, KHÔNG COMMIT:**

```typescript
// src/components/ProtectedRoute.tsx
// Tạm thời: Nếu không có role, check email
if (requireAdmin) {
  const role = userRole || user?.role;
  const isAdminEmail =
    user?.email?.includes("admin") || user?.email === "admin@example.com";

  if (role !== "admin" && !isAdminEmail) {
    return <Navigate to="/" replace />;
  }
}
```

---

## 📞 CẦN HỖ TRỢ

Nếu vẫn không hoạt động, cung cấp:

1. Console logs (copy/paste)
2. Network tab: Response từ `/api/auth/profile`
3. localStorage: `userData` và `authToken`
4. Backend API documentation về `/api/auth/profile` response format
