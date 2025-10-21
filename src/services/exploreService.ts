import { apiClient } from "./api";
import { API_CONFIG } from "../config/api";

export interface ExploreCategory {
  key: string;
  name: string;
  icon?: string;
  count?: number;
}

export interface ExplorePlace {
  // Thông tin cơ bản
  id: string;
  title?: string; // Tên địa điểm (BE format)
  name?: string; // Fallback cho title
  description?: string;
  category?: string;
  address?: string;

  // Vị trí
  coordinates?: {
    lat: number;
    lng: number;
  };
  location?: {
    // Fallback cho coordinates
    lat: number;
    lng: number;
  };
  distance?: number; // meters

  // Đánh giá
  rating?: {
    average: number;
    count: number;
  };
  ratingAverage?: number; // Fallback
  ratingCount?: number; // Fallback
  rating?: number; // Legacy fallback
  userRatingsTotal?: number; // Legacy fallback

  // Hình ảnh
  images?: string[];
  photoUrl?: string;

  // Nguồn dữ liệu
  source?: "places" | "partners" | "google";
  isPartner?: boolean;
  priority?: number; // 1-10

  // Thông tin bổ sung
  tags?: string[];
  priceRange?: string; // $ | $$ | $$$ | $$$$
  priceLevel?: number; // Legacy fallback
  contact?: {
    phone?: string;
    email?: string;
  };
  openingHours?: any;
  amenities?: string[];
  place_id?: string; // Google Place ID

  // Metadata
  addedAt?: string;
  updatedAt?: string;

  // Legacy fields for backward compatibility
  types?: string[];
}

export interface ExploreListParams {
  // API parameters theo BE specification
  page?: number; // default 1
  limit?: number; // default 24, max 100
  city?: string; // lọc theo thành phố (match theo address)
  category?: string; // restaurant|cafe|hotel|attraction|...
  q?: string; // full-text search (Mongo)
  minRating?: number; // 0-5
  sort?: "recent" | "rating" | "popular" | "distance";
  lat?: number; // cần cho sort=distance và lọc khoảng cách
  lng?: number; // cần cho sort=distance và lọc khoảng cách
  source?: "all" | "places" | "partners" | "google"; // default all
  random?: boolean; // default false
  maxDistance?: number; // km, default 50

  // Legacy support
  query?: string; // alias for q
  sortBy?: "recent" | "rating" | "popular" | "distance"; // alias for sort
  radius?: number; // meters - legacy
}

export interface ExploreListResponse {
  items: ExplorePlace[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

const BASE = "/explore";

export const exploreService = {
  async featured(
    params: Partial<ExploreListParams> = {}
  ): Promise<ExploreListResponse> {
    try {
      const res = await apiClient.get<any>(`${BASE}/featured`, { params });
      console.log("Featured API response:", res);

      if (res?.success === false) {
        throw new Error(res.error || "Failed to fetch featured places");
      }

      const payload = res?.data ? res.data : res;
      const items: ExplorePlace[] = (payload?.items ||
        payload?.places ||
        payload ||
        []) as ExplorePlace[];
      return {
        items,
        total: payload?.total ?? items.length,
        page: payload?.page ?? 1,
        totalPages: payload?.totalPages ?? 1,
      };
    } catch (error) {
      console.error("Featured API error:", error);
      // Return mock data for testing
      return {
        items: [
          {
            id: "1",
            name: "Independence Palace",
            address: "135 Nam Kỳ Khởi Nghĩa, Bến Nghé, Quận 1, Hồ Chí Minh",
            rating: 4.4,
            ratingCount: 55000,
            photoUrl:
              "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200&auto=format&fit=crop",
            location: { lat: 10.7769, lng: 106.6951 },
            category: "attraction",
            isPartner: true,
          },
          {
            id: "2",
            name: "Notre Dame Cathedral of Saigon",
            address: "01 Công xã Paris, Bến Nghé, Quận 1, Hồ Chí Minh",
            rating: 4.2,
            ratingCount: 34000,
            photoUrl:
              "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200&auto=format&fit=crop",
            location: { lat: 10.7796, lng: 106.6992 },
            category: "attraction",
            isPartner: false,
          },
        ],
        total: 2,
        page: 1,
        totalPages: 1,
      };
    }
  },
  async getCategories(params?: { city?: string }): Promise<ExploreCategory[]> {
    try {
      const res = await apiClient.get<any>(`${BASE}/categories`, { params });
      console.log("Categories API response:", res);

      if (res?.success === false) {
        throw new Error(res.error || "Failed to fetch categories");
      }

      // Support both shapes: { success, data } or raw array
      const data = Array.isArray(res?.data) ? res.data : res;
      return data as ExploreCategory[];
    } catch (error) {
      console.error("Categories API error:", error);
      // Return fallback categories
      return [
        { key: "restaurants", name: "Restaurants" },
        { key: "stays", name: "Stays" },
        { key: "locations", name: "Locations" },
        { key: "guides", name: "Guides" },
      ];
    }
  },

  async list(params: ExploreListParams = {}): Promise<ExploreListResponse> {
    try {
      // Chuẩn hóa parameters theo BE specification
      const query: any = {
        page: params.page || 1,
        limit: params.limit || 24,
        city: params.city,
        category: params.category,
        q: params.q || params.query, // full-text search
        minRating: params.minRating,
        sort: params.sort || params.sortBy,
        lat: params.lat,
        lng: params.lng,
        source: params.source || "all",
        random: params.random || false,
        maxDistance: params.maxDistance || 50,
      };

      // Remove undefined values
      Object.keys(query).forEach((key) => {
        if (query[key] === undefined || query[key] === null) {
          delete query[key];
        }
      });

      console.log("Calling /api/explore with params:", query);
      const res = await apiClient.get<any>(BASE, { params: query });
      console.log("Explore API response:", res);

      if (res?.success === false) {
        throw new Error(res.error || "Failed to fetch explore places");
      }

      // Accept both shapes: { success, data } or raw response
      const payload = res?.data ? res.data : res;
      const items: ExplorePlace[] = (payload?.items ||
        payload?.places ||
        payload ||
        []) as ExplorePlace[];

      return {
        items,
        total: payload?.total ?? items.length,
        page: payload?.page ?? query.page ?? 1,
        totalPages:
          payload?.totalPages ??
          Math.ceil((payload?.total ?? items.length) / (query.limit ?? 24)),
        hasNextPage:
          payload?.hasNextPage ??
          (payload?.page ?? 1) < (payload?.totalPages ?? 1),
        hasPrevPage: payload?.hasPrevPage ?? (payload?.page ?? 1) > 1,
      };
    } catch (error) {
      console.error("Explore API error:", error);
      // Return mock data for testing
      return {
        items: [
          {
            id: "3",
            name: "War Remnants Museum",
            address: "28 Võ Văn Tần, Phường 6, Quận 3, Hồ Chí Minh",
            rating: 4.1,
            ratingCount: 28000,
            photoUrl:
              "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200&auto=format&fit=crop",
            location: { lat: 10.7796, lng: 106.6922 },
            category: params.category || "attraction",
            isPartner: false,
          },
          {
            id: "4",
            name: "Saigon Central Post Office",
            address: "125 Công xã Paris, Bến Nghé, Quận 1, Hồ Chí Minh",
            rating: 4.3,
            ratingCount: 42000,
            photoUrl:
              "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200&auto=format&fit=crop",
            location: { lat: 10.7796, lng: 106.6992 },
            category: params.category || "attraction",
            isPartner: true,
          },
        ],
        total: 2,
        page: 1,
        totalPages: 1,
      };
    }
  },

  async nearby(
    params: Required<Pick<ExploreListParams, "lat" | "lng">> &
      Partial<ExploreListParams>
  ): Promise<ExploreListResponse> {
    try {
      const res = await apiClient.get<any>(`${BASE}/nearby`, { params });
      console.log("Nearby API response:", res);

      if (res?.success === false) {
        throw new Error(res.error || "Failed to fetch nearby places");
      }

      const payload = res?.data ? res.data : res;
      const items: ExplorePlace[] = (payload?.items ||
        payload?.places ||
        payload ||
        []) as ExplorePlace[];
      return {
        items,
        total: payload?.total ?? items.length,
        page: payload?.pagination?.page ?? payload?.page ?? 1,
        totalPages: payload?.pagination?.totalPages ?? payload?.totalPages ?? 1,
        hasNextPage: payload?.pagination?.hasNextPage,
        hasPrevPage: payload?.pagination?.hasPrevPage,
      };
    } catch (error) {
      console.error("Nearby API error:", error);
      // Return mock data for testing
      return {
        items: [
          {
            id: "5",
            name: "Ben Thanh Market",
            address: "Chợ Bến Thành, Quận 1, Hồ Chí Minh",
            rating: 4.0,
            ratingCount: 35000,
            photoUrl:
              "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200&auto=format&fit=crop",
            location: { lat: 10.772, lng: 106.6983 },
            category: params.category || "market",
            isPartner: false,
            distance: 500,
          },
          {
            id: "6",
            name: "Saigon Opera House",
            address: "7 Công Trường Lam Sơn, Bến Nghé, Quận 1, Hồ Chí Minh",
            rating: 4.5,
            ratingCount: 18000,
            photoUrl:
              "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200&auto=format&fit=crop",
            location: { lat: 10.7796, lng: 106.6992 },
            category: params.category || "attraction",
            isPartner: true,
            distance: 800,
          },
        ],
        total: 2,
        page: 1,
        totalPages: 1,
      };
    }
  },

  async getById(
    id: string,
    source: "auto" | "places" | "partners" = "auto"
  ): Promise<ExplorePlace> {
    try {
      console.log(`Fetching place details for ID: ${id}, source: ${source}`);
      const res = await apiClient.get<any>(`${BASE}/${id}`, {
        params: { source },
      });
      console.log("Place details API response:", res);

      if (res?.success === false) {
        throw new Error(res.error || "Failed to fetch place details");
      }

      const payload = res?.data ? res.data : res;
      return payload as ExplorePlace;
    } catch (error) {
      console.error("Place details API error:", error);
      // Thay vì trả về dữ liệu mock cố định, throw error để component xử lý
      throw new Error(
        `Không thể tải chi tiết địa điểm với ID: ${id}. ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
};

export default exploreService;
