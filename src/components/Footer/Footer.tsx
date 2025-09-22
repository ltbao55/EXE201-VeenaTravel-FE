import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h2>Veena</h2>
            <p>Travel</p>
            <p>Trải nghiệm du lịch khác biệt</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Dịch vụ</h4>
              <ul>
                <li><a href="#">Tour trong nước</a></li>
                <li><a href="#">Tour nước ngoài</a></li>
                <li><a href="#">Đặt khách sạn</a></li>
                <li><a href="#">Vé máy bay</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Hỗ trợ</h4>
              <ul>
                <li><a href="#">Liên hệ</a></li>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Chính sách</a></li>
                <li><a href="#">Điều khoản</a></li>
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
  );
};

export default Footer;
