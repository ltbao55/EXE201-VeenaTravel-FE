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
      // Always fetch fresh role from backend when admin check is required
      if (requireAdmin && isAuthenticated && user) {
        setCheckingRole(true);
        try {
          console.log("[ProtectedRoute] Fetching user role from backend...");
          // Fetch fresh user data from backend to get role
          const backendUser = await AuthService.getCurrentUser();
          console.log("[ProtectedRoute] Backend user data:", backendUser);
          console.log("[ProtectedRoute] User role:", backendUser.role);
          setUserRole(backendUser.role);

          // Update user in context if role changed
          if (backendUser.role !== user.role) {
            console.log("[ProtectedRoute] Role updated:", backendUser.role);
          }
        } catch (error) {
          console.error("[ProtectedRoute] Could not fetch user role:", error);
          // If can't fetch, use stored role or assume not admin
          setUserRole(user.role || undefined);
        } finally {
          setCheckingRole(false);
        }
      } else if (user?.role) {
        // Use stored role if not requiring admin check
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
        <p style={{ color: "#666", margin: 0 }}>
          Đang kiểm tra quyền truy cập...
        </p>
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
    const role = userRole || user?.role;
    console.log("[ProtectedRoute] Checking admin access. User role:", role);
    console.log("[ProtectedRoute] UserRole state:", userRole);
    console.log("[ProtectedRoute] User object role:", user?.role);

    if (role !== "admin") {
      console.warn(
        "[ProtectedRoute] Access denied. User role is not admin:",
        role
      );
      // Redirect to home with message (optional: you could show a toast/alert)
      return <Navigate to="/" replace />;
    }

    console.log("[ProtectedRoute] Admin access granted");
  }

  return <>{children}</>;
};

export default ProtectedRoute;
