import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";
import UserService, { type ManagedUser } from "../services/userService";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarActive, setSidebarActive] = useState(false);

  // Users state
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

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

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const data = await UserService.list();
        setUsers(data);
      } catch (err: any) {
        console.error("Không thể tải người dùng:", err);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Xóa người dùng này?")) return;
    try {
      await UserService.remove(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      alert(err.message || "Xóa người dùng thất bại");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to home page after logout
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even if logout has error
      navigate("/");
    }
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
            <li className="nav-item active">
              <a href="#users" className="nav-link">
                <i className="fas fa-users"></i>
                <span>Quản Lý Người Dùng</span>
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
              <span className="user-name">{user?.name || "Admin"}</span>
              <span className="user-role">Quản trị viên</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Đăng xuất">
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
            <h1 className="page-title">Quản Lý Người Dùng</h1>
          </div>
          <div className="header-right">
            <button className="header-logout-btn" onClick={handleLogout} title="Đăng xuất">
              <i className="fas fa-sign-out-alt"></i>
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          <div className="page-content active">
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
                    {usersLoading ? (
                      "Đang tải..."
                    ) : (
                      `Tổng cộng: ${users.length} người dùng`
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
      </main>
    </div>
  );
};

export default DashboardPage;
