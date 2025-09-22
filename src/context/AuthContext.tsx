import React, { createContext, useContext, useState, useEffect } from "react";

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
        const token = localStorage.getItem("authToken");
        if (token) {
          // TODO: Validate token with backend
          // For now, simulate a logged-in user
          const userData = localStorage.getItem("userData");
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, _password: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      const userData: User = {
        id: "1",
        name: "Người dùng",
        email: email,
        avatar: "https://via.placeholder.com/40",
        isPremium: false,
      };

      setUser(userData);
      localStorage.setItem("authToken", "mock-token");
      localStorage.setItem("userData", JSON.stringify(userData));
      setShowAuthModal(false);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, _password: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      const userData: User = {
        id: "1",
        name: name,
        email: email,
        avatar: "https://via.placeholder.com/40",
        isPremium: false,
      };

      setUser(userData);
      localStorage.setItem("authToken", "mock-token");
      localStorage.setItem("userData", JSON.stringify(userData));
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
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
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
