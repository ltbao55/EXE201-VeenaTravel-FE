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
  role?: "user" | "admin";
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
  refreshUser: () => Promise<User | null>;
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
              // User is signed in with Firebase - get fresh token
              const token = await firebaseUser.getIdToken();
              localStorage.setItem("authToken", token);

              // Try to get user data from backend to check role
              let userRole: "user" | "admin" | undefined = undefined;
              try {
                const backendUser = await AuthService.getCurrentUser();
                userRole = backendUser.role;
              } catch (error) {
                // If backend call fails, continue with stored data
                console.warn("Could not fetch user role from backend:", error);
                const storedData = AuthService.getStoredUser();
                userRole = storedData?.role;
              }

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
                role: userRole,
              };

              localStorage.setItem("userData", JSON.stringify(userData));
              setUser(userData);
              setIsLoading(false);

              // Redirect to dashboard if user is admin
              if (
                userRole === "admin" &&
                window.location.pathname !== "/dashboard"
              ) {
                window.location.href = "/dashboard";
              }
            } else {
              // Check traditional auth
              if (AuthService.isAuthenticated()) {
                try {
                  const userData = await AuthService.getCurrentUser();
                  setUser({ ...userData, isGoogleUser: false });

                  // Redirect to dashboard if user is admin and not already there
                  if (
                    userData.role === "admin" &&
                    window.location.pathname !== "/dashboard"
                  ) {
                    window.location.href = "/dashboard";
                  }
                } catch (error) {
                  console.warn(
                    "Auth check failed, user may not be authenticated:",
                    error
                  );
                  // Don't logout immediately, let user try to login
                  // AuthService.logout();
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

      console.log("[AuthContext] Login response:", authData);
      console.log("[AuthContext] User data:", authData.user);
      console.log("[AuthContext] User role:", authData.user.role);

      // Store auth data and update state
      AuthService.storeAuthData(authData);
      setUser(authData.user);
      setShowAuthModal(false);

      // Redirect to dashboard if user is admin
      if (authData.user.role === "admin") {
        console.log(
          "[AuthContext] Admin user detected, redirecting to dashboard"
        );
        window.location.href = "/dashboard";
      } else {
        console.log(
          "[AuthContext] User is not admin, role:",
          authData.user.role
        );
      }
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

      // Redirect to dashboard if user is admin
      if (authData.user.role === "admin") {
        window.location.href = "/dashboard";
      }
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

      // Get Firebase ID token to use for backend authentication
      const token = await firebaseUser.getIdToken();

      // Store token in localStorage
      localStorage.setItem("authToken", token);

      // Try to get user data from backend to check role
      let userRole: "user" | "admin" | undefined = undefined;
      try {
        const backendUser = await AuthService.getCurrentUser();
        userRole = backendUser.role;
      } catch (error) {
        // If backend call fails, continue with default role
        console.warn("Could not fetch user role from backend:", error);
      }

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
        role: userRole,
      };

      // Store user data
      localStorage.setItem("userData", JSON.stringify(userData));

      setUser(userData);
      setShowAuthModal(false);

      // Redirect to dashboard if user is admin
      if (userRole === "admin") {
        window.location.href = "/dashboard";
      }
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

  const refreshUser = async (): Promise<User | null> => {
    try {
      console.log("[AuthContext] Refreshing user data from backend...");
      const userData = await AuthService.getCurrentUser();
      console.log("[AuthContext] Refreshed user data:", userData);
      console.log("[AuthContext] Refreshed user role:", userData.role);

      // Update user state with fresh data from backend
      const updatedUser: User = {
        ...userData,
        isGoogleUser: user?.isGoogleUser || false,
      };

      // Update localStorage
      localStorage.setItem("userData", JSON.stringify(updatedUser));

      // Update state
      setUser(updatedUser);

      console.log("[AuthContext] ✅ User data refreshed successfully");
      return updatedUser;
    } catch (error) {
      console.error("[AuthContext] Failed to refresh user data:", error);
      throw error;
    }
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
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
