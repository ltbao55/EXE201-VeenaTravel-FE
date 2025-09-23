// Dashboard JavaScript - VeenaTravel
document.addEventListener('DOMContentLoaded', function() {
  // Initialize dashboard
  initializeDashboard();
  initializeCharts();
  setupEventListeners();
});

function initializeDashboard() {
  // Set active page
  const currentPage = window.location.hash.substring(1) || 'overview';
  showPage(currentPage);
  
  // Update page title
  updatePageTitle(currentPage);
}

function setupEventListeners() {
  // Sidebar navigation
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const page = this.getAttribute('data-page');
      showPage(page);
      updateActiveNav(this);
      updatePageTitle(page);
    });
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.querySelector('.sidebar');
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
      sidebar.classList.toggle('active');
    });
  }

  // Sidebar toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('collapsed');
    });
  }

  // Chart controls
  const chartBtns = document.querySelectorAll('.chart-btn');
  chartBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons
      chartBtns.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      
      // Update chart based on period
      const period = this.getAttribute('data-period');
      updateRevenueChart(period);
    });
  });

  // Date range picker
  const dateRange = document.getElementById('dateRange');
  if (dateRange) {
    dateRange.addEventListener('change', function() {
      updateDashboardData(this.value);
    });
  }

  // Close sidebar on outside click (mobile)
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    }
  });
}

function showPage(pageId) {
  // Hide all pages
  const pages = document.querySelectorAll('.page-content');
  pages.forEach(page => page.classList.remove('active'));
  
  // Show selected page
  const targetPage = document.getElementById(pageId + '-page');
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  // Update URL hash
  window.location.hash = pageId;
}

function updateActiveNav(activeLink) {
  // Remove active class from all nav items
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => item.classList.remove('active'));
  
  // Add active class to parent nav item
  activeLink.parentElement.classList.add('active');
}

function updatePageTitle(pageId) {
  const titles = {
    'overview': 'Tổng Quan',
    'revenue': 'Quản Lý Doanh Thu',
    'users': 'Quản Lý Người Dùng',
    'transactions': 'Quản Lý Giao Dịch',
    'bookings': 'Quản Lý Đặt Chỗ',
    'analytics': 'Phân Tích',
    'settings': 'Cài Đặt'
  };
  
  const pageTitle = document.querySelector('.page-title');
  if (pageTitle && titles[pageId]) {
    pageTitle.textContent = titles[pageId];
  }
}

function initializeCharts() {
  // Revenue Chart
  const revenueCtx = document.getElementById('revenueChart');
  if (revenueCtx) {
    window.revenueChart = new Chart(revenueCtx, {
      type: 'line',
      data: {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [{
          label: 'Doanh Thu (VNĐ)',
          data: [180000000, 220000000, 195000000, 240000000, 280000000, 310000000, 290000000, 350000000, 320000000, 380000000, 410000000, 450000000],
          borderColor: '#ff4d85',
          backgroundColor: 'rgba(255, 77, 133, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#ff4d85',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#8b949e',
              callback: function(value) {
                return (value / 1000000).toFixed(0) + 'M';
              }
            }
          },
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#8b949e'
            }
          }
        }
      }
    });
  }

  // Service Distribution Chart
  const serviceCtx = document.getElementById('serviceChart');
  if (serviceCtx) {
    window.serviceChart = new Chart(serviceCtx, {
      type: 'doughnut',
      data: {
        labels: ['Tour', 'Khách Sạn', 'Vé Máy Bay', 'Nhà Hàng', 'Thuê Xe'],
        datasets: [{
          data: [35, 25, 20, 12, 8],
          backgroundColor: [
            '#ff4d85',
            '#4a90e2',
            '#27ae60',
            '#f39c12',
            '#e74c3c'
          ],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#8b949e',
              padding: 20,
              usePointStyle: true
            }
          }
        }
      }
    });
  }
}

function updateRevenueChart(period) {
  if (!window.revenueChart) return;
  
  const data = {
    'month': {
      labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
      data: [180000000, 220000000, 195000000, 240000000, 280000000, 310000000, 290000000, 350000000, 320000000, 380000000, 410000000, 450000000]
    },
    'quarter': {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      data: [595000000, 830000000, 960000000, 1240000000]
    },
    'year': {
      labels: ['2020', '2021', '2022', '2023', '2024'],
      data: [2800000000, 3200000000, 2900000000, 3800000000, 4200000000]
    }
  };
  
  const chartData = data[period] || data.month;
  
  window.revenueChart.data.labels = chartData.labels;
  window.revenueChart.data.datasets[0].data = chartData.data;
  window.revenueChart.update();
}

function updateDashboardData(dateRange) {
  // Simulate data update based on date range
  console.log('Updating dashboard data for:', dateRange);
  
  // Here you would typically make an API call to fetch new data
  // For demo purposes, we'll just log the action
  
  // Example of updating stat cards
  const statValues = document.querySelectorAll('.stat-value');
  statValues.forEach(value => {
    // Add loading animation
    value.style.opacity = '0.5';
    setTimeout(() => {
      value.style.opacity = '1';
    }, 500);
  });
}

// Utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

function formatNumber(number) {
  return new Intl.NumberFormat('vi-VN').format(number);
}

// Auto-refresh data every 5 minutes
setInterval(() => {
  const currentDateRange = document.getElementById('dateRange').value;
  updateDashboardData(currentDateRange);
}, 300000);

// Handle window resize
window.addEventListener('resize', function() {
  if (window.innerWidth > 768) {
    document.querySelector('.sidebar').classList.remove('active');
  }
});
