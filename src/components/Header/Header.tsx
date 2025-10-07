import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { openAuthModal, isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
            <a href="#" onClick={() => handleNavigation("/services")}>
              Dịch vụ
            </a>
          </li>

          <li>
            <a href="#" onClick={() => handleNavigation("/chat/explore")}>
              Khám phá
            </a>
          </li>
          <li>
            <a href="#" onClick={() => handleNavigation("/chat")}>
              Chat
            </a>
          </li>

          {/* Mobile auth actions */}
          {!isAuthenticated && (
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
              <button
                className="btn-register mobile"
                style={{ marginTop: "0.5rem" }}
                onClick={() => {
                  openAuthModal("login");
                  closeMenu();
                }}
              >
                Đăng nhập
              </button>
            </li>
          )}
        </ul>

        {/* Desktop CTA */}
        <div className="nav-cta desktop-only">
          {!isAuthenticated ? (
            <>
              <button
                className="btn-register"
                onClick={() => openAuthModal("login")}
                style={{ marginRight: "0.5rem" }}
              >
                Đăng nhập
              </button>
              <button
                className="btn-register"
                onClick={() => openAuthModal("register")}
              >
                Đăng ký ngay
              </button>
            </>
          ) : (
            <div style={{ position: "relative" }}>
              <button
                className="btn-register"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "User"}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      marginRight: 8,
                      verticalAlign: "middle",
                    }}
                  />
                ) : null}
                {user?.name || "Tài khoản"}
              </button>
              {isUserMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "110%",
                    background: "rgba(255,255,255,0.95)",
                    borderRadius: 12,
                    padding: "0.5rem",
                    minWidth: 180,
                    boxShadow:
                      "0 12px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.3)",
                  }}
                >
                  <button
                    className="btn-register"
                    onClick={() => handleNavigation("/chat/profile")}
                    style={{ width: "100%", marginBottom: 8 }}
                  >
                    Hồ sơ
                  </button>
                  <button
                    className="btn-register"
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    style={{ width: "100%" }}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
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
