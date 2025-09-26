import { apiClient } from './api';
import { API_ENDPOINTS, buildUrl } from '../config/api';

export interface Destination {
  id: string;
  name: string;
  description: string;
  country: string;
  city: string;
  images: string[];
  rating: number;
  reviewCount: number;
  price: {
    min: number;
    max: number;
    currency: string;
  };
  tags: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DestinationSearchParams {
  query?: string;
  country?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export class DestinationService {
  // Get all destinations
  static async getDestinations(params?: DestinationSearchParams): Promise<Destination[]> {
    const response = await apiClient.get<Destination[]>(API_ENDPOINTS.DESTINATIONS.LIST, {
      params,
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch destinations');
    }
    
    return response.data;
  }

  // Get destination by ID
  static async getDestinationById(id: string): Promise<Destination> {
    const url = buildUrl(API_ENDPOINTS.DESTINATIONS.DETAIL, { id });
    const response = await apiClient.get<Destination>(url);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch destination');
    }
    
    return response.data;
  }

  // Search destinations
  static async searchDestinations(params: DestinationSearchParams): Promise<Destination[]> {
    const response = await apiClient.get<Destination[]>(API_ENDPOINTS.DESTINATIONS.SEARCH, {
      params,
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to search destinations');
    }
    
    return response.data;
  }

  // Get popular destinations
  static async getPopularDestinations(limit: number = 10): Promise<Destination[]> {
    const response = await apiClient.get<Destination[]>(API_ENDPOINTS.DESTINATIONS.POPULAR, {
      params: { limit },
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch popular destinations');
    }
    
    return response.data;
  }
}

export default DestinationService;
