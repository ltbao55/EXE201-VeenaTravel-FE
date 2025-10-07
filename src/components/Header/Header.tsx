import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { openAuthModal } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    closeMenu();
  };

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-brand">
          <img
            src="https://res.cloudinary.com/djytw2oj3/image/upload/v1758702781/logo-veena_tlzubw.png"
            alt="VeenaTravel"
            className="logo"
            onClick={() => handleNavigation("/")}
            style={{ cursor: "pointer" }}
          />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`mobile-menu-toggle ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Menu */}
        <ul className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          <li>
            <a href="#" onClick={() => handleNavigation("/")}>
              Trang chủ
            </a>
          </li>
          <li>
            <a href="#about" onClick={closeMenu}>
              Giới thiệu
            </a>
          </li>
          <li>
            <a href="#" onClick={() => handleNavigation("/services")}>
              Dịch vụ
            </a>
          </li>
          <li>
            <a href="#contact" onClick={closeMenu}>
              Liên hệ
            </a>
          </li>
          <li className="mobile-cta">
            <button
              className="btn-register mobile"
              onClick={() => {
                openAuthModal("register");
                closeMenu();
              }}
            >
              Đăng ký ngay
            </button>
          </li>
        </ul>

        {/* Desktop CTA */}
        <div className="nav-cta desktop-only">
          <button
            className="btn-register"
            onClick={() => openAuthModal("register")}
          >
            Đăng ký ngay
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMenu}></div>
      )}
    </header>
  );
};

export default Header;
