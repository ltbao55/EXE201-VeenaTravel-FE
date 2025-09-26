import React, { useState } from "react";
import "../styles/profile.css";

const Profile: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    username: "",
    website: "",
    location: "",
    bio: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [activeSection, setActiveSection] = useState("profile");

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div
            className={`sidebar-item ${
              activeSection === "profile" ? "active" : ""
            }`}
            onClick={() => setActiveSection("profile")}
          >
            <i className="fas fa-user"></i>
            <span>Chỉnh sửa hồ sơ</span>
          </div>
          <div
            className={`sidebar-item ${
              activeSection === "account" ? "active" : ""
            }`}
            onClick={() => setActiveSection("account")}
          >
            <i className="fas fa-cog"></i>
            <span>Tài khoản</span>
          </div>
          <div
            className={`sidebar-item ${
              activeSection === "preferences" ? "active" : ""
            }`}
            onClick={() => setActiveSection("preferences")}
          >
            <i className="fas fa-heart"></i>
            <span>Sở thích du lịch</span>
          </div>
          <div
            className={`sidebar-item ${
              activeSection === "notifications" ? "active" : ""
            }`}
            onClick={() => setActiveSection("notifications")}
          >
            <i className="fas fa-bell"></i>
            <span>Cài đặt thông báo</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-main">
          {/* Profile Section */}
          <div
            className={`profile-section ${
              activeSection === "profile" ? "active" : ""
            }`}
          >
            <div className="profile-header">
              <h2>Hồ sơ</h2>
              <div className="profile-avatar">
                <div
                  className="avatar-circle"
                  style={{ width: "60px", height: "60px" }}
                >
                  <i className="fas fa-user" style={{ fontSize: "24px" }}></i>
                </div>
                <div className="avatar-info">
                  <div className="traveler-badge">
                    <i className="fas fa-user"></i>
                    @traveler
                  </div>
                  <p className="avatar-subtitle">(Tài khoản đã xác)</p>
                </div>
              </div>
            </div>

            <div className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Tên</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Họ</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="username">Tên người dùng</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Nơi ở</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Mô tả</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Viết một chút về bản thân..."
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-save">
                  <i className="fas fa-save"></i>
                  Lưu thay đổi
                </button>
                <button type="button" className="btn-cancel">
                  <i className="fas fa-times"></i>
                  Hủy
                </button>
              </div>
            </div>
          </div>

          {/* Account Section */}
          <div
            className={`profile-section ${
              activeSection === "account" ? "active" : ""
            }`}
          >
            <div className="profile-header">
              <h2>Cài đặt tài khoản</h2>
            </div>
            <div className="account-settings">
              <div className="setting-item">
                <h3>Đổi mật khẩu</h3>
                <p>Cập nhật mật khẩu để bảo mật tài khoản</p>
                <button className="btn-secondary">
                  <i className="fas fa-key"></i>
                  Đổi mật khẩu
                </button>
              </div>
              <div className="setting-item">
                <h3>Xóa tài khoản</h3>
                <p>Xóa vĩnh viễn tài khoản và tất cả dữ liệu</p>
                <button className="btn-danger">
                  <i className="fas fa-trash"></i>
                  Xóa tài khoản
                </button>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div
            className={`profile-section ${
              activeSection === "preferences" ? "active" : ""
            }`}
          >
            <div className="profile-header">
              <h2>Sở thích du lịch</h2>
            </div>
            <div className="preferences-content">
              <div className="preference-group">
                <h3>Loại hình du lịch yêu thích</h3>
                <div className="checkbox-group">
                  <label>
                    <input type="checkbox" />
                    Du lịch biển
                  </label>
                  <label>
                    <input type="checkbox" />
                    Du lịch núi
                  </label>
                  <label>
                    <input type="checkbox" />
                    Du lịch văn hóa
                  </label>
                  <label>
                    <input type="checkbox" />
                    Du lịch ẩm thực
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div
            className={`profile-section ${
              activeSection === "notifications" ? "active" : ""
            }`}
          >
            <div className="profile-header">
              <h2>Cài đặt thông báo</h2>
            </div>
            <div className="notifications-content">
              <div className="notification-item">
                <div className="notification-info">
                  <h3>Thông báo email</h3>
                  <p>Nhận thông báo về tour mới qua email</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="notification-item">
                <div className="notification-info">
                  <h3>Thông báo khuyến mãi</h3>
                  <p>Nhận thông báo về các chương trình khuyến mãi</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
