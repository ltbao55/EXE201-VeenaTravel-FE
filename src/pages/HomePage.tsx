import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/auth/AuthModal";
import "../styles/HomePage.css";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { openAuthModal, showAuthModal, closeAuthModal, authMode } = useAuth();

  const handleStartChat = () => {
    navigate("/chat");
  };

  return (
    <>
      {/* Header */}
      <header className="header">
        <nav className="nav">
          <div className="nav-brand">
            <img
              src="https://res.cloudinary.com/djytw2oj3/image/upload/v1758702781/logo-veena_tlzubw.png"
              alt="VeenaTravel"
              className="logo"
            />
          </div>
          <ul className="nav-menu">
            <li>
              <a href="#home">Trang chủ</a>
            </li>
            <li>
              <a href="#about">Giới thiệu</a>
            </li>
            <li>
              <a href="#services">Dịch vụ</a>
            </li>
            <li>
              <a href="#contact">Liên hệ</a>
            </li>
          </ul>
          <div className="nav-cta">
            <button
              className="btn-register"
              onClick={() => openAuthModal("register")}
            >
              Đăng ký ngay
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-background"></div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Trải nghiệm
              <br />
              du lịch khác biệt
            </h1>
            <p className="hero-subtitle">
              Ứng dụng thông minh giúp bạn khám phá những điểm đến tuyệt vời,
              lên kế hoạch chuyến đi hoàn hảo và kết nối với cộng đồng du lịch
              Việt Nam.
            </p>
            <button className="btn btn-primary" onClick={handleStartChat}>
              Bắt đầu trò chuyện
            </button>
          </div>
        </div>
      </section>

      {/* Discover Vietnam Banner */}
      <section className="discover-banner">
        <div className="container">
          <div className="banner-content">
            <div className="banner-text">
              <h2>DISCOVER VIETNAM</h2>
              <h3>Timeless Charm Awaits</h3>
              <p>
                Khám phá vẻ đẹp bất tận của Việt Nam với những trải nghiệm độc
                đáo và khó quên
              </p>
              <button className="btn btn-outline">Khám phá ngay</button>
            </div>
            <div className="banner-image">
              <img
                src="https://i.pinimg.com/1200x/7d/7d/9d/7d7d9d3d43fae3902e1201d7c2e66842.jpg"
                alt="Vietnam"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">Hoạt động ra sao?</h2>
          <div className="how-it-works-content">
            <div className="process-description">
              <div className="process-card">
                <h3>Bắt đầu cuộc chuyện cùng chúng tôi</h3>
                <p>
                  Chia sẻ sở thích, ngân sách và thời gian của bạn. Chúng tôi sẽ
                  lắng nghe và hiểu rõ nhu cầu của bạn để tạo ra những gợi ý phù
                  hợp nhất.
                </p>
              </div>
            </div>
            <div className="avatar-circle">
              <img
                src="https://res.cloudinary.com/djytw2oj3/image/upload/v1758298124/116e971bc410f23425572c24b18fe1a061195060_qlecc8.jpg"
                alt="Avatar"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Travel Planning Section */}
      <section className="travel-planning">
        <div className="container">
          <div className="planning-content">
            <div className="planning-mockup">
              <img
                src="https://res.cloudinary.com/djytw2oj3/image/upload/v1758298118/494b4d17ff5d851a93b553c3a39c4d97f7342d84_sk96d1.jpg"
                alt="Travel Planning"
              />
            </div>
            <div className="planning-text">
              <div className="planning-card">
                <h3>Nhận gợi ý du lịch dành riêng cho bạn</h3>
                <p>
                  Dựa trên sở thích và ngân sách của bạn, chúng tôi sẽ đề xuất
                  những địa điểm, hoạt động và trải nghiệm phù hợp nhất. Từ
                  những bãi biển tuyệt đẹp đến những di tích lịch sử, mọi thứ
                  đều được cá nhân hóa theo nhu cầu của bạn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Interface Section */}
      <section className="app-interface">
        <div className="container">
          <div className="interface-content">
            <div className="interface-text">
              <div className="interface-card">
                <h3>Cùng bạn bè lên kế hoạch, liên kết thành chuyến đi</h3>
                <p>
                  Mời bạn bè tham gia vào kế hoạch du lịch, chia sẻ ý tưởng và
                  cùng nhau quyết định. Tính năng chat nhóm giúp mọi người dễ
                  dàng thảo luận và đưa ra quyết định cuối cùng về chuyến đi.
                </p>
              </div>
            </div>
            <div className="interface-mockup">
              <img
                src="https://res.cloudinary.com/djytw2oj3/image/upload/v1758298110/d535d95b676f23c816bb76b02b88411ee73eab4b_jgjkki.jpg"
                alt="App Interface"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <h2 className="services-title">Mọi thông tin - một nơi duy nhất</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>Khách sạn</h3>
              <p>Tìm kiếm và đặt phòng khách sạn tốt nhất</p>
              <div className="service-image">
                <img
                  src="https://i.pinimg.com/736x/03/9b/72/039b725e63b55ad938c4c7834234bfee.jpg"
                  alt="Hotel"
                />
              </div>
            </div>
            <div className="service-card">
              <h3>Thuê xe</h3>
              <p>Thuê xe du lịch tiện lợi và an toàn</p>
              <div className="service-image">
                <img
                  src="https://res.cloudinary.com/djytw2oj3/image/upload/v1758298127/a9d86f542b8254b0bf48144e14aef74313beca71_wlky2i.png"
                  alt="Car Rental"
                />
              </div>
            </div>
            <div className="service-card">
              <h3>Chuyến bay</h3>
              <p>Đặt vé máy bay giá tốt nhất</p>
              <div className="service-image">
                <img
                  src="https://res.cloudinary.com/djytw2oj3/image/upload/v1758298137/9a849405f62c1fb17b0f2f18b61ae45457901a43_lv804w.jpg"
                  alt="Flight"
                />
              </div>
            </div>
            <div className="service-card">
              <h3>Nhà hàng</h3>
              <p>Khám phá ẩm thực địa phương đặc sắc</p>
              <div className="service-image">
                <img
                  src="https://res.cloudinary.com/djytw2oj3/image/upload/v1758298131/372531a515d5d2b1a0ac70204910a9c4f8d787f2_acveqa.jpg"
                  alt="Restaurant"
                />
              </div>
            </div>
            <div className="service-card">
              <h3>Tour du lịch</h3>
              <p>Trải nghiệm tour du lịch chất lượng cao</p>
              <div className="service-image">
                <img
                  src="https://res.cloudinary.com/djytw2oj3/image/upload/v1758298192/f2a5d24d389d252f1c00840995d6d84bba93fe2d_u7m8lg.png"
                  alt="Tour"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discovery Sections */}
      <section className="discovery-section">
        <div className="container">
          <div className="large-discovery-card">
            <div className="discovery-content">
              <h2>Khám phá phong cách du lịch của bạn</h2>
              <p>
                Tìm hiểu những điểm đến phù hợp với sở thích và phong cách du
                lịch riêng của bạn
              </p>
              <button className="btn btn-primary">Làm bài test ngay</button>
            </div>
            <div className="discovery-image">
              <img
                src="https://res.cloudinary.com/djytw2oj3/image/upload/v1758299910/53323c2fc6be88424bb4735c52eb91fa383b8dee_pl1rdf.jpg"
                alt="Discovery"
              />
            </div>
          </div>

          <div className="banner-placeholder">
            <img
              src="https://res.cloudinary.com/djytw2oj3/image/upload/v1758465037/93ddcaff81ac2f5e113fd0f3a8e58ec87b741043_lxcwue_chof7b.jpg"
              alt="Banner"
            />
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        initialMode={authMode}
      />
    </>
  );
};

export default HomePage;
