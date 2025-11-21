/**
 * Script để test các API endpoints đã deploy
 * Chạy trong browser console hoặc Node.js
 */

const BASE_URL = "https://exe-201-veena-travel-be.vercel.app/api";

// Danh sách các endpoints cần test
const endpoints = [
  // Health/Status checks
  { method: "GET", path: "/health", requiresAuth: false },
  { method: "GET", path: "/status", requiresAuth: false },

  // Auth endpoints (không cần auth)
  { method: "GET", path: "/auth/profile", requiresAuth: true },

  // Public endpoints
  { method: "GET", path: "/destinations", requiresAuth: false },
  { method: "GET", path: "/destinations/popular", requiresAuth: false },

  // Protected endpoints (cần auth)
  { method: "GET", path: "/chat-sessions", requiresAuth: true },
  { method: "GET", path: "/trips", requiresAuth: true },
  { method: "GET", path: "/payments/user-payments", requiresAuth: true },
];

// Lấy token từ localStorage (nếu chạy trong browser)
function getAuthToken() {
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

// Test một endpoint
async function testEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint.path}`;
  const options = {
    method: endpoint.method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Thêm token nếu cần
  if (endpoint.requiresAuth) {
    const token = getAuthToken();
    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.log(
        `⏭️  ${endpoint.method} ${endpoint.path} - Skipped (no token)`
      );
      return;
    }
  }

  try {
    const startTime = Date.now();
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    const data = await response.json();

    if (response.ok) {
      console.log(
        `✅ ${endpoint.method} ${endpoint.path} (${duration}ms)`,
        data
      );
    } else {
      console.warn(
        `⚠️  ${endpoint.method} ${endpoint.path} (${response.status})`,
        data
      );
    }
  } catch (error) {
    console.error(`❌ ${endpoint.method} ${endpoint.path}`, error.message);
  }
}

// Test tất cả endpoints
async function testAllEndpoints() {
  console.log("🚀 Bắt đầu test các API endpoints...\n");
  console.log(`Base URL: ${BASE_URL}\n`);

  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    // Đợi một chút giữa các requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("\n✨ Hoàn thành test!");
}

// Test endpoint cụ thể
async function testSingleEndpoint(path, method = "GET", data = null) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const token = getAuthToken();
  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    console.log(`Response (${response.status}):`, result);
    return result;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// Export functions (nếu chạy trong Node.js)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    testAllEndpoints,
    testSingleEndpoint,
    BASE_URL,
  };
}

// Auto-run nếu chạy trong browser console
if (typeof window !== "undefined") {
  console.log("📋 Script test API đã sẵn sàng!");
  console.log("Sử dụng:");
  console.log("  - testAllEndpoints() - Test tất cả endpoints");
  console.log(
    "  - testSingleEndpoint(path, method, data) - Test một endpoint cụ thể"
  );
  console.log("\nVí dụ:");
  console.log('  testSingleEndpoint("/destinations", "GET")');
  console.log(
    '  testSingleEndpoint("/auth/login", "POST", { email: "test@test.com", password: "123" })'
  );
}

