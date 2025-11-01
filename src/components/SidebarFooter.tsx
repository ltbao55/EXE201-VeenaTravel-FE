import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import subscriptionService, { type PlanType } from "../services/subscriptionService";
import PaymentService from "../services/paymentService";

interface SidebarFooterProps {
  activeItem?: string;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ activeItem }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [planType, setPlanType] = useState<PlanType | null>(null);

  useEffect(() => {
    const loadPlan = async () => {
      if (!isAuthenticated) {
        setPlanType(null);
        return;
      }
      try {
        const res = await subscriptionService.getCurrent();
        const maybeSub: any = (res as any)?.data?.subscription || (res as any)?.data;
        if (maybeSub && (maybeSub as any)?.planId) {
          const plan = (maybeSub as any).planId as any;
          setPlanType((plan?.type as PlanType) || "free");
          return;
        }
        // Fallback by payments
        try {
          const paid = await PaymentService.getUserPayments(1, 1, "paid");
          if (Array.isArray(paid.data) && paid.data.length > 0) {
            setPlanType("premium");
            return;
          }
        } catch {}
        setPlanType("free");
      } catch {
        // Fallback on error
        try {
          const paid = await PaymentService.getUserPayments(1, 1, "paid");
          if (Array.isArray(paid.data) && paid.data.length > 0) {
            setPlanType("premium");
            return;
          }
        } catch {}
        setPlanType("free");
      }
    };
    loadPlan();
  }, [isAuthenticated]);

  return (
    <div className="sidebar-footer">
      <div
        className={`user-profile ${activeItem === "profile" ? "active" : ""}`}
        onClick={() => navigate("/chat/profile")}
        style={{ cursor: "pointer" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span>{user?.name || "Tài khoản"}</span>
        {planType && (
          <span
            style={{
              marginLeft: 8,
              padding: "2px 6px",
              borderRadius: 8,
              fontSize: 12,
              background:
                planType === "premium"
                  ? "rgba(255, 215, 0, 0.15)"
                  : planType === "pro"
                  ? "rgba(76, 175, 80, 0.15)"
                  : "rgba(0,0,0,0.08)",
              color:
                planType === "premium"
                  ? "#b28900"
                  : planType === "pro"
                  ? "#2e7d32"
                  : "#555",
              textTransform: "uppercase",
            }}
          >
            {planType}
          </span>
        )}
        <div className="profile-tooltip">Xem hồ sơ</div>
      </div>
    </div>
  );
};

export default SidebarFooter;
