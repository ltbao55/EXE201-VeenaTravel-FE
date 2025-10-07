import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthService } from "../services/authService";
import FirebaseAuthService from "../services/firebaseAuthService";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isPremium?: boolean;
  isGoogleUser?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showAuthModal: boolean;
  authMode: "login" | "register";
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
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
        // Check Firebase auth first
        const unsubscribe = FirebaseAuthService.onAuthStateChanged(
          async (firebaseUser) => {
            if (firebaseUser) {
              // User is signed in with Firebase
              const userData: User = {
                id: firebaseUser.uid,
                name:
                  firebaseUser.displayName ||
                  firebaseUser.email?.split("@")[0] ||
                  "User",
                email: firebaseUser.email || "",
                avatar: firebaseUser.photoURL || undefined,
                isPremium: false,
                isGoogleUser: true,
              };
              setUser(userData);
              setIsLoading(false);
            } else {
              // Check traditional auth
              if (AuthService.isAuthenticated()) {
                try {
                  const userData = await AuthService.getCurrentUser();
                  setUser({ ...userData, isGoogleUser: false });
                } catch (error) {
                  console.error("Auth check failed:", error);
                  AuthService.logout();
                }
              }
              setIsLoading(false);
            }
          }
        );

        // Return cleanup function
        return unsubscribe;
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setIsLoading(false);
      }
    };

    const cleanup = checkAuth();

    // Cleanup on unmount
    return () => {
      if (cleanup && typeof cleanup.then === "function") {
        cleanup.then((unsubscribe) => {
          if (unsubscribe) unsubscribe();
        });
      }
    };
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
      setUser({ ...authData.user, isGoogleUser: false });
      setShowAuthModal(false);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const firebaseUser = await FirebaseAuthService.signInWithGooglePopup();

      // Create user object from Firebase user
      const userData: User = {
        id: firebaseUser.uid,
        name:
          firebaseUser.displayName ||
          firebaseUser.email?.split("@")[0] ||
          "User",
        email: firebaseUser.email || "",
        avatar: firebaseUser.photoURL || undefined,
        isPremium: false,
        isGoogleUser: true,
      };

      setUser(userData);
      setShowAuthModal(false);
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Sign out from Firebase if user is Google user
      if (user?.isGoogleUser) {
        await FirebaseAuthService.signOut();
      }

      // Clear traditional auth data
      AuthService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      // Force logout even if Firebase signout fails
      AuthService.logout();
      setUser(null);
    }
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
    loginWithGoogle,
    logout,
    openAuthModal,
    closeAuthModal,
    switchAuthMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
