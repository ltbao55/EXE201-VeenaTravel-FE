import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./UserProfile.css";

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    try {
      logout();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Generate avatar from user name or use provided avatar
  const getAvatarSrc = () => {
    if (user?.avatar) {
      return user.avatar;
    }
    // Generate a simple avatar with user initials
    return undefined;
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.name[0].toUpperCase();
  };

  if (!user) return null;

  return (
    <div className="user-profile" ref={dropdownRef}>
      <div className="user-avatar-container" onClick={toggleDropdown}>
        {getAvatarSrc() ? (
          <img src={getAvatarSrc()} alt={user.name} className="user-avatar" />
        ) : (
          <div className="user-avatar-placeholder">{getUserInitials()}</div>
        )}
        <span className="user-name">{user.name}</span>
        <svg
          className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {isDropdownOpen && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <div className="dropdown-user-info">
              <div className="dropdown-user-name">{user.name}</div>
              <div className="dropdown-user-email">{user.email}</div>
              {user.isPremium && <span className="premium-badge">Premium</span>}
            </div>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-menu">
            <button
              className="dropdown-item"
              onClick={() => setIsDropdownOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8Z"
                  fill="currentColor"
                />
                <path
                  d="M8 10C4.68629 10 2 12.6863 2 16H14C14 12.6863 11.3137 10 8 10Z"
                  fill="currentColor"
                />
              </svg>
              Hồ sơ cá nhân
            </button>

            <button
              className="dropdown-item"
              onClick={() => setIsDropdownOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1C6.61929 1 5.5 2.11929 5.5 3.5V4H4.5C3.67157 4 3 4.67157 3 5.5V12.5C3 13.3284 3.67157 14 4.5 14H11.5C12.3284 14 13 13.3284 13 12.5V5.5C13 4.67157 12.3284 4 11.5 4H10.5V3.5C10.5 2.11929 9.38071 1 8 1ZM9.5 4V3.5C9.5 2.67157 8.82843 2 8 2C7.17157 2 6.5 2.67157 6.5 3.5V4H9.5Z"
                  fill="currentColor"
                />
              </svg>
              Cài đặt
            </button>

            <div className="dropdown-divider"></div>

            <button
              className="dropdown-item logout-item"
              onClick={handleLogout}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11 11L14 8L11 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 8H6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
