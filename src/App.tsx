import "./App.css";

function App() {
  return (
    <div className="app">
      {/* Hero Section với Halong Bay */}
      <section className="hero-section">
        <div className="hero-card">
          <div className="hero-image">
            <div className="hero-content">
              <h2>Explore</h2>
              <h1>Halong Bay, Vietnam</h1>
              <div className="hero-stats">
                <span>🏨 Hotels</span>
                <span>🚗 Car</span>
                <span>✈️ Flight</span>
                <span>[object Object]</span>
              </div>
            </div>
          </div>
        </div>

        <div className="travel-info-card">
          <h3>Dự đoán giá vé máy bay tính</h3>
          <p>Dự đoán giá vé máy bay tính năng mới của chúng tôi</p>
          <button className="info-button">Tìm hiểu thêm</button>
        </div>
      </section>

      {/* Travel Info Section */}
      <section className="travel-info-section">
        <div className="info-card">
          <div className="info-image"></div>
          <div className="info-content">
            <h4>Đặt vé máy bay</h4>
            <p>
              Tìm kiếm và đặt vé máy bay giá rẻ đến hàng trăm điểm đến trên toàn
              thế giới
            </p>
            <div className="rating">
              <span>⭐ 4.8</span>
            </div>
            <button className="book-button">Đặt</button>
          </div>
        </div>
      </section>

      {/* Main Services Section */}
      <section className="services-section">
        <h2 className="services-title">Mọi thông tin - một nơi duy nhất</h2>

        <div className="services-grid">
          <div className="service-card hotel-card">
            <div className="service-icon">🏨</div>
            <h3>Khách sạn</h3>
            <p>Tìm kiếm khách sạn phù hợp với ngân sách của bạn</p>
          </div>

          <div className="service-card rental-card">
            <div className="service-icon">🚗</div>
            <h3>Thuê xe</h3>
            <p>Thuê xe ô tô, xe máy với giá tốt nhất</p>
          </div>

          <div className="service-card flight-card">
            <div className="service-icon">✈️</div>
            <h3>Chuyến bay</h3>
            <p>Đặt vé máy bay nội địa và quốc tế</p>
          </div>

          <div className="service-card restaurant-card">
            <div className="service-icon">🍽️</div>
            <h3>Nhà hàng</h3>
            <p>Khám phá ẩm thực địa phương độc đáo</p>
          </div>

          <div className="service-card tour-card">
            <div className="service-icon">🗺️</div>
            <h3>Tour du lịch</h3>
            <p>Tham gia các tour du lịch hấp dẫn</p>
          </div>
        </div>
      </section>

      {/* Discovery Banner */}
      <section className="discovery-section">
        <div className="discovery-banner">
          <div className="discovery-content">
            <h2>Khám phá phong cách du lịch của bạn</h2>
            <p>Lên kế hoạch cho chuyến đi hoàn hảo với những gợi ý phù hợp</p>
            <button className="discovery-button">Bắt đầu khám phá</button>
          </div>
        </div>
      </section>

      {/* Vietnam Discovery Section */}
      <section className="vietnam-section">
        <div className="vietnam-card">
          <div className="vietnam-content">
            <h3>DISCOVER VIETNAM</h3>
            <h2>Timeless Charm Awaits</h2>
            <p>Khám phá vẻ đẹp bất tận của Việt Nam</p>
            <button className="explore-button">Khám phá ngay</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <h2>Veena</h2>
            <p>Travel</p>
          </div>
          <div className="footer-info">
            <p>Công ty du lịch hàng đầu</p>
            <p>Việt Nam</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
