import { apiClient } from "./api";

export type PlanType = "free" | "premium" | "pro";

export interface SubscriptionPlan {
  _id: string;
  type: PlanType;
  name?: string;
  price?: number;
  trip_limit?: number;
  message_limit?: number;
}

export interface UserSubscriptionDTO {
  _id: string;
  userId: string;
  planId: SubscriptionPlan | string;
  status: "active" | "expired" | "cancelled" | "pending";
  startDate: string;
  endDate: string;
  current_trip_count?: number;
  current_message_count?: number;
}

export interface CurrentSubscriptionResponse {
  subscription: UserSubscriptionDTO | null;
}

export const subscriptionService = {
  async getCurrent() {
    return apiClient.get<CurrentSubscriptionResponse>("/subscriptions/current");
  },
  async checkMessageLimit() {
    return apiClient.get<any>("/subscriptions/check-message-limit");
  },
};

export default subscriptionService;


