import React from "react";
import { useNavigate } from "react-router-dom";

interface SidebarFooterProps {
  activeItem?: string;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ activeItem }) => {
  const navigate = useNavigate();

  return (
    <div className="sidebar-footer">
      <div
        className={`user-profile ${activeItem === "profile" ? "active" : ""}`}
        onClick={() => navigate("/chat/profile")}
        style={{ cursor: "pointer" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span>Traveler</span>
        <div className="profile-tooltip">View profile</div>
      </div>
    </div>
  );
};

export default SidebarFooter;
