# 🎯 PROMPT TÍCH HỢP PAYMENT - VEENATRAVEL FRONTEND

## 📋 TỔNG QUAN DỰ ÁN

### **Dự án**: VeenaTravel - Ứng dụng Du lịch AI

### **Backend**: Node.js + Express.js (Port 5001)

### **Payment Gateway**: PayOS

### **Database**: MongoDB + Pinecone

---

## 🔐 AUTHENTICATION

### **Yêu cầu**

Tất cả API Payment đều yêu cầu **JWT Bearer Token** trong header:

```javascript
Authorization: Bearer <jwt_token>
```

### **Lấy Token**

```javascript
// Sau khi đăng nhập
const response = await fetch("http://localhost:5001/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

const { data } = await response.json();
const token = data.token; // Lưu token này để dùng cho các API

// Sử dụng token
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};
```

---

## 💳 API PAYMENT ENDPOINTS

### **Base URL**: `http://localhost:5001/api/payments`

---

### **1. TẠO LINK THANH TOÁN**

#### Endpoint

```http
POST /api/payments/create
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body

```typescript
{
  amount: number;           // Số tiền (VND)
  description: string;       // Mô tả (tự động cắt nếu > 25 ký tự)
  items: Array<{            // Danh sách sản phẩm
    name: string;           // Tên sản phẩm
    quantity: number;      // Số lượng
    price: number;         // Giá (VND)
  }>;
  metadata?: {               // Optional: Thêm thông tin
    [key: string]: any;
  };
}
```

#### Example Request

```javascript
const createPayment = async (orderData) => {
  const response = await fetch("http://localhost:5001/api/payments/create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: 100000,
      description: "Gói du lịch HCM 2 ngày 1 đêm",
      items: [
        {
          name: "Gói Du lịch Premium",
          quantity: 1,
          price: 100000,
        },
      ],
      metadata: {
        tripType: "premium",
        duration: "2 days",
      },
    }),
  });

  return await response.json();
};
```

#### Response Success

```json
{
  "success": true,
  "message": "Payment link created successfully",
  "data": {
    "orderCode": 123456,
    "checkoutUrl": "https://pay.payos.vn/web/...",
    "amount": 100000,
    "description": "Gói du lịch HCM 2...",
    "expiresAt": "2024-01-20T10:15:00.000Z",
    "status": "pending"
  }
}
```

#### Response Error

```json
{
  "success": false,
  "message": "Amount, description, and items are required"
}
```

#### ⚠️ Lưu ý quan trọng

- `description` tự động cắt về "..." nếu > 25 ký tự
- Link thanh toán hết hạn sau **15 phút**
- Sau khi tạo link, redirect user đến `checkoutUrl`

---

### **2. LẤY THÔNG TIN THANH TOÁN**

#### Endpoint

```http
GET /api/payments/info/:orderCode
Authorization: Bearer <token>
```

#### Example

```javascript
const getPaymentInfo = async (orderCode) => {
  const response = await fetch(
    `http://localhost:5001/api/payments/info/${orderCode}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await response.json();
};
```

#### Response

```json
{
  "success": true,
  "data": {
    "orderCode": 123456,
    "amount": 100000,
    "description": "...",
    "status": "paid",  // pending | paid | cancelled | failed | expired
    "items": [...],
    "customer": {
      "userId": "...",
      "email": "user@example.com",
      "name": "Nguyễn Văn A"
    },
    "checkoutUrl": "...",
    "paidAt": "2024-01-20T10:00:00.000Z",
    "transactionInfo": {
      "reference": "...",
      "accountNumber": "...",
      "counterAccountBankName": "Vietcombank"
    }
  }
}
```

---

### **3. DANH SÁCH THANH TOÁN CỦA USER**

#### Endpoint

```http
GET /api/payments/user-payments?page=1&limit=10&status=pending
Authorization: Bearer <token>
```

#### Query Parameters

- `page`: số trang (mặc định: 1)
- `limit`: số items/page (mặc định: 10)
- `status`: lọc theo trạng thái (`pending` | `paid` | `cancelled` | `failed` | `expired`)

#### Example

```javascript
const getUserPayments = async (page = 1, status = null) => {
  const params = new URLSearchParams({ page, limit: 10 });
  if (status) params.append("status", status);

  const response = await fetch(
    `http://localhost:5001/api/payments/user-payments?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await response.json();
};
```

#### Response

```json
{
  "success": true,
  "data": [
    // Array of payment objects
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50,
    "limit": 10
  }
}
```

---

### **4. HỦY THANH TOÁN**

#### Endpoint

```http
POST /api/payments/cancel/:orderCode
Authorization: Bearer <token>
```

#### Example

```javascript
const cancelPayment = async (orderCode) => {
  const response = await fetch(
    `http://localhost:5001/api/payments/cancel/${orderCode}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await response.json();
};
```

#### Response

```json
{
  "success": true,
  "message": "Payment cancelled successfully"
}
```

#### ⚠️ Điều kiện hủy

- Chỉ có thể hủy khi `status === 'pending'`
- User phải là chủ sở hữu của thanh toán

---

### **5. THỐNG KÊ THANH TOÁN (Admin)**

#### Endpoint

```http
GET /api/payments/stats
Authorization: Bearer <token>
```

#### Response

```json
{
  "success": true,
  "data": {
    "totalPayments": 1000,
    "paidPayments": 800,
    "pendingPayments": 50,
    "cancelledPayments": 100,
    "failedPayments": 50,
    "totalAmount": 500000000,
    "monthlyStats": [
      {
        "_id": { "year": 2024, "month": 1 },
        "count": 200,
        "totalAmount": 100000000
      }
    ]
  }
}
```

---

## 🔄 LUỒNG THANH TOÁN

### **Flow 1: Traditional Redirect (Redirect sang PayOS)**

```javascript
// 1. Tạo link thanh toán
const response = await createPayment({
  amount: 100000,
  description: "Gói du lịch Premium",
  items: [{ name: "Package", quantity: 1, price: 100000 }],
});

// 2. Redirect user đến PayOS
if (response.success) {
  window.location.href = response.data.checkoutUrl;
}

// 3. User thanh toán tại PayOS
// 4. PayOS redirect về returnUrl với params
// 5. Handle return URL
```

### **Flow 2: Embedded Checkout (Nhúng PayOS vào trang)**

```javascript
// 1. Tạo link thanh toán (giống Flow 1)
const response = await createPayment({...});

// 2. Nhúng PayOS checkout vào trang
// Sử dụng PayOS Checkout Script
<script src="https://cdn.payos.vn/payos-checkout/v1/stable/payos-initialize.js"></script>

// 3. Khởi tạo PayOS Checkout
const payOSConfig = {
  RETURN_URL: window.location.origin + '/payment/success',
  ELEMENT_ID: 'payos-checkout-container',
  CHECKOUT_URL: response.data.checkoutUrl,
  embedded: true,
  onSuccess: (event) => {
    console.log('Payment successful:', event);
    // Redirect to success page
    window.location.href = '/payment/success?orderCode=' + event.orderCode;
  },
  onCancel: (event) => {
    console.log('Payment cancelled:', event);
    // Redirect to cancel page
    window.location.href = '/payment/cancel?orderCode=' + event.orderCode;
  },
  onExit: (event) => {
    console.log('User exited checkout:', event);
  }
};

PayOS.init(payOSConfig);
```

### **HTML Structure cho Embedded**

```html
<div id="payos-checkout-container"></div>
<style>
  #payos-checkout-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  @media (max-width: 768px) {
    #payos-checkout-container iframe {
      height: 400px !important;
    }
  }
</style>
```

---

## 🎨 UI/UX REQUIREMENTS

### **1. Thanh Toán Page**

#### **Header**

- Logo VeenaTravel
- Back button (quay lại trang trước)
- Title: "Thanh toán"

#### **Order Summary**

```html
<div class="order-summary">
  <h3>Thông tin đơn hàng</h3>
  <div class="item">
    <span>Tên sản phẩm</span>
    <span className="price">100,000 VNĐ</span>
  </div>
  <div class="item">
    <span>Số lượng</span>
    <span>1</span>
  </div>
  <div class="total">
    <span>Tổng tiền</span>
    <span className="price">100,000 VNĐ</span>
  </div>
</div>
```

#### **Payment Button**

```html
<button
  class="pay-btn primary large"
  onClick={handlePayment}
  disabled={loading}
>
  {loading ? (
    <><Spinner /> Đang xử lý...</>
  ) : (
    <>💳 Thanh toán ngay</>
  )}
</button>
```

#### **Payment Status Badge**

```html
<div class="{`status-badge" ${status}`}>
  {status === 'pending' && '⏳ Chờ thanh toán'} {status === 'paid' && '✅ Đã
  thanh toán'} {status === 'cancelled' && '❌ Đã hủy'} {status === 'expired' &&
  '⏰ Đã hết hạn'}
</div>
```

---

### **2. Success Page**

#### **Icon và Message**

```html
<div class="success-page">
  <div class="icon">
    ✅
  </div>
  <h1>Thanh toán thành công!</h1>
  <p>Cảm ơn bạn đã sử dụng dịch vụ của VeenaTravel</p>

  <div class="payment-info">
    <p><strong>Mã đơn hàng:</strong> {orderCode}</p>
    <p><strong>Trạng thái:</strong> Đã thanh toán</p>
    <p><strong>Số tiền:</strong> {amount.toLocaleString('vi-VN')} VNĐ</p>
    <p><strong>Thời gian:</strong> {new Date().toLocaleString('vi-VN')}</p>
  </div>

  <div class="actions">
    <button onClick={() => router.push('/')}>
      Về trang chủ
    </button>
    <button onClick={downloadReceipt}>
      Tải hóa đơn
    </button>
  </div>
</div>
```

---

### **3. Cancel Page**

```html
<div class="cancel-page">
  <div class="icon">
    ❌
  </div>
  <h1>Thanh toán đã bị hủy</h1>
  <p>Bạn đã hủy quá trình thanh toán</p>

  <div class="actions">
    <button onClick={retryPayment}>
      Thử thanh toán lại
    </button>
    <button onClick={() => router.push('/')}>
      Về trang chủ
    </button>
  </div>
</div>
```

---

### **4. Payment History Page**

```html
<div class="payment-history">
  <h2>Lịch sử thanh toán</h2>

  {/* Filter */}
  <div class="filters">
    <select onChange={(e) => setStatusFilter(e.target.value)}>
      <option value="">Tất cả</option>
      <option value="pending">Chờ thanh toán</option>
      <option value="paid">Đã thanh toán</option>
      <option value="cancelled">Đã hủy</option>
    </select>
  </div>

  {/* Payment List */}
  <div class="payment-list">
    {payments.map(payment => (
      <PaymentCard key={payment.orderCode} payment={payment} />
    ))}
  </div>

  {/* Pagination */}
  <Pagination
    current={pagination.current}
    total={pagination.pages}
    onChange={handlePageChange}
  />
</div>
```

#### **Payment Card Component**

```html
<div class="payment-card">
  <div class="header">
    <span class="order-code">#{payment.orderCode}</span>
    <span class={`status ${payment.status}`}>
      {getStatusText(payment.status)}
    </span>
  </div>

  <div class="body">
    <p class="description">{payment.description}</p>
    <p class="amount">
      {payment.amount.toLocaleString('vi-VN')} VNĐ
    </p>
    <p class="date">
      {new Date(payment.createdAt).toLocaleString('vi-VN')}
    </p>
  </div>

  <div class="actions">
    {payment.status === 'pending' && (
      <>
        <button onClick={() => window.open(payment.checkoutUrl)}>
          Thanh toán
        </button>
        <button onClick={() => cancelPayment(payment.orderCode)}>
          Hủy
        </button>
      </>
    )}
    {payment.status === 'paid' && (
      <button onClick={() => viewReceipt(payment.orderCode)}>
        Xem hóa đơn
      </button>
    )}
  </div>
</div>
```

---

## 🎨 STYLING RECOMMENDATIONS

### **Colors**

```css
:root {
  --primary-color: #4caf50;
  --success-color: #2196f3;
  --danger-color: #f44336;
  --warning-color: #ff9800;
  --pending-color: #ff9800;
  --paid-color: #4caf50;
  --cancelled-color: #9e9e9e;
  --background: #f5f5f5;
  --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### **Components**

```css
.pay-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.pay-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.pay-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

---

## ⚠️ ERROR HANDLING

### **Common Errors**

1. **Authentication Error (401)**

```javascript
if (error.status === 401) {
  // Redirect to login
  router.push("/login?redirect=/payment");
}
```

2. **PayOS Not Configured (500)**

```javascript
if (error.message.includes("PayOS service not configured")) {
  alert("Hệ thống thanh toán tạm thời không khả dụng. Vui lòng thử lại sau.");
}
```

3. **Payment Expired**

```javascript
if (payment.expiresAt < new Date()) {
  alert("Link thanh toán đã hết hạn. Vui lòng tạo đơn hàng mới.");
}
```

4. **Network Error**

```javascript
catch (error) {
  if (!navigator.onLine) {
    alert('Không có kết nối mạng. Vui lòng kiểm tra lại.');
  }
}
```

---

## 📱 RESPONSIVE DESIGN

### **Mobile First**

```css
@media (max-width: 768px) {
  .order-summary {
    padding: 16px;
  }

  .pay-btn {
    width: 100%;
    font-size: 14px;
  }

  .payment-card {
    margin-bottom: 12px;
  }
}
```

### **Tablet**

```css
@media (min-width: 769px) and (max-width: 1024px) {
  .order-summary {
    max-width: 600px;
    margin: 0 auto;
  }
}
```

---

## 🔔 NOTIFICATIONS

### **Success**

```javascript
import { toast } from "react-toastify";

toast.success("Thanh toán thành công!", {
  position: "top-right",
  autoClose: 3000,
});
```

### **Error**

```javascript
toast.error("Thanh toán thất bại. Vui lòng thử lại.", {
  position: "top-right",
  autoClose: 5000,
});
```

### **Loading**

```javascript
toast.info("Đang xử lý thanh toán...", {
  position: "top-center",
  autoClose: 1000,
});
```

---

## 🧪 TESTING

### **Test Cases**

1. **Tạo thanh toán thành công**
2. **Thanh toán thành công (webhook)**
3. **Hủy thanh toán**
4. **Link hết hạn**
5. **Lỗi PayOS service**
6. **Authentication error**
7. **Network error**

### **Test Data**

```javascript
const testPayment = {
  amount: 100000,
  description: "Test Payment",
  items: [{ name: "Test Product", quantity: 1, price: 100000 }],
};
```

---

## 📚 VÍ DỤ CODE HOÀN CHỈNH

### **React Component Example**

```javascript
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const PaymentPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);

  const handlePayment = async (orderData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5001/api/payments/create",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Link thanh toán đã được tạo");

        // Option 1: Redirect to PayOS
        window.location.href = data.data.checkoutUrl;

        // Option 2: Embedded checkout
        // initializePayOS(data.data.checkoutUrl);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <h1>Thanh toán</h1>

      <button
        onClick={() => handlePayment({ ...orderData })}
        disabled={loading}
        className="pay-btn"
      >
        {loading ? "Đang xử lý..." : "Thanh toán"}
      </button>
    </div>
  );
};

export default PaymentPage;
```

---

## 📝 CHECKLIST TRIỂN KHAI

### **Phase 1: Basic Payment**

- [ ] Tạo component PaymentPage
- [ ] Integrate với API `/api/payments/create`
- [ ] Handle redirect to PayOS
- [ ] Create success page
- [ ] Create cancel page
- [ ] Add error handling

### **Phase 2: Payment History**

- [ ] Create PaymentHistory component
- [ ] Integrate với API `/api/payments/user-payments`
- [ ] Add pagination
- [ ] Add status filter
- [ ] Implement cancel payment

### **Phase 3: Embedded Checkout**

- [ ] Add PayOS script to HTML
- [ ] Create embedded checkout component
- [ ] Handle PayOS events (onSuccess, onCancel)
- [ ] Responsive design

### **Phase 4: Polish**

- [ ] Add loading states
- [ ] Add toast notifications
- [ ] Add payment status badges
- [ ] Add receipt download
- [ ] Add animations

---

## 🔗 TÀI LIỆU THAM KHẢO

- **Backend API Docs**: `http://localhost:5001/api/docs`
- **Health Check**: `http://localhost:5001/api/health`
- **PayOS Docs**: `https://payos.vn/docs`
- **PayOS Checkout Script**: `https://cdn.payos.vn/payos-checkout/v1/stable/payos-initialize.js`

---

## 🎯 KẾT LUẬN

Frontend cần implement:

1. ✅ Authentication với JWT
2. ✅ Tạo thanh toán qua API
3. ✅ Redirect hoặc embed PayOS checkout
4. ✅ Handle return URLs (success/cancel)
5. ✅ Display payment history
6. ✅ Cancel payment functionality
7. ✅ Error handling & loading states
8. ✅ Responsive design
9. ✅ Toast notifications

**Priority**: Bắt đầu với Basic Payment (Phase 1), sau đó bổ sung các tính năng còn lại.

---

## 💡 TIPS

1. **Test với Sandbox**: PayOS có sandbox mode cho testing
2. **Store token safely**: Sử dụng `localStorage` hoặc state management
3. **Handle expired payments**: Kiểm tra `expiresAt` trước khi hiển thị link
4. **User feedback**: Luôn hiển thị loading states và error messages
5. **Responsive**: Test trên mobile, tablet, desktop

---

**Good luck! 🚀**
