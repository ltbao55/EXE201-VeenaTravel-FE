import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import UserProfile from "../common/UserProfile";
import "./Header.css";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-brand">
          <img
            src="https://res.cloudinary.com/djytw2oj3/image/upload/v1758702781/logo-veena_tlzubw.png"
            alt="VeenaTravel"
            className="logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          />
        </div>
        <ul className="nav-menu">
          <li>
            <a href="#" onClick={() => navigate("/")}>
              Trang chủ
            </a>
          </li>
          <li>
            <a href="#about">Giới thiệu</a>
          </li>
          <li>
            <a href="#" onClick={() => navigate("/services")}>
              Dịch vụ
            </a>
          </li>
          <li>
            <a href="#contact">Liên hệ</a>
          </li>
        </ul>
        <div className="nav-cta">
          {isAuthenticated ? (
            <UserProfile />
          ) : (
            <>
              <button
                className="btn-login"
                onClick={() => openAuthModal("login")}
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
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
