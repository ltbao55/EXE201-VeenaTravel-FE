import { apiClient as api } from './api';

export interface Place {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  vicinity: string;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    url_small: string;
    url_medium: string;
    url_large: string;
  }>;
  price_level?: number;
  opening_hours?: {
    open_now: boolean;
  };
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  formatted_address: string;
  place_id: string;
  types: string[];
}

export interface DirectionsResult {
  routes: Array<{
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      start_address: string;
      end_address: string;
      steps: Array<{
        html_instructions: string;
        distance: { text: string; value: number };
        duration: { text: string; value: number };
      }>;
    }>;
    overview_polyline: { points: string };
  }>;
}

class MapsService {
  /**
   * Lấy tọa độ từ địa chỉ (Geocoding)
   */
  async geocode(address: string): Promise<GeocodeResult> {
    try {
      const response = await api.post('/maps/geocode', { address });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Geocoding failed');
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  /**
   * Lấy địa chỉ từ tọa độ (Reverse Geocoding)
   */
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await api.post('/maps/reverse-geocode', { lat, lng });
      if (response.data.success) {
        return response.data.data.address;
      }
      throw new Error(response.data.message || 'Reverse geocoding failed');
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  /**
   * Tìm kiếm địa điểm gần đây
   */
  async searchNearby(
    lat: number,
    lng: number,
    type: string = 'tourist_attraction',
    radius: number = 5000
  ): Promise<Place[]> {
    try {
      const response = await api.post('/maps/nearby', {
        lat,
        lng,
        type,
        radius
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Nearby search failed');
    } catch (error) {
      console.error('Nearby search error:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết địa điểm
   */
  async getPlaceDetails(placeId: string): Promise<any> {
    try {
      const response = await api.get(`/maps/place/${placeId}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Get place details failed');
    } catch (error) {
      console.error('Get place details error:', error);
      throw error;
    }
  }

  /**
   * Tính khoảng cách và thời gian di chuyển
   */
  async getDistanceMatrix(
    origins: string[],
    destinations: string[],
    mode: string = 'driving'
  ): Promise<any> {
    try {
      const response = await api.post('/maps/distance-matrix', {
        origins,
        destinations,
        mode
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Distance matrix failed');
    } catch (error) {
      console.error('Distance matrix error:', error);
      throw error;
    }
  }

  /**
   * Tìm đường đi giữa các điểm
   */
  async getDirections(
    origin: string | { lat: number; lng: number },
    destination: string | { lat: number; lng: number },
    mode: string = 'driving'
  ): Promise<DirectionsResult> {
    try {
      const response = await api.post('/maps/directions', {
        origin,
        destination,
        mode
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Directions failed');
    } catch (error) {
      console.error('Directions error:', error);
      throw error;
    }
  }

  /**
   * Tối ưu hóa lộ trình cho nhiều điểm
   */
  async optimizeRoute(
    waypoints: string[],
    mode: string = 'driving'
  ): Promise<any> {
    try {
      const response = await api.post('/maps/optimize-route', {
        waypoints,
        mode
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Route optimization failed');
    } catch (error) {
      console.error('Route optimization error:', error);
      throw error;
    }
  }

  /**
   * Lấy URL ảnh từ photo reference
   */
  async getPhotoUrl(photoReference: string, maxWidth: number = 800): Promise<string> {
    try {
      const response = await api.get('/maps/photo-url', {
        params: { photoReference, maxWidth }
      });
      if (response.data.success) {
        return response.data.data.photoUrl;
      }
      throw new Error(response.data.message || 'Get photo URL failed');
    } catch (error) {
      console.error('Get photo URL error:', error);
      throw error;
    }
  }

  /**
   * Tìm kiếm địa điểm du lịch phổ biến tại một thành phố
   */
  async getPopularTouristAttractions(city: string): Promise<Place[]> {
    try {
      // First geocode the city to get coordinates
      const geocodeResult = await this.geocode(city);
      
      // Then search for tourist attractions nearby
      const places = await this.searchNearby(
        geocodeResult.lat,
        geocodeResult.lng,
        'tourist_attraction',
        10000 // 10km radius
      );

      // Sort by rating and return top places
      return places
        .filter(place => place.rating && place.rating >= 4.0)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10);
    } catch (error) {
      console.error('Get popular tourist attractions error:', error);
      throw error;
    }
  }

  /**
   * Tìm kiếm nhà hàng gần đây
   */
  async getNearbyRestaurants(lat: number, lng: number, radius: number = 2000): Promise<Place[]> {
    try {
      const places = await this.searchNearby(lat, lng, 'restaurant', radius);
      return places
        .filter(place => place.rating && place.rating >= 3.5)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 8);
    } catch (error) {
      console.error('Get nearby restaurants error:', error);
      throw error;
    }
  }

  /**
   * Tìm kiếm khách sạn gần đây
   */
  async getNearbyHotels(lat: number, lng: number, radius: number = 5000): Promise<Place[]> {
    try {
      const places = await this.searchNearby(lat, lng, 'lodging', radius);
      return places
        .filter(place => place.rating && place.rating >= 3.5)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6);
    } catch (error) {
      console.error('Get nearby hotels error:', error);
      throw error;
    }
  }
}

export default new MapsService();
