import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-brand">
          <Link to="/" className="logo">VeenaTravel</Link>
        </div>
        <ul className="nav-menu">
          <li><Link to="/">Trang chủ</Link></li>
          <li><Link to="/explore">Khám phá</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/chat">Chat</Link></li>
        </ul>
        <div className="nav-cta">
          <Link to="/profile" className="btn-register">Hồ sơ</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
