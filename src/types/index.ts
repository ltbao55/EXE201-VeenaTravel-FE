// Profile Types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isPremium?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Additional profile fields that might come from API
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  preferences?: {
    travelTypes?: string[];
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isPremium?: boolean;
  // Flag used client-side to mark Firebase Google auth users
  isGoogleUser?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}



