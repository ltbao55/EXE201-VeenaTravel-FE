import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/profile.css";

// Professional Profile component
const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const hardNavigate = (path: string) => {
    try {
      navigate(path);
    } finally {
      // Fallback đảm bảo component route được mount
      setTimeout(() => {
        if (window.location.pathname !== path) {
          window.location.assign(path);
        }
      }, 0);
    }
  };
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    phone: "",
  });

  // Enhanced profile data with more realistic information (memoized to avoid effect loops)
  const profileData = useMemo(
    () =>
      user
        ? {
            id: (user as any).id || (user as any)._id || (user as any).uid,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            isPremium: (user as any).isPremium,
            bio: "Tôi là một người yêu thích du lịch và khám phá những vùng đất mới. Với niềm đam mê khám phá văn hóa và ẩm thực địa phương, tôi luôn tìm kiếm những trải nghiệm độc đáo và ý nghĩa trong mỗi chuyến đi.",
            location: "Thành phố Hồ Chí Minh, Việt Nam",
            website: "https://veenatravel.com",
            phone: "+84 123 456 789",
            joinDate: "Tháng 1, 2024",
            totalTrips: 12,
            favoriteDestinations: 8,
            reviews: 24,
            preferences: {
              travelTypes: [
                "Du lịch biển",
                "Du lịch núi",
                "Du lịch văn hóa",
                "Du lịch ẩm thực",
              ],
              notifications: {
                email: true,
                push: true,
                sms: false,
              },
            },
          }
        : null,
    [user]
  );

  useEffect(() => {
    if (profileData) {
      setEditFormData({
        name: profileData.name,
        email: profileData.email,
        bio: profileData.bio,
        location: profileData.location,
        website: profileData.website,
        phone: profileData.phone,
      });
    }
  }, [profileData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to API
    setIsEditing(false);
    // Show success message
    alert("Thông tin đã được cập nhật thành công!");
  };

  const handleCancel = () => {
    setEditFormData({
      name: profileData?.name || "",
      email: profileData?.email || "",
      bio: profileData?.bio || "",
      location: profileData?.location || "",
      website: profileData?.website || "",
      phone: profileData?.phone || "",
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Chưa đăng nhập</h3>
            <p>Vui lòng đăng nhập để xem thông tin profile</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Enhanced Sidebar */}
        <div className="profile-sidebar">
          <div className="sidebar-header">
            <h3>Hồ sơ của tôi</h3>
          </div>
          <div
            className={`sidebar-item ${
              activeSection === "profile" ? "active" : ""
            }`}
            onClick={() => setActiveSection("profile")}
          >
            <i className="fas fa-user"></i>
            <span>Thông tin cá nhân</span>
          </div>
          <div
            className={`sidebar-item ${
              activeSection === "account" ? "active" : ""
            }`}
            onClick={() => setActiveSection("account")}
          >
            <i className="fas fa-cog"></i>
            <span>Tài khoản & Bảo mật</span>
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
            <span>Thông báo</span>
          </div>
          <div
            className={`sidebar-item ${
              activeSection === "activity" ? "active" : ""
            }`}
            onClick={() => setActiveSection("activity")}
          >
            <i className="fas fa-chart-line"></i>
            <span>Hoạt động</span>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="profile-main">
          {/* Profile Section */}
          <div
            className={`profile-section ${
              activeSection === "profile" ? "active" : ""
            }`}
          >
            {/* Enhanced Profile Header */}
            <div className="profile-header">
              <div className="header-content">
                <h2>Thông tin cá nhân</h2>
                <p>Quản lý thông tin cá nhân và cài đặt hồ sơ của bạn</p>
              </div>
              <div className="header-actions">
                {!isEditing ? (
                  <button
                    className="btn-edit-profile"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="fas fa-edit"></i>
                    Chỉnh sửa
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button className="btn-save" onClick={handleSave}>
                      <i className="fas fa-save"></i>
                      Lưu
                    </button>
                    <button className="btn-cancel" onClick={handleCancel}>
                      <i className="fas fa-times"></i>
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Profile Card */}
            <div className="profile-card">
              <div className="profile-avatar-section">
                <div className="avatar-container">
                  <div className="avatar-circle">
                    {profileData?.avatar ? (
                      <img
                        src={profileData.avatar}
                        alt={profileData.name}
                        className="avatar-image"
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {profileData?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <button className="avatar-upload-btn">
                    <i className="fas fa-camera"></i>
                  </button>
                </div>
                <div className="avatar-info">
                  <h3 className="user-name">
                    {profileData?.name || "Chưa có tên"}
                  </h3>
                  <p className="user-email">{profileData?.email}</p>
                  <div className="user-badges">
                    {profileData?.isPremium && (
                      <span className="premium-badge">
                        <i className="fas fa-crown"></i>
                        Premium Member
                      </span>
                    )}
                    <span className="member-badge">
                      <i className="fas fa-calendar"></i>
                      Thành viên từ {profileData?.joinDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-plane"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{profileData?.totalTrips}</div>
                    <div className="stat-label">Chuyến đi</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {profileData?.favoriteDestinations}
                    </div>
                    <div className="stat-label">Điểm đến yêu thích</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-star"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{profileData?.reviews}</div>
                    <div className="stat-label">Đánh giá</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="profile-info-section">
              <div className="section-header">
                <h3>Thông tin chi tiết</h3>
              </div>

              {isEditing ? (
                <div className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Họ và tên</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={editFormData.name}
                        onChange={handleInputChange}
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleInputChange}
                        placeholder="Nhập email"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Số điện thoại</label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={editFormData.phone}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="location">Địa chỉ</label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={editFormData.location}
                        onChange={handleInputChange}
                        placeholder="Nhập địa chỉ"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="website">Website</label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={editFormData.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bio">Giới thiệu bản thân</label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={editFormData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Hãy giới thiệu về bản thân bạn..."
                    />
                  </div>
                </div>
              ) : (
                <div className="profile-info-grid">
                  <div className="info-card">
                    <div className="info-icon">
                      <i className="fas fa-user"></i>
                    </div>
                    <div className="info-content">
                      <div className="info-label">Họ và tên</div>
                      <div className="info-value">
                        {profileData?.name || "Chưa có thông tin"}
                      </div>
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-icon">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div className="info-content">
                      <div className="info-label">Email</div>
                      <div className="info-value">{profileData?.email}</div>
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-icon">
                      <i className="fas fa-phone"></i>
                    </div>
                    <div className="info-content">
                      <div className="info-label">Số điện thoại</div>
                      <div className="info-value">
                        {profileData?.phone || "Chưa có thông tin"}
                      </div>
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-icon">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div className="info-content">
                      <div className="info-label">Địa chỉ</div>
                      <div className="info-value">
                        {profileData?.location || "Chưa có thông tin"}
                      </div>
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-icon">
                      <i className="fas fa-globe"></i>
                    </div>
                    <div className="info-content">
                      <div className="info-label">Website</div>
                      <div className="info-value">
                        {profileData?.website ? (
                          <a
                            href={profileData.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {profileData.website}
                          </a>
                        ) : (
                          "Chưa có thông tin"
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="info-card full-width">
                    <div className="info-icon">
                      <i className="fas fa-quote-left"></i>
                    </div>
                    <div className="info-content">
                      <div className="info-label">Giới thiệu</div>
                      <div className="info-value bio-text">
                        {profileData?.bio || "Chưa có thông tin"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                <div className="travel-types">
                  {profileData?.preferences?.travelTypes?.length ? (
                    <div className="selected-types">
                      {profileData.preferences.travelTypes.map(
                        (type, index) => (
                          <span key={index} className="travel-type-tag">
                            {type}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="no-data">
                      Chưa có sở thích du lịch nào được thiết lập
                    </p>
                  )}
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
                <div className="notification-status">
                  {profileData?.preferences?.notifications?.email ? (
                    <span className="status-enabled">
                      <i className="fas fa-check"></i>
                      Đã bật
                    </span>
                  ) : (
                    <span className="status-disabled">
                      <i className="fas fa-times"></i>
                      Đã tắt
                    </span>
                  )}
                </div>
              </div>
              <div className="notification-item">
                <div className="notification-info">
                  <h3>Thông báo push</h3>
                  <p>Nhận thông báo push trên thiết bị</p>
                </div>
                <div className="notification-status">
                  {profileData?.preferences?.notifications?.push ? (
                    <span className="status-enabled">
                      <i className="fas fa-check"></i>
                      Đã bật
                    </span>
                  ) : (
                    <span className="status-disabled">
                      <i className="fas fa-times"></i>
                      Đã tắt
                    </span>
                  )}
                </div>
              </div>
              <div className="notification-item">
                <div className="notification-info">
                  <h3>Thông báo SMS</h3>
                  <p>Nhận thông báo qua tin nhắn SMS</p>
                </div>
                <div className="notification-status">
                  {profileData?.preferences?.notifications?.sms ? (
                    <span className="status-enabled">
                      <i className="fas fa-check"></i>
                      Đã bật
                    </span>
                  ) : (
                    <span className="status-disabled">
                      <i className="fas fa-times"></i>
                      Đã tắt
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
