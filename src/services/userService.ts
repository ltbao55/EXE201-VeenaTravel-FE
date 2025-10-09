import axios from "axios";
import { API_ENDPOINTS, API_CONFIG, buildUrl } from "../config/api";

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
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USERS.LIST}`;
    const { data } = await axios.get(url, { headers: API_CONFIG.HEADERS });
    // Expect shape: { users: [...], totalPages, ... }
    const users = Array.isArray(data?.users)
      ? data.users
      : Array.isArray(data)
      ? data
      : [];
    return users.map(UserService.mapFromApi);
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
    return {
      id: apiUser.id ?? apiUser._id ?? String(apiUser.userId ?? ""),
      name: apiUser.name ?? apiUser.fullName ?? "",
      email: apiUser.email ?? "",
      role: apiUser.role ?? "user",
      status:
        apiUser.isActive === false ? "inactive" : apiUser.status ?? "active",
      isPremium: Boolean(apiUser.isPremium),
      createdAt: apiUser.createdAt ?? null ?? undefined,
      updatedAt: apiUser.updatedAt ?? apiUser.lastLogin ?? null ?? undefined,
    };
  }
}

export default UserService;
