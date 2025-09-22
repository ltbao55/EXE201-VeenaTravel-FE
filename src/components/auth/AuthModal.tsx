import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./AuthModal.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode: _initialMode = "login",
}) => {
  const { login, register, switchAuthMode, authMode } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (authMode === "login") {
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          alert("Mật khẩu không khớp!");
          return;
        }
        await register(formData.name, formData.email, formData.password);
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={onClose}>
          &times;
        </span>

        {authMode === "login" ? (
          <div className="auth-form active">
            <h2>Chào mừng đến Veena Travel!</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className="btn-auth">
                Đăng nhập
              </button>
            </form>

            <div className="divider">
              <span>hoặc</span>
            </div>

            <button className="btn-google">
              <i className="fab fa-google"></i>
              Tiếp tục với Google
            </button>

            <p className="auth-switch">
              Chưa có tài khoản?
              <a href="#" onClick={() => switchAuthMode("register")}>
                Đăng ký ngay
              </a>
            </p>
          </div>
        ) : (
          <div className="auth-form active">
            <h2>Tạo tài khoản mới</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Họ và tên"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Xác nhận mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
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
              <i className="fab fa-google"></i>
              Tiếp tục với Google
            </button>

            <div className="premium-offer">
              <h3>🎉 Ưu đãi đặc biệt cho thành viên mới!</h3>
              <p>Đăng ký Premium ngay hôm nay và nhận:</p>
              <ul>
                <li>✨ Tư vấn cá nhân hóa không giới hạn</li>
                <li>🗺️ Lập lịch trình chi tiết tự động</li>
                <li>💰 Giảm giá đến 20% cho các tour</li>
                <li>📞 Hỗ trợ 24/7</li>
              </ul>
              <button className="btn-premium">Đăng ký Premium</button>
            </div>

            <p className="auth-switch">
              Đã có tài khoản?{" "}
              <a href="#" onClick={() => switchAuthMode("login")}>
                Đăng nhập
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
