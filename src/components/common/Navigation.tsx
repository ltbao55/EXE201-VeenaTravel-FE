import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navigation.css";

interface NavigationProps {
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { path: "/", icon: "fas fa-comments", label: "Chat" },
    { path: "/map", icon: "fas fa-map", label: "Lịch trình" },
    { path: "/explore", icon: "fas fa-compass", label: "Khám phá" },
    { path: "/profile", icon: "fas fa-user", label: "Hồ sơ" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className={`chat-tabs ${className}`}>
      {navigationItems.map((item) => (
        <button
          key={item.path}
          className={`tab-btn ${
            location.pathname === item.path ? "active" : ""
          }`}
          onClick={() => handleNavigation(item.path)}
        >
          <i className={item.icon}></i>
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default Navigation;
