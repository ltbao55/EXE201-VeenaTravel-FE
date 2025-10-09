import React, { useState, useEffect, useRef } from "react";
import "../styles/dashboard.css";
import UserService, { type ManagedUser } from "../services/userService";

declare global {
  interface Window {
    Chart: any;
    revenueChart: any;
    serviceChart: any;
  }
}

const DashboardPage: React.FC = () => {
  const [activePage, setActivePage] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarActive, setSidebarActive] = useState(false);
  const [dateRange, setDateRange] = useState("month");
  const [chartPeriod, setChartPeriod] = useState("month");
  const revenueChartRef = useRef<HTMLCanvasElement>(null);
  const serviceChartRef = useRef<HTMLCanvasElement>(null);

  // Users state
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ name: "", email: "" });

  const handlePageChange = (page: string) => {
    setActivePage(page);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  // Close mobile sidebar on window resize > 768
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarActive(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!sidebarActive) return;
      const sidebar = document.querySelector(".sidebar");
      const btn = document.querySelector(".mobile-menu-btn");
      if (
        sidebar &&
        !sidebar.contains(e.target as Node) &&
        btn &&
        !btn.contains(e.target as Node)
      ) {
        setSidebarActive(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [sidebarActive]);

  // Fetch users when entering Users page
  useEffect(() => {
    const fetchUsers = async () => {
      if (activePage !== "users") return;
      setUsersLoading(true);
      setUsersError(null);
      try {
        const data = await UserService.list();
        setUsers(data);
      } catch (err: any) {
        setUsersError(err.message || "Không thể tải người dùng");
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, [activePage]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    setUsersLoading(true);
    setUsersError(null);
    try {
      const created = await UserService.create({
        name: newUser.name,
        email: newUser.email,
      });
      setUsers((prev) => [created, ...prev]);
      setNewUser({ name: "", email: "" });
    } catch (err: any) {
      setUsersError(err.message || "Tạo người dùng thất bại");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Xóa người dùng này?")) return;
    try {
      await UserService.remove(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      alert(err.message || "Xóa người dùng thất bại");
    }
  };

  const updatePageTitle = (pageId: string) => {
    const titles: { [key: string]: string } = {
      overview: "Tổng Quan",
      revenue: "Quản Lý Doanh Thu",
      users: "Quản Lý Người Dùng",
      transactions: "Quản Lý Giao Dịch",
      bookings: "Quản Lý Đặt Chỗ",
      analytics: "Phân Tích",
      settings: "Cài Đặt",
    };
    return titles[pageId] || "Dashboard";
  };

  // Initialize charts
  useEffect(() => {
    const loadChartJS = async () => {
      if (typeof window !== "undefined" && !window.Chart) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        script.onload = () => {
          initializeCharts();
        };
        document.head.appendChild(script);
      } else if (window.Chart) {
        initializeCharts();
      }
    };

    loadChartJS();
  }, []);

  const initializeCharts = () => {
    // Revenue Chart
    if (revenueChartRef.current && window.Chart) {
      const ctx = revenueChartRef.current.getContext("2d");
      if (ctx) {
        window.revenueChart = new window.Chart(ctx, {
          type: "line",
          data: {
            labels: [
              "T1",
              "T2",
              "T3",
              "T4",
              "T5",
              "T6",
              "T7",
              "T8",
              "T9",
              "T10",
              "T11",
              "T12",
            ],
            datasets: [
              {
                label: "Doanh Thu (VNĐ)",
                data: [
                  180000000, 220000000, 195000000, 240000000, 280000000,
                  310000000, 290000000, 350000000, 320000000, 380000000,
                  410000000, 450000000,
                ],
                borderColor: "#3498db",
                backgroundColor: "rgba(52, 152, 219, 0.1)",
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#3498db",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: "rgba(0, 0, 0, 0.1)",
                },
                ticks: {
                  callback: function (value: any) {
                    return (value / 1000000).toFixed(0) + "M";
                  },
                },
              },
              x: {
                grid: {
                  color: "rgba(0, 0, 0, 0.1)",
                },
              },
            },
          },
        });
      }
    }

    // Service Distribution Chart
    if (serviceChartRef.current && window.Chart) {
      const ctx = serviceChartRef.current.getContext("2d");
      if (ctx) {
        window.serviceChart = new window.Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Tour", "Khách Sạn", "Vé Máy Bay", "Nhà Hàng", "Thuê Xe"],
            datasets: [
              {
                data: [35, 25, 20, 12, 8],
                backgroundColor: [
                  "#3498db",
                  "#e74c3c",
                  "#27ae60",
                  "#f39c12",
                  "#9b59b6",
                ],
                borderWidth: 0,
                hoverOffset: 10,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  padding: 20,
                  usePointStyle: true,
                },
              },
            },
          },
        });
      }
    }
  };

  const updateRevenueChart = (period: string) => {
    if (!window.revenueChart) return;

    const data: { [key: string]: { labels: string[]; data: number[] } } = {
      month: {
        labels: [
          "T1",
          "T2",
          "T3",
          "T4",
          "T5",
          "T6",
          "T7",
          "T8",
          "T9",
          "T10",
          "T11",
          "T12",
        ],
        data: [
          180000000, 220000000, 195000000, 240000000, 280000000, 310000000,
          290000000, 350000000, 320000000, 380000000, 410000000, 450000000,
        ],
      },
      quarter: {
        labels: ["Q1", "Q2", "Q3", "Q4"],
        data: [595000000, 830000000, 960000000, 1240000000],
      },
      year: {
        labels: ["2020", "2021", "2022", "2023", "2024"],
        data: [2800000000, 3200000000, 2900000000, 3800000000, 4200000000],
      },
    };

    const chartData = data[period] || data.month;

    window.revenueChart.data.labels = chartData.labels;
    window.revenueChart.data.datasets[0].data = chartData.data;
    window.revenueChart.update();
  };

  const handleChartPeriodChange = (period: string) => {
    setChartPeriod(period);
    updateRevenueChart(period);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarCollapsed ? "collapsed" : ""} ${
          sidebarActive ? "active" : ""
        }`}
      >
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
            <li
              className={`nav-item ${
                activePage === "overview" ? "active" : ""
              }`}
            >
              <a
                href="#overview"
                className="nav-link"
                onClick={() => handlePageChange("overview")}
              >
                <i className="fas fa-chart-pie"></i>
                <span>Tổng Quan</span>
              </a>
            </li>
            <li
              className={`nav-item ${activePage === "revenue" ? "active" : ""}`}
            >
              <a
                href="#revenue"
                className="nav-link"
                onClick={() => handlePageChange("revenue")}
              >
                <i className="fas fa-dollar-sign"></i>
                <span>Doanh Thu</span>
              </a>
            </li>
            <li
              className={`nav-item ${activePage === "users" ? "active" : ""}`}
            >
              <a
                href="#users"
                className="nav-link"
                onClick={() => handlePageChange("users")}
              >
                <i className="fas fa-users"></i>
                <span>Người Dùng</span>
              </a>
            </li>
            <li
              className={`nav-item ${
                activePage === "transactions" ? "active" : ""
              }`}
            >
              <a
                href="#transactions"
                className="nav-link"
                onClick={() => handlePageChange("transactions")}
              >
                <i className="fas fa-credit-card"></i>
                <span>Giao Dịch</span>
              </a>
            </li>
            <li
              className={`nav-item ${
                activePage === "bookings" ? "active" : ""
              }`}
            >
              <a
                href="#bookings"
                className="nav-link"
                onClick={() => handlePageChange("bookings")}
              >
                <i className="fas fa-calendar-check"></i>
                <span>Đặt Chỗ</span>
              </a>
            </li>
            <li
              className={`nav-item ${
                activePage === "analytics" ? "active" : ""
              }`}
            >
              <a
                href="#analytics"
                className="nav-link"
                onClick={() => handlePageChange("analytics")}
              >
                <i className="fas fa-chart-line"></i>
                <span>Phân Tích</span>
              </a>
            </li>
            <li
              className={`nav-item ${
                activePage === "settings" ? "active" : ""
              }`}
            >
              <a
                href="#settings"
                className="nav-link"
                onClick={() => handlePageChange("settings")}
              >
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
            <button className="mobile-menu-btn" onClick={toggleMobileSidebar}>
              <i className="fas fa-bars"></i>
            </button>
            <h1 className="page-title">{updatePageTitle(activePage)}</h1>
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
                <select defaultValue="month">
                  <option value="today">Hôm nay</option>
                  <option value="week">7 ngày qua</option>
                  <option value="month">30 ngày qua</option>
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
          {activePage === "overview" && (
            <div className="page-content active">
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
                      <button
                        className={`chart-btn ${
                          chartPeriod === "month" ? "active" : ""
                        }`}
                        onClick={() => handleChartPeriodChange("month")}
                      >
                        Tháng
                      </button>
                      <button
                        className={`chart-btn ${
                          chartPeriod === "quarter" ? "active" : ""
                        }`}
                        onClick={() => handleChartPeriodChange("quarter")}
                      >
                        Quý
                      </button>
                      <button
                        className={`chart-btn ${
                          chartPeriod === "year" ? "active" : ""
                        }`}
                        onClick={() => handleChartPeriodChange("year")}
                      >
                        Năm
                      </button>
                    </div>
                  </div>
                  <div className="chart-placeholder">
                    <canvas ref={revenueChartRef} id="revenueChart"></canvas>
                  </div>
                </div>

                <div className="chart-container">
                  <div className="chart-header">
                    <h3>Phân Bố Dịch Vụ</h3>
                  </div>
                  <div className="chart-placeholder">
                    <canvas ref={serviceChartRef} id="serviceChart"></canvas>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="recent-activity">
                <div className="activity-header">
                  <h3>Hoạt Động Gần Đây</h3>
                  <a href="#" className="view-all">
                    Xem tất cả
                  </a>
                </div>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon booking">
                      <i className="fas fa-calendar-plus"></i>
                    </div>
                    <div className="activity-content">
                      <p>
                        <strong>Nguyễn Văn A</strong> đã đặt tour Hạ Long Bay
                      </p>
                      <span className="activity-time">5 phút trước</span>
                    </div>
                    <div className="activity-amount">+15,000,000 VNĐ</div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-icon user">
                      <i className="fas fa-user-plus"></i>
                    </div>
                    <div className="activity-content">
                      <p>
                        Người dùng mới <strong>Trần Thị B</strong> đã đăng ký
                      </p>
                      <span className="activity-time">12 phút trước</span>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-icon payment">
                      <i className="fas fa-credit-card"></i>
                    </div>
                    <div className="activity-content">
                      <p>
                        <strong>Lê Văn C</strong> đã thanh toán đặt phòng khách
                        sạn
                      </p>
                      <span className="activity-time">25 phút trước</span>
                    </div>
                    <div className="activity-amount">+8,500,000 VNĐ</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Page */}
          {activePage === "revenue" && (
            <div className="page-content active">
              {/* Revenue Stats */}
              <div className="revenue-stats">
                <div className="revenue-card total">
                  <div className="revenue-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="revenue-info">
                    <h3>Tổng Doanh Thu</h3>
                    <p className="revenue-amount">2,450,000,000 VNĐ</p>
                    <span className="revenue-period">30 ngày qua</span>
                  </div>
                  <div className="revenue-trend positive">
                    <i className="fas fa-arrow-up"></i>
                    <span>+12.5%</span>
                  </div>
                </div>

                <div className="revenue-card monthly">
                  <div className="revenue-icon">
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <div className="revenue-info">
                    <h3>Doanh Thu Tháng Này</h3>
                    <p className="revenue-amount">450,000,000 VNĐ</p>
                    <span className="revenue-period">Tháng 12/2024</span>
                  </div>
                  <div className="revenue-trend positive">
                    <i className="fas fa-arrow-up"></i>
                    <span>+8.3%</span>
                  </div>
                </div>

                <div className="revenue-card average">
                  <div className="revenue-icon">
                    <i className="fas fa-chart-bar"></i>
                  </div>
                  <div className="revenue-info">
                    <h3>Trung Bình/Ngày</h3>
                    <p className="revenue-amount">15,000,000 VNĐ</p>
                    <span className="revenue-period">30 ngày qua</span>
                  </div>
                  <div className="revenue-trend negative">
                    <i className="fas fa-arrow-down"></i>
                    <span>-2.1%</span>
                  </div>
                </div>
              </div>

              {/* Revenue Filters */}
              <div className="revenue-filters">
                <div className="filter-group">
                  <label>Khoảng thời gian:</label>
                  <select
                    className="filter-select"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                  >
                    <option value="7">7 ngày qua</option>
                    <option value="30">30 ngày qua</option>
                    <option value="90">3 tháng qua</option>
                    <option value="365">1 năm qua</option>
                    <option value="custom">Tùy chọn</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Dịch vụ:</label>
                  <select className="filter-select">
                    <option value="all">Tất cả dịch vụ</option>
                    <option value="tour">Tour du lịch</option>
                    <option value="hotel">Khách sạn</option>
                    <option value="flight">Vé máy bay</option>
                    <option value="restaurant">Nhà hàng</option>
                    <option value="rental">Thuê xe</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Khu vực:</label>
                  <select className="filter-select">
                    <option value="all">Toàn quốc</option>
                    <option value="north">Miền Bắc</option>
                    <option value="central">Miền Trung</option>
                    <option value="south">Miền Nam</option>
                  </select>
                </div>

                <button className="filter-btn export-btn">
                  <i className="fas fa-download"></i>
                  Xuất báo cáo
                </button>
              </div>

              {/* Revenue Chart */}
              <div className="revenue-chart-container">
                <div className="chart-header">
                  <h3>Biểu Đồ Doanh Thu</h3>
                  <div className="chart-type-selector">
                    <button className="chart-type-btn active" data-type="line">
                      <i className="fas fa-chart-line"></i>
                    </button>
                    <button className="chart-type-btn" data-type="bar">
                      <i className="fas fa-chart-bar"></i>
                    </button>
                    <button className="chart-type-btn" data-type="area">
                      <i className="fas fa-chart-area"></i>
                    </button>
                  </div>
                </div>
                <canvas
                  ref={revenueChartRef}
                  id="detailedRevenueChart"
                ></canvas>
              </div>

              {/* Revenue Table */}
              <div className="revenue-table-container">
                <div className="table-header">
                  <h3>Chi Tiết Doanh Thu</h3>
                  <div className="table-actions">
                    <div className="search-table">
                      <i className="fas fa-search"></i>
                      <input type="text" placeholder="Tìm kiếm..." />
                    </div>
                    <button className="table-btn">
                      <i className="fas fa-filter"></i>
                      Lọc
                    </button>
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="revenue-table">
                    <thead>
                      <tr>
                        <th>Ngày</th>
                        <th>Dịch vụ</th>
                        <th>Số giao dịch</th>
                        <th>Doanh thu</th>
                        <th>Tăng trưởng</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>22/12/2024</td>
                        <td>
                          <span className="service-badge tour">Tour</span>
                        </td>
                        <td>45</td>
                        <td className="revenue-cell">18,500,000 VNĐ</td>
                        <td className="growth-cell positive">+15.2%</td>
                        <td>
                          <button className="action-btn view">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="action-btn edit">
                            <i className="fas fa-edit"></i>
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>21/12/2024</td>
                        <td>
                          <span className="service-badge hotel">Khách sạn</span>
                        </td>
                        <td>32</td>
                        <td className="revenue-cell">12,800,000 VNĐ</td>
                        <td className="growth-cell positive">+8.7%</td>
                        <td>
                          <button className="action-btn view">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="action-btn edit">
                            <i className="fas fa-edit"></i>
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>20/12/2024</td>
                        <td>
                          <span className="service-badge flight">
                            Vé máy bay
                          </span>
                        </td>
                        <td>28</td>
                        <td className="revenue-cell">16,200,000 VNĐ</td>
                        <td className="growth-cell negative">-3.1%</td>
                        <td>
                          <button className="action-btn view">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="action-btn edit">
                            <i className="fas fa-edit"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="table-pagination">
                  <div className="pagination-info">
                    Hiển thị 1-10 trong 156 kết quả
                  </div>
                  <div className="pagination-controls">
                    <button className="pagination-btn" disabled>
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button className="pagination-btn active">1</button>
                    <button className="pagination-btn">2</button>
                    <button className="pagination-btn">3</button>
                    <button className="pagination-btn">...</button>
                    <button className="pagination-btn">16</button>
                    <button className="pagination-btn">
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Page */}
          {activePage === "users" && (
            <div className="page-content active">
              {/* Users Stats */}
              <div className="users-stats">
                <div className="user-stat-card total-users">
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

                <div className="user-stat-card active-users">
                  <div className="stat-icon">
                    <i className="fas fa-user-check"></i>
                  </div>
                  <div className="stat-info">
                    <h3>Người Dùng Hoạt Động</h3>
                    <p className="stat-value">12,456</p>
                    <span className="stat-change positive">
                      <i className="fas fa-arrow-up"></i> +5.7%
                    </span>
                  </div>
                </div>

                <div className="user-stat-card new-users">
                  <div className="stat-icon">
                    <i className="fas fa-user-plus"></i>
                  </div>
                  <div className="stat-info">
                    <h3>Người Dùng Mới</h3>
                    <p className="stat-value">234</p>
                    <span className="stat-change positive">
                      <i className="fas fa-arrow-up"></i> +12.3%
                    </span>
                  </div>
                </div>

                <div className="user-stat-card premium-users">
                  <div className="stat-icon">
                    <i className="fas fa-crown"></i>
                  </div>
                  <div className="stat-info">
                    <h3>Người Dùng Premium</h3>
                    <p className="stat-value">1,892</p>
                    <span className="stat-change positive">
                      <i className="fas fa-arrow-up"></i> +15.8%
                    </span>
                  </div>
                </div>
              </div>

              {/* Users Filters and Actions */}
              <div className="users-controls">
                <div className="users-filters">
                  <div className="filter-group">
                    <select className="filter-select">
                      <option value="all">Tất cả trạng thái</option>
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                      <option value="banned">Bị cấm</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <select className="filter-select">
                      <option value="all">Tất cả loại</option>
                      <option value="regular">Thường</option>
                      <option value="premium">Premium</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <select className="filter-select">
                      <option value="all">Tất cả khu vực</option>
                      <option value="north">Miền Bắc</option>
                      <option value="central">Miền Trung</option>
                      <option value="south">Miền Nam</option>
                    </select>
                  </div>
                </div>

                <div className="users-actions">
                  <button className="action-btn-primary">
                    <i className="fas fa-user-plus"></i>
                    Thêm người dùng
                  </button>
                  <button className="action-btn-secondary">
                    <i className="fas fa-download"></i>
                    Xuất danh sách
                  </button>
                </div>
              </div>

              {/* Users Actions: Create */}
              <div
                className="users-table-container"
                style={{ marginBottom: "1rem" }}
              >
                <div className="table-header">
                  <h3>Tạo Người Dùng</h3>
                </div>
                <form
                  onSubmit={handleCreateUser}
                  className="users-create-form"
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Tên"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    style={{
                      padding: "0.5rem",
                      border: "1px solid #e9ecef",
                      borderRadius: 6,
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    style={{
                      padding: "0.5rem",
                      border: "1px solid #e9ecef",
                      borderRadius: 6,
                    }}
                  />
                  <button
                    className="action-btn-primary"
                    type="submit"
                    disabled={usersLoading}
                  >
                    <i className="fas fa-plus"></i>
                    Tạo
                  </button>
                  {usersError && (
                    <span style={{ color: "#e74c3c", marginLeft: 8 }}>
                      {usersError}
                    </span>
                  )}
                </form>
              </div>

              {/* Users Table */}
              <div className="users-table-container">
                <div className="table-header">
                  <h3>Danh Sách Người Dùng</h3>
                  <div className="table-actions">
                    <div className="search-table">
                      <i className="fas fa-search"></i>
                      <input type="text" placeholder="Tìm kiếm người dùng..." />
                    </div>
                    <div className="table-view-options">
                      <button className="view-btn active" data-view="table">
                        <i className="fas fa-table"></i>
                      </button>
                      <button className="view-btn" data-view="grid">
                        <i className="fas fa-th"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>
                          <input type="checkbox" className="select-all" />
                        </th>
                        <th>Người dùng</th>
                        <th>Email</th>
                        <th>Loại tài khoản</th>
                        <th>Trạng thái</th>
                        <th>Ngày tham gia</th>
                        <th>Lần cuối hoạt động</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersLoading ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: "center" }}>
                            Đang tải...
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: "center" }}>
                            Không có người dùng
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u.id}>
                            <td>
                              <input type="checkbox" className="select-user" />
                            </td>
                            <td>
                              <div className="user-info-cell">
                                <div className="user-avatar">
                                  <img
                                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                                      u.email || u.name
                                    )}`}
                                    alt="Avatar"
                                  />
                                </div>
                                <div className="user-details">
                                  <span className="user-name">{u.name}</span>
                                  <span className="user-id">#{u.id}</span>
                                </div>
                              </div>
                            </td>
                            <td>{u.email}</td>
                            <td>
                              <span
                                className={`user-type-badge ${
                                  u.isPremium ? "premium" : ""
                                }`}
                              >
                                {u.isPremium ? "Premium" : "Thường"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`status-badge ${
                                  u.status === "banned" ? "inactive" : "active"
                                }`}
                              >
                                {u.status || "Hoạt động"}
                              </span>
                            </td>
                            <td>
                              {u.createdAt
                                ? new Date(u.createdAt).toLocaleDateString()
                                : "-"}
                            </td>
                            <td>
                              {u.updatedAt
                                ? new Date(u.updatedAt).toLocaleString()
                                : "-"}
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="action-btn view"
                                  title="Xem chi tiết"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button
                                  className="action-btn edit"
                                  title="Chỉnh sửa"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  className="action-btn"
                                  title="Xóa"
                                  onClick={() => handleDeleteUser(u.id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="table-pagination">
                  <div className="pagination-info">
                    Hiển thị 1-3 trong 15,847 kết quả
                  </div>
                  <div className="pagination-controls">
                    <button className="pagination-btn" disabled>
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button className="pagination-btn active">1</button>
                    <button className="pagination-btn">2</button>
                    <button className="pagination-btn">3</button>
                    <button className="pagination-btn">...</button>
                    <button className="pagination-btn">1585</button>
                    <button className="pagination-btn">
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other pages */}
          {activePage === "transactions" && (
            <div className="page-content active">
              <h2>Quản Lý Giao Dịch</h2>
              <p>Nội dung trang giao dịch sẽ được thêm vào...</p>
            </div>
          )}

          {activePage === "bookings" && (
            <div className="page-content active">
              <h2>Quản Lý Đặt Chỗ</h2>
              <p>Nội dung trang đặt chỗ sẽ được thêm vào...</p>
            </div>
          )}

          {activePage === "analytics" && (
            <div className="page-content active">
              <h2>Phân Tích</h2>
              <p>Nội dung trang phân tích sẽ được thêm vào...</p>
            </div>
          )}

          {activePage === "settings" && (
            <div className="page-content active">
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
