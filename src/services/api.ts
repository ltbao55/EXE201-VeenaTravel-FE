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
      baseURL: API_CONFIG.BASE_URL,
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
        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          window.location.href = "/";
        }
        
        // Retry mechanism for network errors
        if (error.code === 'NETWORK_ERROR' || error.message?.includes('ERR_FAILED')) {
          console.warn('[ApiClient] Network error detected, will retry:', error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Generic request method with retry
  async request<T = any>(config: AxiosRequestConfig, retries: number = 2): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request(config);
      return response.data;
    } catch (error: any) {
      // Retry for network errors
      if (retries > 0 && (error.code === 'NETWORK_ERROR' || error.message?.includes('ERR_FAILED'))) {
        console.log(`[ApiClient] Retrying request (${3 - retries + 1}/3):`, config.url);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return this.request<T>(config, retries - 1);
      }
      
      // Handle network errors or server errors
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          data: undefined as T,
          error:
            error.response.data?.message ||
            error.response.data?.error ||
            "Server error",
        };
      } else if (error.request) {
        // Network error
        return {
          success: false,
          data: undefined as T,
          error: "Network error. Please check your connection.",
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
