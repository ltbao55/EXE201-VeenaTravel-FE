import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthService } from "../services/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [checkingRole, setCheckingRole] = useState(false);
  const [userRole, setUserRole] = useState<string | undefined>(user?.role);

  // Fetch user role from backend if needed (for admin check)
  useEffect(() => {
    const fetchUserRole = async () => {
      if (requireAdmin && isAuthenticated && user && !user.role) {
        setCheckingRole(true);
        try {
          // Fetch fresh user data from backend to get role
          const backendUser = await AuthService.getCurrentUser();
          setUserRole(backendUser.role);
        } catch (error) {
          console.warn("Could not fetch user role:", error);
          // If can't fetch, assume not admin
          setUserRole(undefined);
        } finally {
          setCheckingRole(false);
        }
      } else if (user?.role) {
        setUserRole(user.role);
      }
    };

    if (isAuthenticated && !isLoading) {
      fetchUserRole();
    }
  }, [isAuthenticated, isLoading, user, requireAdmin]);

  // Show loading while checking auth or role
  if (isLoading || checkingRole) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "1rem",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          className="spinner"
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #f8a5c2",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <p style={{ color: "#666", margin: 0 }}>Đang kiểm tra quyền truy cập...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // Check if admin role is required
  if (requireAdmin) {
    const role = userRole || user.role;
    if (role !== "admin") {
      // Redirect to home with message (optional: you could show a toast/alert)
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

