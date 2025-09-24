import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header/Header";
import "../styles/ServicesPage.css";

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { openAuthModal } = useAuth();

  const handleGetStarted = (planType: string) => {
    if (planType === "premium") {
      openAuthModal("register");
    } else {
      navigate("/chat");
    }
  };

  return (
    <div className="services-page">
      <Header />

      {/* Hero Section */}
      <section className="services-hero">
        <div className="container">
          <div className="hero-content">
            <h1>Chọn gói dịch vụ phù hợp</h1>
            <p>
              Trải nghiệm du lịch tuyệt vời với các gói dịch vụ được thiết kế
              riêng cho bạn
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="container">
          <div className="pricing-grid">
            {/* Free Plan */}
            <div className="pricing-card free-plan">
              <div className="plan-header">
                <h3>Cơ bản</h3>
                <div className="price">
                  <span className="price-amount">Free</span>
                </div>
              </div>

              <div className="plan-features">
                <div className="feature-item included">
                  <i className="fas fa-check"></i>
                  <span>AI hướng dẫn du lịch</span>
                </div>
                <div className="feature-item included">
                  <i className="fas fa-check"></i>
                  <span>Đưa gợi ý cá nhân hóa</span>
                </div>
                <div className="feature-item included">
                  <i className="fas fa-check"></i>
                  <span>Tạo lịch trình</span>
                </div>
                <div className="feature-item included">
                  <i className="fas fa-check"></i>
                  <span>Khám phá địa điểm thú vị</span>
                </div>
                <div className="feature-item included">
                  <i className="fas fa-check"></i>
                  <span>Chia sẻ cho bạn bè</span>
                </div>
                <div className="feature-item limited">
                  <i className="fas fa-minus"></i>
                  <span>Lịch hoạt theo thời gian</span>
                </div>
                <div className="feature-item limited">
                  <i className="fas fa-minus"></i>
                  <span>Lưu trữ chuyến không giới hạn</span>
                </div>
                <div className="feature-item limited">
                  <i className="fas fa-minus"></i>
                  <span>Thật bạn bè cùng trò chuyện với AI</span>
                </div>
              </div>

              <button
                className="plan-button free-button"
                onClick={() => handleGetStarted("free")}
              >
                Bắt đầu ngay
              </button>

              <div className="plan-note">
                <i className="fas fa-info-circle"></i>
                <span>Miễn phí mãi mãi</span>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="pricing-card premium-plan popular">
              <div className="popular-badge">
                <i className="fas fa-crown"></i>
                <span>Phổ biến nhất</span>
              </div>

              <div className="plan-header">
                <h3>Gói nâng cao</h3>
                <div className="price">
                  <span className="price-amount">39K</span>
                  <span className="price-period">/ 30 ngày</span>
                </div>
                <div className="price-note">Chỉ 1,300đ mỗi ngày</div>
              </div>

              <div className="plan-features">
                <div className="feature-item included">
                  <i className="fas fa-check"></i>
                  <span>AI hướng dẫn du lịch</span>
                </div>
                <div className="feature-item included">
                  <i className="fas fa-check"></i>
                  <span>Đưa gợi ý cá nhân hóa</span>
                </div>
                <div className="feature-item included">
                  <i className="fas fa-check"></i>
                  <span>Tạo lịch trình</span>
                </div>
                <div className="feature-item included">
                  <i className="fas fa-check"></i>
                  <span>Khám phá địa điểm thú vị</span>
                </div>
                <div className="feature-item included">
                  <i className="fas fa-check"></i>
                  <span>Chia sẻ cho bạn bè</span>
                </div>
                <div className="feature-item premium">
                  <i className="fas fa-star"></i>
                  <span>Lịch hoạt theo thời gian</span>
                </div>
                <div className="feature-item premium">
                  <i className="fas fa-star"></i>
                  <span>Lưu trữ chuyến không giới hạn</span>
                </div>
                <div className="feature-item premium">
                  <i className="fas fa-star"></i>
                  <span>Thật bạn bè cùng trò chuyện với AI</span>
                </div>
              </div>

              <button
                className="plan-button premium-button"
                onClick={() => handleGetStarted("premium")}
              >
                Đăng ký gói
              </button>

              <div className="plan-note">
                <a href="#" className="learn-more">
                  Tìm hiểu thêm
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="features-comparison">
        <div className="container">
          <h2>So sánh tính năng</h2>
          <div className="comparison-table">
            <div className="table-header">
              <div className="feature-col">Tính năng</div>
              <div className="plan-col">Cơ bản</div>
              <div className="plan-col premium-col">Gói nâng cao</div>
            </div>

            <div className="table-row">
              <div className="feature-name">
                AI hướng dẫn du lịch thông minh
              </div>
              <div className="plan-feature">
                <i className="fas fa-check text-success"></i>
              </div>
              <div className="plan-feature">
                <i className="fas fa-check text-success"></i>
              </div>
            </div>

            <div className="table-row">
              <div className="feature-name">Tạo lịch trình cá nhân hóa</div>
              <div className="plan-feature">
                <i className="fas fa-check text-success"></i>
              </div>
              <div className="plan-feature">
                <i className="fas fa-check text-success"></i>
              </div>
            </div>

            <div className="table-row">
              <div className="feature-name">Số lượng chuyến đi lưu trữ</div>
              <div className="plan-feature">
                <span className="limit">3 chuyến</span>
              </div>
              <div className="plan-feature">
                <span className="unlimited">Không giới hạn</span>
              </div>
            </div>

            <div className="table-row">
              <div className="feature-name">Chia sẻ với bạn bè</div>
              <div className="plan-feature">
                <i className="fas fa-times text-muted"></i>
              </div>
              <div className="plan-feature">
                <i className="fas fa-check text-success"></i>
              </div>
            </div>

            <div className="table-row">
              <div className="feature-name">Hỗ trợ ưu tiên</div>
              <div className="plan-feature">
                <i className="fas fa-times text-muted"></i>
              </div>
              <div className="plan-feature">
                <i className="fas fa-check text-success"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2>Câu hỏi thường gặp</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>Tôi có thể hủy gói Premium bất cứ lúc nào không?</h4>
              <p>
                Có, bạn có thể hủy gói Premium bất cứ lúc nào. Gói sẽ tiếp tục
                hoạt động đến hết chu kỳ thanh toán hiện tại.
              </p>
            </div>
            <div className="faq-item">
              <h4>Gói Free có giới hạn gì không?</h4>
              <p>
                Gói Free giới hạn 3 chuyến đi lưu trữ và không có tính năng chia
                sẻ với bạn bè.
              </p>
            </div>
            <div className="faq-item">
              <h4>Tôi có thể nâng cấp từ Free lên Premium không?</h4>
              <p>
                Có, bạn có thể nâng cấp bất cứ lúc nào và sẽ được tính phí theo
                tỷ lệ thời gian còn lại.
              </p>
            </div>
            <div className="faq-item">
              <h4>Có hỗ trợ thanh toán nào khác không?</h4>
              <p>
                Chúng tôi hỗ trợ thanh toán qua thẻ tín dụng, ví điện tử và
                chuyển khoản ngân hàng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <img
                src="https://res.cloudinary.com/djytw2oj3/image/upload/v1758702781/logo-veena_tlzubw.png"
                alt="VeenaTravel"
                className="footer-logo"
              />
              <p>Trải nghiệm du lịch khác biệt</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Dịch vụ</h4>
                <ul>
                  <li>
                    <a href="#">Tour trong nước</a>
                  </li>
                  <li>
                    <a href="#">Tour nước ngoài</a>
                  </li>
                  <li>
                    <a href="#">Đặt khách sạn</a>
                  </li>
                  <li>
                    <a href="#">Vé máy bay</a>
                  </li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Hỗ trợ</h4>
                <ul>
                  <li>
                    <a href="#">Liên hệ</a>
                  </li>
                  <li>
                    <a href="#">FAQ</a>
                  </li>
                  <li>
                    <a href="#">Chính sách</a>
                  </li>
                  <li>
                    <a href="#">Điều khoản</a>
                  </li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Liên hệ</h4>
                <ul>
                  <li>Email: info@veenatravel.com</li>
                  <li>Phone: +84 123 456 789</li>
                  <li>Address: 12 Đường ABC, TP.HCM</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 VeenaTravel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServicesPage;
