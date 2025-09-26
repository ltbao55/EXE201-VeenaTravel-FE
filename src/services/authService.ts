import { apiClient } from "./api";
import type { LoginRequest, RegisterRequest, AuthResponse, User } from "./api";
import { API_ENDPOINTS } from "../config/api";

export class AuthService {
  // Login user
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    if (!response.success) {
      throw new Error(response.error || "Login failed");
    }

    return response.data;
  }

  // Register user
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );

    if (!response.success) {
      throw new Error(response.error || "Registration failed");
    }

    return response.data;
  }

  // Get current user
  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);

    if (!response.success) {
      throw new Error(response.error || "Failed to get user data");
    }

    return response.data;
  }

  // Logout user (frontend only)
  static logout(): void {
    // Clear all auth data from local storage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("refreshToken");
  }

  // Refresh token
  static async refreshToken(): Promise<string> {
    const response = await apiClient.post<{ token: string }>(
      API_ENDPOINTS.AUTH.REFRESH
    );

    if (!response.success) {
      throw new Error(response.error || "Token refresh failed");
    }

    return response.data.token;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = localStorage.getItem("authToken");
    return !!token;
  }

  // Get stored user data
  static getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Failed to parse stored user data:", error);
      return null;
    }
  }

  // Store auth data
  static storeAuthData(authData: AuthResponse): void {
    localStorage.setItem("authToken", authData.token);
    localStorage.setItem("userData", JSON.stringify(authData.user));

    if (authData.refreshToken) {
      localStorage.setItem("refreshToken", authData.refreshToken);
    }
  }
}

export default AuthService;
