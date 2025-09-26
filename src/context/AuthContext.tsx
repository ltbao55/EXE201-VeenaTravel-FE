import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthService } from "../services/authService";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isPremium?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showAuthModal: boolean;
  authMode: "login" | "register";
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  switchAuthMode: (mode: "login" | "register") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (AuthService.isAuthenticated()) {
          // Try to get current user from backend
          const userData = await AuthService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Clear invalid auth data
        AuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const authData = await AuthService.login({ email, password });

      // Store auth data and update state
      AuthService.storeAuthData(authData);
      setUser(authData.user);
      setShowAuthModal(false);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const authData = await AuthService.register({ name, email, password });

      // Store auth data and update state
      AuthService.storeAuthData(authData);
      setUser(authData.user);
      setShowAuthModal(false);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    AuthService.logout();
  };

  const openAuthModal = (mode: "login" | "register" = "login") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const switchAuthMode = (mode: "login" | "register") => {
    setAuthMode(mode);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    showAuthModal,
    authMode,
    login,
    register,
    logout,
    openAuthModal,
    closeAuthModal,
    switchAuthMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
