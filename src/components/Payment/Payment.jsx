import React from "react";
import "./Payment.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import AuthModal from "../auth/AuthModal";
import { useAuth } from "../../context/AuthContext";

const Payment = () => {
  const { showAuthModal, closeAuthModal, authMode } = useAuth();
  return (
    <>
      <Header />
      <div className="payment-container">
        <div className="payment-header">
          <div className="payment-icon">💳</div>
          <h1 className="payment-title">Thanh toán</h1>
        </div>

        <div className="payment-content">
          {/* Thông tin khách hàng */}
          <div className="payment-section customer-info">
            <h2 className="section-title">Thông tin khách hàng</h2>
            <div className="info-group">
              <div className="info-item">
                <label>Tên:</label>
                <span>Nguyễn Văn A</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>vana01029900@gmail.com</span>
              </div>
              <div className="info-item">
                <label>Số điện thoại:</label>
                <span>0909090909</span>
              </div>
              <div className="info-item">
                <label>Địa chỉ:</label>
                <span>501, đường số 2, phường 3, TP.HCM</span>
              </div>
            </div>
          </div>

          {/* Thông tin đơn hàng */}
          <div className="payment-section order-info">
            <h2 className="section-title">Thông tin đơn hàng</h2>
            <div className="info-group">
              <div className="info-item">
                <label>Tên sản phẩm:</label>
                <span>Premium Veora Travel</span>
              </div>
              <div className="info-item">
                <label>Loại sản phẩm:</label>
                <span>Gói dịch vụ điện tử</span>
              </div>
              <div className="info-item">
                <label>Mã đơn hàng:</label>
                <span>Test123456778</span>
              </div>
              <div className="info-item">
                <label>Số tiền thanh toán:</label>
                <span className="amount">39,000</span>
              </div>
              <div className="info-item">
                <label>Phí thanh toán:</label>
                <span>0</span>
              </div>
              <div className="info-item">
                <label>Đơn vị tiền tệ:</label>
                <span>VND</span>
              </div>
            </div>
          </div>

          {/* QR Code thanh toán */}
          <div className="payment-section qr-section">
            <div className="qr-header">
              <span className="qr-instruction">
                Quét ứng dụng mobile để quét mã
              </span>
              <div className="qr-info">
                <span className="qr-note">Nhấn để thanh toán</span>
              </div>
            </div>

            <div className="qr-container">
              <div className="qr-code">
                <div className="vnpay-logo">
                  <span className="vnpay-text">VNPAY</span>
                  <span className="qr-label">QR</span>
                </div>
                <div className="qr-placeholder">
                  <img
                    src="https://via.placeholder.com/200x200/f0f0f0/c44569?text=QR+CODE"
                    alt="QR Code"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <div className="scan-text">Scan to Pay</div>
              </div>

              <div className="qr-details">
                <div className="qr-ids">
                  <span>MID: 0108388733</span>
                  <span>TID: UKG00006</span>
                </div>

                <div className="payment-amount">
                  <div className="amount-label">Thành tiền trực tuyến</div>
                  <div className="amount-value">39,000 VND</div>
                </div>

                <button className="check-button">Kiểm tra</button>
                <div className="or-divider">Hoặc</div>
                <button className="cancel-button">Hủy thanh toán</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        initialMode={authMode}
      />
    </>
  );
};

export default Payment;
