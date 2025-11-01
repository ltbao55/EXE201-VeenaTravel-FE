import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import PaymentService from "../../services/paymentService";

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"success" | "cancel" | "pending">(
    "pending"
  );

  useEffect(() => {
    handleReturn();
  }, []);

  const handleReturn = async () => {
    const payStatus = searchParams.get("status");
    const orderCode = searchParams.get("orderCode");

    console.log("[PaymentReturn] Handling return:", {
      status: payStatus,
      orderCode,
    });

    // Check payment status
    if (payStatus === "PAID" || payStatus === "paid" || payStatus === "success") {
      setStatus("success");
      console.log("[PaymentReturn] Payment successful");
      // Redirect to home immediately on success
      navigate("/", { replace: true });
      setLoading(false);
      return;
    } else if (searchParams.get("cancel") === "true") {
      setStatus("cancel");
      console.log("[PaymentReturn] Payment cancelled");
    } else {
      // If orderCode exists, check the payment status
      if (orderCode) {
        try {
          const paymentInfo = await PaymentService.getPaymentInfo(
            parseInt(orderCode)
          );
          if (paymentInfo.status === "paid") {
            setStatus("success");
          } else {
            setStatus("cancel");
          }
        } catch (error) {
          console.error("[PaymentReturn] Error checking payment:", error);
          setStatus("cancel");
        }
      } else {
        setStatus("cancel");
      }
    }

    setLoading(false);
    // Redirect after short delay for non-success cases
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 2000);
  };

  return (
    <>
      <Header />
      <div className="payment-return-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang xử lý...</p>
          </div>
        ) : status === "success" ? (
          <div className="success-container">
            <div className="success-icon">✅</div>
            <h1>Thanh toán thành công!</h1>
            <p>Cảm ơn bạn đã sử dụng dịch vụ của VeenaTravel</p>
            <p className="redirect-note">
              Bạn sẽ được chuyển về trang chủ trong 3 giây...
            </p>
            <button onClick={() => navigate("/")} className="btn-primary">
              Về trang chủ ngay
            </button>
          </div>
        ) : (
          <div className="cancel-container">
            <div className="cancel-icon">❌</div>
            <h1>Thanh toán đã bị hủy</h1>
            <p>Bạn có thể thử thanh toán lại sau</p>
            <p className="redirect-note">
              Bạn sẽ được chuyển về trang chủ trong 3 giây...
            </p>
            <button onClick={() => navigate("/")} className="btn-primary">
              Về trang chủ ngay
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PaymentReturn;

