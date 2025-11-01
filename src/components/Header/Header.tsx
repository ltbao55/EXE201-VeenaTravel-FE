import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import subscriptionService, { type PlanType } from "../../services/subscriptionService";
import PaymentService from "../../services/paymentService";
import "./Header.css";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { openAuthModal, isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [planType, setPlanType] = useState<PlanType | null>(null);

  useEffect(() => {
    const loadPlan = async () => {
      if (!isAuthenticated) {
        setPlanType(null);
        return;
      }
      try {
        const res = await subscriptionService.getCurrent();
        if (res.success && (res.data as any)?.subscription) {
          const plan: any = (res.data as any).subscription.planId as any;
          setPlanType((plan?.type as PlanType) || "free");
        } else {
          // Fallback: nếu chưa có subscription, kiểm tra lịch sử thanh toán
          try {
            const paid = await PaymentService.getUserPayments(1, 1, "paid");
            if (Array.isArray(paid.data) && paid.data.length > 0) {
              setPlanType("premium");
            } else {
              setPlanType("free");
            }
          } catch {
            setPlanType("free");
          }
        }
      } catch {
        // Fallback: thử kiểm tra thanh toán 'paid'
        try {
          const paid = await PaymentService.getUserPayments(1, 1, "paid");
          if (Array.isArray(paid.data) && paid.data.length > 0) {
            setPlanType("premium");
          } else {
            setPlanType("free");
          }
        } catch {
          setPlanType("free");
        }
      }
    };
    loadPlan();
  }, [isAuthenticated]);

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
                {planType && (
                  <span
                    style={{
                      marginLeft: 8,
                      padding: "2px 6px",
                      borderRadius: 8,
                      fontSize: 12,
                      background:
                        planType === "premium"
                          ? "rgba(255, 215, 0, 0.15)"
                          : planType === "pro"
                          ? "rgba(76, 175, 80, 0.15)"
                          : "rgba(0,0,0,0.08)",
                      color:
                        planType === "premium"
                          ? "#b28900"
                          : planType === "pro"
                          ? "#2e7d32"
                          : "#555",
                      textTransform: "uppercase",
                    }}
                  >
                    {planType}
                  </span>
                )}
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
