import { apiClient } from "./api";
import type { LoginRequest, RegisterRequest, AuthResponse, User } from "./api";
import { API_ENDPOINTS } from "../config/api";

export class AuthService {
  // Login user
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log("[AuthService] Attempting login for:", credentials.email);
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    console.log("[AuthService] Login response:", response);

    if (!response.success) {
      // Extract detailed error message
      const errorMessage = response.error || "Đăng nhập thất bại";
      console.error("[AuthService] Login failed:", errorMessage);

      // Provide more specific error messages
      if (
        errorMessage.toLowerCase().includes("unauthorized") ||
        errorMessage.toLowerCase().includes("401")
      ) {
        throw new Error(
          "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại!"
        );
      } else if (
        errorMessage.toLowerCase().includes("not found") ||
        errorMessage.toLowerCase().includes("404")
      ) {
        throw new Error("Tài khoản không tồn tại. Vui lòng kiểm tra email!");
      } else if (errorMessage.toLowerCase().includes("password")) {
        throw new Error("Mật khẩu không đúng. Vui lòng thử lại!");
      } else {
        throw new Error(errorMessage);
      }
    }

    console.log("[AuthService] Login successful. User:", response.data?.user);
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
    console.log(
      "[AuthService] Fetching current user from:",
      API_ENDPOINTS.AUTH.ME
    );
    const response = await apiClient.get<any>(API_ENDPOINTS.AUTH.ME);

    console.log("[AuthService] getCurrentUser response:", response);

    if (!response.success) {
      throw new Error(response.error || "Failed to get user data");
    }

    // Handle nested response structure: response.data.user or response.data
    // Backend returns: { success: true, data: { user: {...}, success: true } }
    const userData = response.data?.user || response.data;

    console.log("[AuthService] User data:", userData);
    console.log("[AuthService] User role:", userData?.role);

    if (!userData) {
      throw new Error("User data not found in response");
    }

    return userData as User;
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

  // Check if user is authenticated (traditional auth only)
  static isAuthenticated(): boolean {
    const token = localStorage.getItem("authToken");
    return !!token;
  }

  // Check if user is authenticated via any method (traditional or Google)
  static isAnyAuthenticated(): boolean {
    const token = localStorage.getItem("authToken");
    const userData = AuthService.getStoredUser();
    return !!token || !!(userData as any)?.isGoogleUser;
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

  // Store Google user data (without token)
  static storeGoogleUserData(userData: User): void {
    localStorage.setItem("userData", JSON.stringify(userData));
  }

  // Clear all auth data (including Google)
  static clearAllAuthData(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("refreshToken");
  }
}

export default AuthService;
