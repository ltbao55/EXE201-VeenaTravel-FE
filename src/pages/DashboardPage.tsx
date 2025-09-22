import React, { useState } from 'react';
import '../styles/DashboardPage.css';

const DashboardPage: React.FC = () => {
  const [activePage, setActivePage] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handlePageChange = (page: string) => {
    setActivePage(page);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <i className="fas fa-plane"></i>
            <span>VeenaTravel</span>
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <i className="fas fa-bars"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className={`nav-item ${activePage === 'overview' ? 'active' : ''}`}>
              <a href="#overview" className="nav-link" onClick={() => handlePageChange('overview')}>
                <i className="fas fa-chart-pie"></i>
                <span>Tổng Quan</span>
              </a>
            </li>
            <li className={`nav-item ${activePage === 'revenue' ? 'active' : ''}`}>
              <a href="#revenue" className="nav-link" onClick={() => handlePageChange('revenue')}>
                <i className="fas fa-dollar-sign"></i>
                <span>Doanh Thu</span>
              </a>
            </li>
            <li className={`nav-item ${activePage === 'users' ? 'active' : ''}`}>
              <a href="#users" className="nav-link" onClick={() => handlePageChange('users')}>
                <i className="fas fa-users"></i>
                <span>Người Dùng</span>
              </a>
            </li>
            <li className={`nav-item ${activePage === 'transactions' ? 'active' : ''}`}>
              <a href="#transactions" className="nav-link" onClick={() => handlePageChange('transactions')}>
                <i className="fas fa-credit-card"></i>
                <span>Giao Dịch</span>
              </a>
            </li>
            <li className={`nav-item ${activePage === 'bookings' ? 'active' : ''}`}>
              <a href="#bookings" className="nav-link" onClick={() => handlePageChange('bookings')}>
                <i className="fas fa-calendar-check"></i>
                <span>Đặt Chỗ</span>
              </a>
            </li>
            <li className={`nav-item ${activePage === 'analytics' ? 'active' : ''}`}>
              <a href="#analytics" className="nav-link" onClick={() => handlePageChange('analytics')}>
                <i className="fas fa-chart-line"></i>
                <span>Phân Tích</span>
              </a>
            </li>
            <li className={`nav-item ${activePage === 'settings' ? 'active' : ''}`}>
              <a href="#settings" className="nav-link" onClick={() => handlePageChange('settings')}>
                <i className="fas fa-cog"></i>
                <span>Cài Đặt</span>
              </a>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <i className="fas fa-user"></i>
            </div>
            <div className="user-info">
              <span className="user-name">Admin</span>
              <span className="user-role">Quản trị viên</span>
            </div>
          </div>
          <button className="logout-btn">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
              <i className="fas fa-bars"></i>
            </button>
            <h1 className="page-title">
              {activePage === 'overview' && 'Tổng Quan'}
              {activePage === 'revenue' && 'Doanh Thu'}
              {activePage === 'users' && 'Người Dùng'}
              {activePage === 'transactions' && 'Giao Dịch'}
              {activePage === 'bookings' && 'Đặt Chỗ'}
              {activePage === 'analytics' && 'Phân Tích'}
              {activePage === 'settings' && 'Cài Đặt'}
            </h1>
          </div>

          <div className="header-right">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Tìm kiếm..." />
            </div>

            <div className="header-actions">
              <button className="notification-btn">
                <i className="fas fa-bell"></i>
                <span className="notification-badge">3</span>
              </button>

              <div className="date-range-picker">
                <i className="fas fa-calendar"></i>
                <select>
                  <option value="today">Hôm nay</option>
                  <option value="week">7 ngày qua</option>
                  <option value="month" selected>30 ngày qua</option>
                  <option value="quarter">3 tháng qua</option>
                  <option value="year">1 năm qua</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Overview Page */}
          {activePage === 'overview' && (
            <div className="page-content">
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card revenue">
                  <div className="stat-icon">
                    <i className="fas fa-dollar-sign"></i>
                  </div>
                  <div className="stat-info">
                    <h3>Tổng Doanh Thu</h3>
                    <p className="stat-value">2,450,000,000 VNĐ</p>
                    <span className="stat-change positive">
                      <i className="fas fa-arrow-up"></i> +12.5%
                    </span>
                  </div>
                </div>

                <div className="stat-card users">
                  <div className="stat-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="stat-info">
                    <h3>Tổng Người Dùng</h3>
                    <p className="stat-value">15,847</p>
                    <span className="stat-change positive">
                      <i className="fas fa-arrow-up"></i> +8.2%
                    </span>
                  </div>
                </div>

                <div className="stat-card transactions">
                  <div className="stat-icon">
                    <i className="fas fa-credit-card"></i>
                  </div>
                  <div className="stat-info">
                    <h3>Giao Dịch</h3>
                    <p className="stat-value">3,256</p>
                    <span className="stat-change positive">
                      <i className="fas fa-arrow-up"></i> +15.3%
                    </span>
                  </div>
                </div>

                <div className="stat-card bookings">
                  <div className="stat-icon">
                    <i className="fas fa-calendar-check"></i>
                  </div>
                  <div className="stat-info">
                    <h3>Đặt Chỗ</h3>
                    <p className="stat-value">1,892</p>
                    <span className="stat-change negative">
                      <i className="fas fa-arrow-down"></i> -2.1%
                    </span>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="charts-section">
                <div className="chart-container">
                  <div className="chart-header">
                    <h3>Doanh Thu Theo Tháng</h3>
                    <div className="chart-controls">
                      <button className="chart-btn active">Tháng</button>
                      <button className="chart-btn">Quý</button>
                      <button className="chart-btn">Năm</button>
                    </div>
                  </div>
                  <div className="chart-placeholder">
                    <canvas id="revenueChart"></canvas>
                  </div>
                </div>

                <div className="chart-container">
                  <div className="chart-header">
                    <h3>Phân Bố Dịch Vụ</h3>
                  </div>
                  <div className="chart-placeholder">
                    <canvas id="serviceChart"></canvas>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="recent-activity">
                <div className="activity-header">
                  <h3>Hoạt Động Gần Đây</h3>
                  <a href="#" className="view-all">Xem tất cả</a>
                </div>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon booking">
                      <i className="fas fa-calendar-plus"></i>
                    </div>
                    <div className="activity-content">
                      <p><strong>Nguyễn Văn A</strong> đã đặt tour Hạ Long Bay</p>
                      <span className="activity-time">5 phút trước</span>
                    </div>
                    <div className="activity-amount">+15,000,000 VNĐ</div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-icon user">
                      <i className="fas fa-user-plus"></i>
                    </div>
                    <div className="activity-content">
                      <p>Người dùng mới <strong>Trần Thị B</strong> đã đăng ký</p>
                      <span className="activity-time">12 phút trước</span>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-icon payment">
                      <i className="fas fa-credit-card"></i>
                    </div>
                    <div className="activity-content">
                      <p><strong>Lê Văn C</strong> đã thanh toán đặt phòng khách sạn</p>
                      <span className="activity-time">25 phút trước</span>
                    </div>
                    <div className="activity-amount">+8,500,000 VNĐ</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Page */}
          {activePage === 'revenue' && (
            <div className="page-content">
              <h2>Quản Lý Doanh Thu</h2>
              <p>Nội dung trang doanh thu sẽ được thêm vào...</p>
            </div>
          )}

          {/* Users Page */}
          {activePage === 'users' && (
            <div className="page-content">
              <h2>Quản Lý Người Dùng</h2>
              <p>Nội dung trang người dùng sẽ được thêm vào...</p>
            </div>
          )}

          {/* Other pages */}
          {activePage === 'transactions' && (
            <div className="page-content">
              <h2>Quản Lý Giao Dịch</h2>
              <p>Nội dung trang giao dịch sẽ được thêm vào...</p>
            </div>
          )}

          {activePage === 'bookings' && (
            <div className="page-content">
              <h2>Quản Lý Đặt Chỗ</h2>
              <p>Nội dung trang đặt chỗ sẽ được thêm vào...</p>
            </div>
          )}

          {activePage === 'analytics' && (
            <div className="page-content">
              <h2>Phân Tích</h2>
              <p>Nội dung trang phân tích sẽ được thêm vào...</p>
            </div>
          )}

          {activePage === 'settings' && (
            <div className="page-content">
              <h2>Cài Đặt</h2>
              <p>Nội dung trang cài đặt sẽ được thêm vào...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
