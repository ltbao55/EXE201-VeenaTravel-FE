import React, { useState } from "react";
import Navigation from "../components/common/Navigation";

const ProfilePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("profile");

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <div className="profile-page">
      <Navigation />

      {/* Profile Container */}
      <div className="profile-container">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div
            className={`sidebar-item ${
              activeSection === "profile" ? "active" : ""
            }`}
            onClick={() => handleSectionChange("profile")}
          >
            <i className="fas fa-user"></i>
            Chỉnh sửa hồ sơ
          </div>
          <div
            className={`sidebar-item ${
              activeSection === "account" ? "active" : ""
            }`}
            onClick={() => handleSectionChange("account")}
          >
            <i className="fas fa-cog"></i>
            Tài khoản
          </div>
          <div
            className={`sidebar-item ${
              activeSection === "preferences" ? "active" : ""
            }`}
            onClick={() => handleSectionChange("preferences")}
          >
            <i className="fas fa-heart"></i>
            Sở thích du lịch
          </div>
          <div
            className={`sidebar-item ${
              activeSection === "notifications" ? "active" : ""
            }`}
            onClick={() => handleSectionChange("notifications")}
          >
            <i className="fas fa-bell"></i>
            Cài đặt thông báo
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-main">
          {/* Profile Section */}
          {activeSection === "profile" && (
            <div className="profile-section">
              <div className="profile-header">
                <h2>Hồ sơ</h2>
                <div className="profile-avatar">
                  <div className="avatar-circle">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="avatar-info">
                    <span className="traveler-badge">
                      <i className="fas fa-plane"></i>
                      @traveler
                    </span>
                    <p className="avatar-subtitle">(Tên hiển thị của bạn)</p>
                  </div>
                </div>
              </div>

              <div className="profile-form">
                <div className="form-group">
                  <label htmlFor="name">Tên</label>
                  <input type="text" id="name" placeholder="Nhập tên của bạn" />
                </div>

                <div className="form-group">
                  <label htmlFor="surname">Họ</label>
                  <input
                    type="text"
                    id="surname"
                    placeholder="Nhập họ của bạn"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="username">Tên người dùng</label>
                  <input
                    type="text"
                    id="username"
                    placeholder="Nhập tên người dùng"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="website">Website</label>
                  <input
                    type="url"
                    id="website"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Mô tả</label>
                  <textarea
                    id="bio"
                    rows={4}
                    placeholder="Viết một chút về bản thân..."
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button className="btn-save">
                    <i className="fas fa-save"></i>
                    Lưu thay đổi
                  </button>
                  <button className="btn-cancel">
                    <i className="fas fa-times"></i>
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Account Section */}
          {activeSection === "account" && (
            <div className="profile-section">
              <div className="profile-header">
                <h2>Tài khoản</h2>
              </div>
              <div className="account-settings">
                <div className="setting-item">
                  <h3>Đổi mật khẩu</h3>
                  <p>Cập nhật mật khẩu để bảo mật tài khoản</p>
                  <button className="btn-secondary">Đổi mật khẩu</button>
                </div>
                <div className="setting-item">
                  <h3>Xóa tài khoản</h3>
                  <p>Xóa vĩnh viễn tài khoản và tất cả dữ liệu</p>
                  <button className="btn-danger">Xóa tài khoản</button>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Section */}
          {activeSection === "preferences" && (
            <div className="profile-section">
              <div className="profile-header">
                <h2>Sở thích du lịch</h2>
              </div>
              <div className="preferences-content">
                <div className="preference-group">
                  <h3>Loại hình du lịch yêu thích</h3>
                  <div className="checkbox-group">
                    <label>
                      <input type="checkbox" /> Nghỉ dưỡng
                    </label>
                    <label>
                      <input type="checkbox" /> Khám phá văn hóa
                    </label>
                    <label>
                      <input type="checkbox" /> Phiêu lưu
                    </label>
                    <label>
                      <input type="checkbox" /> Ẩm thực
                    </label>
                  </div>
                </div>
                <div className="preference-group">
                  <h3>Ngân sách ưa thích</h3>
                  <select className="form-select">
                    <option>Tiết kiệm</option>
                    <option>Trung bình</option>
                    <option>Cao cấp</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button className="btn-save">
                    <i className="fas fa-save"></i>
                    Lưu sở thích
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <div className="profile-section">
              <div className="profile-header">
                <h2>Cài đặt thông báo</h2>
              </div>
              <div className="notifications-content">
                <div className="notification-item">
                  <div className="notification-info">
                    <h3>Thông báo email</h3>
                    <p>Nhận thông báo về chuyến đi qua email</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="notification-item">
                  <div className="notification-info">
                    <h3>Thông báo đẩy</h3>
                    <p>Nhận thông báo trên thiết bị</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="notification-item">
                  <div className="notification-info">
                    <h3>Thông báo SMS</h3>
                    <p>Nhận thông báo qua tin nhắn</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="notification-item">
                  <div className="notification-info">
                    <h3>Thông báo khuyến mãi</h3>
                    <p>Nhận thông báo về các ưu đãi đặc biệt</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="form-actions">
                  <button className="btn-save">
                    <i className="fas fa-save"></i>
                    Lưu cài đặt
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
