import axios from "axios";
import { API_ENDPOINTS, API_CONFIG, buildUrl } from "../config/api";
import { apiClient } from "./api";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role?: "user" | "admin";
  status?: "active" | "inactive" | "banned";
  isPremium?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password?: string; // nếu API bypass auth, có thể không cần
  role?: "user" | "admin";
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: "user" | "admin";
  status?: "active" | "inactive" | "banned";
  isPremium?: boolean;
}

export class UserService {
  static async list(): Promise<ManagedUser[]> {
    // Get auth token for admin API calls
    const token = localStorage.getItem("authToken");
    const headers = {
      ...API_CONFIG.HEADERS,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Step 1: Get all users
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USERS.LIST}`;
    const { data } = await axios.get(url, { headers });
    
    console.log("[UserService] Raw API response:", data);
    
    // Expect shape: { users: [...], totalPages, ... }
    const users = Array.isArray(data?.users)
      ? data.users
      : Array.isArray(data)
      ? data
      : [];
    
    console.log(`[UserService] Found ${users.length} users`);
    
    // Step 2: Get all active subscriptions (admin endpoint - only 1 request!)
    // This is much more efficient than calling API for each user
    // Use apiClient which automatically adds auth token
    let premiumUserIds = new Set<string>();
    try {
      const subscriptionsResponse = await apiClient.get<any>(
        `/subscriptions/admin/all?status=active&limit=1000`
      );
      
      // apiClient returns { success, data, error } format (doesn't throw on HTTP errors)
      if (subscriptionsResponse.success && subscriptionsResponse.data) {
        // Response structure: { success: true, data: { data: [...], pagination: {...} } }
        const subscriptions = Array.isArray(subscriptionsResponse.data?.data)
          ? subscriptionsResponse.data.data
          : Array.isArray(subscriptionsResponse.data)
          ? subscriptionsResponse.data
          : [];
        
        console.log(`[UserService] Found ${subscriptions.length} active subscriptions`);
        if (subscriptions.length > 0) {
          console.log(`[UserService] Sample subscription:`, subscriptions[0]);
        }
        
        // Find all users with premium subscriptions
        subscriptions.forEach((sub: any) => {
          // planId might be populated object { _id, type, name, ... } or just ID string
          const planType = sub.planId?.type || sub.plan?.type || "";
          // userId might be populated object { _id, email, name } or just ID string/ObjectId
          const userId = sub.userId?._id?.toString() || 
                        (typeof sub.userId === 'object' && sub.userId?._id?.toString()) ||
                        sub.userId?.toString() || 
                        String(sub.userId || "");
          const endDate = sub.endDate ? new Date(sub.endDate) : null;
          const isActive = !endDate || endDate > new Date();
          
          // Check if subscription is premium and still active
          if ((planType === "premium" || planType === "Premium") && isActive && userId) {
            premiumUserIds.add(userId);
            console.log(`[UserService] Found premium subscription for user ${userId} (plan: ${planType})`);
          }
        });
        
        console.log(`[UserService] Found ${premiumUserIds.size} premium users from subscriptions`);
      } else {
        // apiClient returns error in response, doesn't throw
        const errorMsg = subscriptionsResponse.error || "Unknown error";
        console.warn(`[UserService] Subscriptions API error:`, errorMsg);
        console.warn(`[UserService] Full response:`, subscriptionsResponse);
        
        // Check if it's authorization error
        if (errorMsg.toLowerCase().includes("unauthorized") || 
            errorMsg.toLowerCase().includes("admin") ||
            errorMsg.toLowerCase().includes("403") ||
            errorMsg.toLowerCase().includes("401")) {
          console.warn(`[UserService] ⚠️ Unauthorized to fetch subscriptions. Make sure you are logged in as admin user.`);
        }
      }
    } catch (subscriptionsErr: any) {
      // Catch any unexpected errors (network errors, etc.)
      console.warn(`[UserService] Unexpected error fetching subscriptions:`, subscriptionsErr);
      // Continue without subscription data - users will show as non-premium
    }
    
    // Step 3: Map users with premium status from subscriptions
    const mappedUsers = users.map((user: any) => {
      const mapped = UserService.mapFromApi(user);
      
      // Check if user has premium subscription
      const userId = mapped.id;
      if (premiumUserIds.has(userId)) {
        mapped.isPremium = true;
        console.log(`[UserService] ✅ User ${mapped.email} is premium (from subscription)`);
      }
      
      return mapped;
    });
    
    return mappedUsers;
  }

  static async create(payload: CreateUserRequest): Promise<ManagedUser> {
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USERS.CREATE}`;
    const { data } = await axios.post(url, payload, {
      headers: API_CONFIG.HEADERS,
    });
    // Some APIs return wrapper { user }, others return object directly
    const user = data?.user ?? data;
    return UserService.mapFromApi(user);
  }

  static async getById(id: string): Promise<ManagedUser> {
    const path = buildUrl(API_ENDPOINTS.USERS.DETAIL, { id });
    const url = `${API_CONFIG.BASE_URL}${path}`;
    const { data } = await axios.get(url, { headers: API_CONFIG.HEADERS });
    const user = data?.user ?? data;
    return UserService.mapFromApi(user);
  }

  static async update(
    id: string,
    payload: UpdateUserRequest
  ): Promise<ManagedUser> {
    const path = buildUrl(API_ENDPOINTS.USERS.UPDATE, { id });
    const url = `${API_CONFIG.BASE_URL}${path}`;
    const { data } = await axios.put(url, payload, {
      headers: API_CONFIG.HEADERS,
    });
    const user = data?.user ?? data;
    return UserService.mapFromApi(user);
  }

  static async remove(id: string): Promise<{ id: string } | null> {
    const path = buildUrl(API_ENDPOINTS.USERS.DELETE, { id });
    const url = `${API_CONFIG.BASE_URL}${path}`;
    const { data } = await axios.delete(url, { headers: API_CONFIG.HEADERS });
    return data ?? { id };
  }

  private static mapFromApi(apiUser: any): ManagedUser {
    if (!apiUser) return { id: "", name: "", email: "" } as ManagedUser;
    
    // Debug: Always log user data to check premium status fields
    console.log("[UserService] Mapping user from API:", {
      id: apiUser.id ?? apiUser._id,
      email: apiUser.email,
      isPremium: apiUser.isPremium,
      premium: apiUser.premium,
      hasPremium: apiUser.hasPremium,
      subscriptionType: apiUser.subscriptionType,
      planType: apiUser.planType,
      payments: apiUser.payments,
      paymentHistory: apiUser.paymentHistory,
      paidPayments: apiUser.paidPayments,
      transactions: apiUser.transactions,
      allFields: Object.keys(apiUser),
    });
    
    // Check premium status from multiple sources (similar to ChatPage logic)
    // Priority:
    // 1. Direct premium fields
    // 2. Subscription type/plan type
    // 3. Payments array with status "paid" (same logic as ChatPage)
    const hasDirectPremiumFlag = 
      Boolean(apiUser.isPremium) ||
      Boolean(apiUser.premium) ||
      Boolean(apiUser.hasPremium);
    
    const hasSubscriptionPremium = 
      apiUser.subscriptionType === "premium" ||
      apiUser.subscriptionType === "Premium" ||
      apiUser.planType === "premium" ||
      apiUser.planType === "Premium";
    
    // Check payments array for paid premium payments (same as ChatPage)
    // Also check paymentHistory, paidPayments, or any payment-related arrays
    const paymentArrays = [
      apiUser.payments,
      apiUser.paymentHistory,
      apiUser.paidPayments,
      apiUser.transactions,
    ].filter(Boolean);
    
    const hasPaidPremiumPayment = paymentArrays.some((payments: any) => {
      if (!Array.isArray(payments)) return false;
      return payments.some((p: any) => {
        const isPaid = p.status === "paid" || 
                      p.status === "success" || 
                      p.status === "completed" ||
                      p.status === "PAID";
        if (!isPaid) return false;
        
        const description = (p.description || "").toLowerCase();
        const metadata = p.metadata || {};
        const isPremium = 
          p.planType === "premium" ||
          p.planType === "Premium" ||
          description.includes("premium") ||
          metadata.planType === "premium" ||
          metadata.planType === "Premium" ||
          p.plan === "premium" ||
          p.plan === "Premium";
        
        return isPremium;
      });
    });
    
    const isPremium = hasDirectPremiumFlag || 
                     hasSubscriptionPremium || 
                     hasPaidPremiumPayment;
    
    if (process.env.NODE_ENV === "development") {
      if (isPremium) {
        console.log("[UserService] User marked as premium:", apiUser.email, {
          hasDirectPremiumFlag,
          hasSubscriptionPremium,
          hasPaidPremiumPayment,
        });
      }
    }
    
    return {
      id: apiUser.id ?? apiUser._id ?? String(apiUser.userId ?? ""),
      name: apiUser.name ?? apiUser.fullName ?? "",
      email: apiUser.email ?? "",
      role: apiUser.role ?? "user",
      status:
        apiUser.isActive === false ? "inactive" : apiUser.status ?? "active",
      isPremium: isPremium,
      createdAt: apiUser.createdAt ?? null ?? undefined,
      updatedAt: apiUser.updatedAt ?? apiUser.lastLogin ?? null ?? undefined,
    };
  }
}

export default UserService;
