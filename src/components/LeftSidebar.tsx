import React from "react";
import { useNavigate } from "react-router-dom";
import SidebarFooter from "./SidebarFooter";

interface LeftSidebarProps {
  activeItem?: string;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ activeItem = "chats" }) => {
  const navigate = useNavigate();

  return (
    <div className="left-sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo" onClick={() => navigate("/")}>
            <img
              src="https://res.cloudinary.com/djytw2oj3/image/upload/v1758702781/logo-veena_tlzubw.png"
              alt="Veena Travel Logo"
            />
          </div>
          <button
            className="home-arrow"
            onClick={() => navigate("/")}
            title="Về trang chủ"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="sidebar-menu">
        <div
          className={`menu-item ${activeItem === "chats" ? "active" : ""}`}
          onClick={() => navigate("/chat")}
        >
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
          {activeItem === "chats" && <span className="badge">1</span>}
        </div>

        <div
          className={`menu-item ${activeItem === "explore" ? "active" : ""}`}
          onClick={() => navigate("/chat/explore")}
        >
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

        {null}
      </div>

      <SidebarFooter activeItem={activeItem} />
    </div>
  );
};

export default LeftSidebar;
