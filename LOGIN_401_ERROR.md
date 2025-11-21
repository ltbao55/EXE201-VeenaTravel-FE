# 🔐 LỖI 401 UNAUTHORIZED - Đăng Nhập Thất Bại

**Lỗi:** `POST /api/auth/login 401 (Unauthorized)`

---

## 📋 TÓM TẮT

**Lỗi 401 Unauthorized** có nghĩa là:

- ✅ Request đã đến được backend (không phải lỗi CORS hay network)
- ✅ URL đúng (`/api/auth/login`)
- ❌ Backend từ chối đăng nhập vì **credentials không hợp lệ**

---

## 🔍 NGUYÊN NHÂN CÓ THỂ

### 1. **Sai Email hoặc Mật khẩu** ⚠️ (Phổ biến nhất)

**Triệu chứng:**

- Console: `401 (Unauthorized)`
- Alert: "Email hoặc mật khẩu không đúng"

**Giải pháp:**

- ✅ Kiểm tra lại email: `admin@gmail.com` có đúng không?
- ✅ Kiểm tra lại mật khẩu: Có nhập đúng không?
- ✅ Thử đăng nhập với tài khoản khác để verify

### 2. **Tài khoản không tồn tại**

**Triệu chứng:**

- Console: `401 (Unauthorized)`
- Backend có thể trả về: "User not found" hoặc "Invalid credentials"

**Giải pháp:**

- ✅ Xác nhận với Backend: Tài khoản `admin@gmail.com` có tồn tại trong database không?
- ✅ Thử đăng ký tài khoản mới trước
- ✅ Kiểm tra Backend có seed data admin user không?

### 3. **Backend Validation Lỗi**

**Triệu chứng:**

- Console: `401 (Unauthorized`
- Backend có thể trả về error message khác

**Giải pháp:**

- ✅ Kiểm tra Backend logs
- ✅ Xác nhận với Backend team về format request mong đợi
- ✅ Kiểm tra Backend có yêu cầu field nào khác không?

### 4. **Password Hash Mismatch**

**Triệu chứng:**

- Email đúng nhưng password không match
- Backend không verify được password

**Giải pháp:**

- ✅ Reset password trong database
- ✅ Hoặc tạo tài khoản mới

---

## ✅ ĐÃ CẢI THIỆN

1. **Error Messages:** Hiển thị thông báo lỗi cụ thể hơn
   - "Email hoặc mật khẩu không đúng" thay vì "Có lỗi xảy ra"
2. **Logging:** Thêm console logs để debug

   - `[AuthService] Attempting login for: ...`
   - `[AuthService] Login response: ...`
   - `[ApiClient] Server error response: ...`

3. **Error Handling:** Không redirect ngay khi 401 trên login endpoint
   - Cho phép hiển thị error message trước khi redirect

---

## 🧪 CÁCH KIỂM TRA

### Bước 1: Xem Console Logs

Sau khi đăng nhập, xem console:

```
[AuthService] Attempting login for: admin@gmail.com
[ApiClient] Server error response: {status: 401, data: {...}}
[AuthService] Login failed: Email hoặc mật khẩu không đúng
```

### Bước 2: Kiểm tra Network Tab

1. Mở DevTools → Tab **Network**
2. Tìm request `POST /api/auth/login`
3. Click vào request
4. Tab **Response** → Xem error message từ backend:

```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

### Bước 3: Test với Backend trực tiếp

Mở Console và chạy:

```javascript
fetch("https://exe-201-veena-travel-be.vercel.app/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "admin@gmail.com",
    password: "your-password-here",
  }),
})
  .then((res) => res.json())
  .then((data) => {
    console.log("Response:", data);
  })
  .catch((err) => console.error("Error:", err));
```

---

## 🛠️ GIẢI PHÁP

### 1. **Kiểm tra Credentials**

- ✅ Email: `admin@gmail.com` có đúng không?
- ✅ Password: Có nhập đúng không? (có thể có typo)
- ✅ Caps Lock: Có bật không?

### 2. **Xác nhận với Backend**

Hỏi Backend team:

- ✅ Tài khoản admin mặc định là gì?
- ✅ Email: `admin@gmail.com` có tồn tại không?
- ✅ Password mặc định là gì?
- ✅ Có cần tạo tài khoản admin mới không?

### 3. **Thử đăng ký tài khoản mới**

Nếu không có tài khoản admin:

1. Đăng ký tài khoản mới
2. Backend cần set role = "admin" cho tài khoản đó
3. Hoặc Backend có endpoint để promote user thành admin

### 4. **Kiểm tra Backend Response**

Xem response từ backend có message cụ thể không:

- "Invalid email or password"
- "User not found"
- "Password incorrect"
- etc.

---

## 📋 CHECKLIST

- [ ] Email có đúng không? (`admin@gmail.com`)
- [ ] Password có đúng không?
- [ ] Console có hiển thị error message cụ thể không?
- [ ] Network tab: Response có error message từ backend không?
- [ ] Backend có tài khoản `admin@gmail.com` không?
- [ ] Backend có seed data admin user không?

---

## 📞 CẦN HỖ TRỢ

Nếu vẫn không đăng nhập được, cung cấp:

1. **Console logs:** Copy/paste tất cả logs từ console
2. **Network tab:** Response từ `/api/auth/login`
3. **Backend info:**
   - Tài khoản admin mặc định là gì?
   - Email và password chính xác?
4. **Backend logs:** Nếu có quyền truy cập

---

## 💡 LƯU Ý

**Lỗi 401 KHÔNG phải do:**

- ❌ CORS (đã fix)
- ❌ URL sai (đã đúng `/api/auth/login`)
- ❌ Network error (request đã đến server)

**Lỗi 401 LÀ do:**

- ✅ Credentials không đúng (email/password sai)
- ✅ Tài khoản không tồn tại
- ✅ Backend validation lỗi
