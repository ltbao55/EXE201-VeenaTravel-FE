import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { API_CONFIG } from "../config/api";

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isPremium?: boolean;
  role?: "user" | "admin";
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: {
    language?: string;
    theme?: string;
    notifications?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Create axios instance
class ApiClient {
  private client: any;

  constructor() {
    this.client = axios.create({
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config: any) => {
        const token = localStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: any) => {
        // Log error for debugging
        console.log("[ApiClient] Response error:", {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data,
        });

        // Handle 401 errors (unauthorized) - but don't redirect on login endpoint
        // Only redirect if it's not a login/register attempt
        if (error.response?.status === 401) {
          const isAuthEndpoint =
            error.config?.url?.includes("/auth/login") ||
            error.config?.url?.includes("/auth/register");

          if (!isAuthEndpoint) {
            // Only clear auth and redirect for non-auth endpoints
            localStorage.removeItem("authToken");
            localStorage.removeItem("userData");
            window.location.href = "/";
          }
          // For auth endpoints, let the error propagate so we can show the message
        }

        // Retry mechanism for network errors
        if (
          error.code === "NETWORK_ERROR" ||
          error.message?.includes("ERR_FAILED")
        ) {
          console.warn(
            "[ApiClient] Network error detected, will retry:",
            error.message
          );
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request method with retry
  async request<T = any>(
    config: AxiosRequestConfig,
    retries: number = 2
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request({
        ...config,
        url: this.resolveUrl(config.url || ""),
      });
      return response.data;
    } catch (error: any) {
      // Retry for network errors
      if (
        retries > 0 &&
        (error.code === "NETWORK_ERROR" ||
          error.message?.includes("ERR_FAILED"))
      ) {
        console.log(
          `[ApiClient] Retrying request (${3 - retries + 1}/3):`,
          config.url
        );
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
        return this.request<T>(config, retries - 1);
      }

      // Handle network errors or server errors
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const responseData = error.response.data;

        console.log("[ApiClient] Server error response:", {
          status,
          data: responseData,
          url: config.url,
        });

        // Extract error message from various possible formats
        let errorMessage =
          responseData?.message ||
          responseData?.error ||
          responseData?.msg ||
          (status === 401
            ? "Unauthorized"
            : status === 404
            ? "Not found"
            : status === 500
            ? "Server error"
            : "Server error");

        // Provide user-friendly messages for common errors
        if (status === 401) {
          errorMessage = "Email hoặc mật khẩu không đúng";
        } else if (status === 404) {
          errorMessage = "Tài khoản không tồn tại";
        } else if (status === 500) {
          errorMessage = "Lỗi server. Vui lòng thử lại sau";
        }

        return {
          success: false,
          data: undefined as T,
          error: errorMessage,
        };
      } else if (error.request) {
        // Network error (có thể do CORS hoặc network issue)
        const isCorsError =
          error.message?.includes("CORS") ||
          error.message?.includes("Access-Control-Allow-Origin");

        if (isCorsError) {
          console.error("[ApiClient] CORS Error:", {
            url: config.url,
            resolvedUrl: this.resolveUrl(config.url || ""),
            baseUrl: API_CONFIG.BASE_URL,
            message:
              "Backend cần cấu hình CORS để cho phép requests từ frontend",
          });
        }

        return {
          success: false,
          data: undefined as T,
          error: isCorsError
            ? "CORS Error: Backend cần cấu hình CORS. Vui lòng kiểm tra cấu hình backend."
            : "Network error. Please check your connection.",
        };
      } else {
        // Other error
        return {
          success: false,
          data: undefined as T,
          error: error.message || "An unexpected error occurred",
        };
      }
    }
  }

  private resolveUrl(url: string) {
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    const base = this.ensureAbsoluteBase(API_CONFIG.BASE_URL).replace(
      /\/$/,
      ""
    );
    const path = url.replace(/^\//, "");
    const resolvedUrl = `${base}/${path}`;

    // Debug logging (chỉ trong development)
    if (import.meta.env.DEV) {
      console.log(`[ApiClient] Resolved URL: ${resolvedUrl}`, {
        base: API_CONFIG.BASE_URL,
        path: url,
      });
    }

    return resolvedUrl;
  }

  private ensureAbsoluteBase(baseUrl: string) {
    if (/^https?:\/\//i.test(baseUrl)) {
      return baseUrl;
    }
    const trimmed = baseUrl.replace(/^\/+/, "");
    return `https://${trimmed}`;
  }

  // HTTP methods
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "GET", url });
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "POST", url, data });
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "PUT", url, data });
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "PATCH", url, data });
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "DELETE", url });
  }
}

// Profile service methods
export const profileService = {
  // Get user profile
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>("/auth/profile");
  },

  // Update user profile
  async updateProfile(
    profileData: Partial<UserProfile>
  ): Promise<ApiResponse<UserProfile>> {
    return apiClient.put<UserProfile>("/auth/profile", profileData);
  },

  // Update user preferences
  async updatePreferences(
    preferences: UserProfile["preferences"]
  ): Promise<ApiResponse<UserProfile>> {
    return apiClient.put<UserProfile>("/auth/profile", { preferences });
  },
};

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
