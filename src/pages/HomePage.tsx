import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const handleShowChat = () => {
    setShowChat(true);
  };

  const handleShowHome = () => {
    setShowChat(false);
  };

  const handleShowAuth = () => {
    setShowAuthModal(true);
  };

  const handleCloseAuth = () => {
    setShowAuthModal(false);
  };

  const switchToRegister = () => {
    setAuthMode("register");
  };

  const switchToLogin = () => {
    setAuthMode("login");
  };

  if (showChat) {
    return (
      <div className="chat-page">
        <div className="chat-container">
          {/* Left Sidebar Navigation */}
          <div className="left-sidebar">
            <div className="sidebar-header">
              <div className="logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="#FF4D85"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="#FF4D85"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="#FF4D85"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>veena travel.</span>
              </div>
              <button className="back-btn" onClick={handleShowHome}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 12H5M12 19L5 12L12 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="sidebar-menu">
              <div className="menu-item active">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Chats</span>
                <span className="badge">1</span>
              </div>

              <div className="menu-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M21 21L16.65 16.65"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Khám phá</span>
              </div>

              <div className="menu-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 3C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 3C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.041 1.55 8.5C1.5487 9.959 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.9379 22.4518 9.2225 22.45 8.5C22.4518 7.7775 22.3095 7.0621 22.0329 6.3947C21.7563 5.7272 21.351 5.1208 20.84 4.61Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Saved</span>
              </div>

              <div className="menu-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="18"
                    rx="2"
                    ry="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <line
                    x1="16"
                    y1="2"
                    x2="16"
                    y2="6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="8"
                    y1="2"
                    x2="8"
                    y2="6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="3"
                    y1="10"
                    x2="21"
                    y2="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Trips</span>
              </div>

              <div className="menu-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Updates</span>
              </div>

              <div className="menu-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <span>Inspiration</span>
              </div>

              <div className="menu-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                    ry="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <line
                    x1="12"
                    y1="8"
                    x2="12"
                    y2="16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="8"
                    y1="12"
                    x2="16"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Create</span>
              </div>
            </div>

            <div className="new-chat-btn">
              <button className="btn-new-chat">New chat</button>
            </div>

            <div className="sidebar-footer">
              <div className="user-profile">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <span>Traveler</span>
              </div>
              <div className="footer-links">
                <a href="#">Company</a>
                <a href="#">Contact</a>
                <a href="#">Help</a>
                <a href="#">Terms</a>
                <a href="#">Privacy</a>
              </div>
              <div className="copyright">© 2025 Veena Travel, Inc.</div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="chat-sidebar">
            <div className="chat-content">
              <div className="chat-messages">
                <div className="message bot-message">
                  <div className="message-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#FF4D85" />
                      <path
                        d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="message-content">
                    <p>
                      Tôi muốn đi du lịch thành phố Hồ Chí Minh đến Đà Lạt 3
                      ngày 2 đêm chơi gì ? 3 đâu? Du lịch gia đình 4 người 2
                      người lớn, 2 trẻ em, 1 con thú cưng, ngân sách khoảng 15
                      triệu
                    </p>
                  </div>
                </div>

                <div className="message bot-message">
                  <div className="message-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#FF4D85" />
                      <path
                        d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="message-content">
                    <p>
                      Cảm ơn bạn đã chia sẻ thông tin! Tôi sẽ tạo ra hành trình
                      cụ của bạn. Gia đình 4 người lớn 2 trẻ em cùng một chú mèo
                      muốn đi du lịch từ Thành phố Hồ Chí Minh đến Đà Lạt trong
                      3 ngày 2 đêm, với ngân sách khoảng 15 triệu đồng và thú
                      cưng đi cùng. Hãy để tôi tạo một kế hoạch chi tiết cho
                      chuyến đi này.
                    </p>

                    <div className="itinerary-section">
                      <h4>Ngày 1: Khởi hành & Khám phá trung tâm Đà Lạt</h4>
                      <p>
                        <strong>Sáng:</strong>
                      </p>
                      <p>
                        Khởi hành từ Thành phố Hồ Chí Minh đến Đà Lạt. Bạn có
                        thể nghỉ ngơi tại - Dalat Edensee Lake Resort & Spa -
                        nơi chào đón thú cưng và có không gian rộng rãi cho trẻ
                        nhỏ vui chơi. Đăng ký phòng và nghỉ ngơi sau chuyến đi
                        dài.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="chat-input-container">
                <div className="chat-input">
                  <input type="text" placeholder="Hỏi gì đó..." />
                  <button className="send-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22 2L11 13M22 2L15 22L11 13M22 2L2 11L11 13"
                        stroke="#FF4D85"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="map-container">
            <div id="chat-map" className="map-view">
              {/* Interactive map will be rendered here */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="header">
        <nav className="nav">
          <div className="nav-brand">
            <span className="logo">VeenaTravel</span>
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
            <button className="btn-register" onClick={handleShowAuth}>
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
            <button className="btn btn-primary" onClick={handleShowChat}>
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
            <div className="service-card hotel">
              <div className="service-icon">🏨</div>
              <h3>Khách sạn</h3>
              <p>Tìm kiếm và đặt phòng khách sạn tốt nhất</p>
              <div className="service-image">
                <img
                  src="https://i.pinimg.com/736x/03/9b/72/039b725e63b55ad938c4c7834234bfee.jpg"
                  alt="Hotel"
                />
              </div>
            </div>
            <div className="service-card rental">
              <div className="service-icon">🚗</div>
              <h3>Thuê xe</h3>
              <p>Thuê xe du lịch tiện lợi và an toàn</p>
              <div className="service-image">
                <img
                  src="https://res.cloudinary.com/djytw2oj3/image/upload/v1758298127/a9d86f542b8254b0bf48144e14aef74313beca71_wlky2i.png"
                  alt="Car Rental"
                />
              </div>
            </div>
            <div className="service-card flight">
              <div className="service-icon">✈️</div>
              <h3>Chuyến bay</h3>
              <p>Đặt vé máy bay giá tốt nhất</p>
              <div className="service-image">
                <img
                  src="https://res.cloudinary.com/djytw2oj3/image/upload/v1758298137/9a849405f62c1fb17b0f2f18b61ae45457901a43_lv804w.jpg"
                  alt="Flight"
                />
              </div>
            </div>
            <div className="service-card restaurant">
              <div className="service-icon">🍽️</div>
              <h3>Nhà hàng</h3>
              <p>Khám phá ẩm thực địa phương đặc sắc</p>
              <div className="service-image">
                <img
                  src="https://res.cloudinary.com/djytw2oj3/image/upload/v1758298131/372531a515d5d2b1a0ac70204910a9c4f8d787f2_acveqa.jpg"
                  alt="Restaurant"
                />
              </div>
            </div>
            <div className="service-card tour">
              <div className="service-icon">🗺️</div>
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
                src="logo-white.png"
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
      {showAuthModal && (
        <div className="modal" onClick={handleCloseAuth}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={handleCloseAuth}>
              &times;
            </span>

            {authMode === "login" ? (
              <div className="auth-form active">
                <h2>Chào mừng đến Veena Travel!</h2>
                <form>
                  <div className="form-group">
                    <input type="email" placeholder="Email" required />
                  </div>
                  <div className="form-group">
                    <input type="password" placeholder="Mật khẩu" required />
                  </div>
                  <button type="submit" className="btn-auth">
                    Đăng nhập
                  </button>
                </form>

                <div className="divider">
                  <span>hoặc</span>
                </div>

                <button className="btn-google">
                  <span className="google-icon">G</span>
                  Tiếp tục với Google
                </button>

                <p className="auth-switch">
                  Chưa có tài khoản?
                  <a href="#" onClick={switchToRegister}>
                    Đăng ký ngay
                  </a>
                </p>
              </div>
            ) : (
              <div className="auth-form">
                <h2>Chào mừng đến Veena Travel!</h2>
                <form>
                  <div className="form-group">
                    <input type="text" placeholder="Họ và tên" required />
                  </div>
                  <div className="form-group">
                    <input type="email" placeholder="Email" required />
                  </div>
                  <div className="form-group">
                    <input type="password" placeholder="Mật khẩu" required />
                  </div>
                  <div className="form-group">
                    <input
                      type="password"
                      placeholder="Xác nhận mật khẩu"
                      required
                    />
                  </div>
                  <button type="submit" className="btn-auth">
                    Đăng ký
                  </button>
                </form>

                <div className="divider">
                  <span>hoặc</span>
                </div>

                <button className="btn-google">
                  <span className="google-icon">G</span>
                  Tiếp tục với Google
                </button>

                <div className="premium-section">
                  <button className="btn-premium">Đăng ký Premium</button>
                </div>

                <p className="auth-switch">
                  Đã có tài khoản?{" "}
                  <a href="#" onClick={switchToLogin}>
                    Đăng nhập
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default HomePage;
