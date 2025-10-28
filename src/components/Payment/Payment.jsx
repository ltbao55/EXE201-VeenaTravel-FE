import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./Payment.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import AuthModal from "../auth/AuthModal";
import { useAuth } from "../../context/AuthContext";
import PaymentService from "../../services/paymentService";

const Payment = () => {
  const { showAuthModal, closeAuthModal, authMode, isAuthenticated } =
    useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState("");

  const orderCode = searchParams.get("orderCode");

  // Load payment info when component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/services");
      return;
    }

    if (!orderCode) {
      setError("Không tìm thấy mã đơn hàng");
      return;
    }

    loadPaymentInfo();
  }, [orderCode, isAuthenticated]);

  const loadPaymentInfo = async () => {
    setLoading(true);
    setError("");
    try {
      const info = await PaymentService.getPaymentInfo(parseInt(orderCode));
      setPaymentInfo(info);
    } catch (err) {
      console.error("Error loading payment info:", err);
      setError(err.message || "Không thể tải thông tin thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (paymentInfo?.checkoutUrl) {
      // Redirect to PayOS
      window.location.href = paymentInfo.checkoutUrl;
    }
  };

  const handleCancel = async () => {
    if (!confirm("Bạn có chắc chắn muốn hủy thanh toán này?")) {
      return;
    }

    setLoading(true);
    try {
      await PaymentService.cancelPayment(paymentInfo.orderCode);
      navigate("/services");
    } catch (err) {
      setError(err.message || "Không thể hủy thanh toán");
      setLoading(false);
    }
  };

  if (loading && !paymentInfo) {
    return (
      <>
        <Header />
        <div className="payment-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin thanh toán...</p>
          </div>
        </div>
        <Footer />
        <AuthModal
          isOpen={showAuthModal}
          onClose={closeAuthModal}
          initialMode={authMode}
        />
      </>
    );
  }

  if (error && !paymentInfo) {
    return (
      <>
        <Header />
        <div className="payment-container">
          <div className="error-container">
            <h2>Lỗi</h2>
            <p>{error}</p>
            <button
              onClick={() => navigate("/services")}
              className="btn-primary"
            >
              Quay lại
            </button>
          </div>
        </div>
        <Footer />
        <AuthModal
          isOpen={showAuthModal}
          onClose={closeAuthModal}
          initialMode={authMode}
        />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="payment-container">
        <div className="payment-header">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Quay lại
          </button>
          <div className="payment-icon">💳</div>
          <h1 className="payment-title">Thanh toán</h1>
        </div>

        <div className="payment-content">
          {/* Order Summary */}
          <div className="order-summary payment-section">
            <h3 className="section-title">Thông tin đơn hàng</h3>

            {paymentInfo?.items?.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">x{item.quantity}</span>
                </div>
                <span className="item-price">
                  {PaymentService.formatCurrency(item.price)}
                </span>
              </div>
            ))}

            <div className="order-total">
              <span>Tổng tiền</span>
              <span className="total-price">
                {PaymentService.formatCurrency(paymentInfo?.amount || 0)}
              </span>
            </div>

            {/* Status Badge */}
            <div className={`status-badge ${paymentInfo?.status || "pending"}`}>
              {PaymentService.getStatusText(paymentInfo?.status || "pending")}
            </div>
          </div>

          {/* Payment Actions */}
          <div className="payment-actions-section">
            {paymentInfo?.status === "pending" && (
              <>
                <button
                  className="pay-btn"
                  onClick={handlePayment}
                  disabled={
                    loading ||
                    (paymentInfo?.expiresAt &&
                      PaymentService.isExpired(paymentInfo.expiresAt))
                  }
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>💳 Thanh toán ngay</>
                  )}
                </button>

                <button
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Hủy đơn hàng
                </button>
              </>
            )}

            {paymentInfo?.status === "paid" && (
              <div className="success-message">
                <div className="success-icon">✅</div>
                <h3>Đã thanh toán thành công!</h3>
                <p>Cảm ơn bạn đã sử dụng dịch vụ của VeenaTravel</p>
              </div>
            )}

            {paymentInfo?.status === "cancelled" && (
              <div className="cancelled-message">
                <div className="cancelled-icon">❌</div>
                <h3>Đơn hàng đã bị hủy</h3>
                <p>Bạn có thể tạo đơn hàng mới</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        initialMode={authMode}
      />
    </>
  );
};

export default Payment;
