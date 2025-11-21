import { apiClient } from "./api";
import { API_ENDPOINTS, buildUrl } from "../config/api";

// Payment Types
export interface PaymentItem {
  name: string;
  quantity: number;
  price: number;
}

export interface CreatePaymentRequest {
  amount: number;
  description: string;
  items: PaymentItem[];
  metadata?: Record<string, any>;
}

export interface PaymentInfo {
  orderCode: number;
  checkoutUrl: string;
  amount: number;
  description: string;
  expiresAt: string;
  status: "pending" | "paid" | "cancelled" | "failed" | "expired";
  items: PaymentItem[];
  customer?: {
    userId: string;
    email: string;
    name: string;
  };
  paidAt?: string;
  transactionInfo?: {
    reference: string;
    accountNumber: string;
    counterAccountBankName: string;
  };
}

export interface PaymentHistory {
  orderCode: number;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
}

export interface Pagination {
  current: number;
  pages: number;
  total: number;
  limit: number;
}

export interface UserPaymentsResponse {
  data: PaymentHistory[];
  pagination: Pagination;
}

class PaymentService {
  /**
   * Tạo link thanh toán
   */
  static async createPayment(data: CreatePaymentRequest): Promise<PaymentInfo> {
    try {
      console.log("[PaymentService] Creating payment:", data);

      const response = await apiClient.post(
        API_ENDPOINTS.PAYMENTS.CREATE,
        data
      );

      if (response.success && response.data) {
        console.log(
          "[PaymentService] Payment created successfully:",
          response.data
        );
        return response.data;
      }

      throw new Error(response.error || "Không thể tạo thanh toán");
    } catch (error: any) {
      console.error("[PaymentService] Error creating payment:", error);
      throw error;
    }
  }

  /**
   * Lấy thông tin thanh toán theo orderCode
   */
  static async getPaymentInfo(orderCode: number): Promise<PaymentInfo> {
    try {
      console.log(
        "[PaymentService] Getting payment info for orderCode:",
        orderCode
      );

      const url = buildUrl(API_ENDPOINTS.PAYMENTS.INFO, { orderCode });
      const response = await apiClient.get(url);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.error || "Không thể lấy thông tin thanh toán");
    } catch (error: any) {
      console.error("[PaymentService] Error getting payment info:", error);
      throw error;
    }
  }

  /**
   * Lấy danh sách thanh toán của user
   */
  static async getUserPayments(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<UserPaymentsResponse> {
    try {
      console.log("[PaymentService] Getting user payments:", {
        page,
        limit,
        status,
      });

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (status) {
        params.append("status", status);
      }

      const response = await apiClient.get(
        `${API_ENDPOINTS.PAYMENTS.USER_PAYMENTS}?${params.toString()}`
      );

      if (response.success && response.data) {
        const pagination = (response as any)?.pagination;
        return {
          data: response.data,
          pagination: pagination || {
            current: page,
            pages: 1,
            total: response.data.length,
            limit,
          },
        };
      }

      throw new Error(response.error || "Không thể lấy lịch sử thanh toán");
    } catch (error: any) {
      console.error("[PaymentService] Error getting user payments:", error);
      throw error;
    }
  }

  /**
   * Hủy thanh toán
   */
  static async cancelPayment(orderCode: number): Promise<void> {
    try {
      console.log("[PaymentService] Cancelling payment:", orderCode);

      const url = buildUrl(API_ENDPOINTS.PAYMENTS.CANCEL, { orderCode });
      const response = await apiClient.post(url);

      if (!response.success) {
        throw new Error(response.error || "Không thể hủy thanh toán");
      }
    } catch (error: any) {
      console.error("[PaymentService] Error cancelling payment:", error);
      throw error;
    }
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }

  /**
   * Get status text
   */
  static getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      pending: "⏳ Chờ thanh toán",
      paid: "✅ Đã thanh toán",
      cancelled: "❌ Đã hủy",
      failed: "❌ Thất bại",
      expired: "⏰ Đã hết hạn",
    };
    return statusMap[status] || status;
  }

  /**
   * Get status color
   */
  static getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      pending: "#ff9800",
      paid: "#4caf50",
      cancelled: "#9e9e9e",
      failed: "#f44336",
      expired: "#9e9e9e",
    };
    return colorMap[status] || "#000000";
  }

  /**
   * Check if payment is expired
   */
  static isExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  }
}

export default PaymentService;
