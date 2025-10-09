import MapsService from './mapsService';

export interface ParsedLocation {
  name: string;
  coordinates?: { lat: number; lng: number };
  type?: 'city' | 'attraction' | 'restaurant' | 'hotel' | 'general';
  confidence: number; // 0-1, how confident we are this is a location
}

class LocationParserService {
  // Common Vietnamese city names and their coordinates
  private vietnameseCities = {
    'sài gòn': { lat: 10.7769, lng: 106.6951, name: 'Ho Chi Minh City' },
    'hồ chí minh': { lat: 10.7769, lng: 106.6951, name: 'Ho Chi Minh City' },
    'hcm': { lat: 10.7769, lng: 106.6951, name: 'Ho Chi Minh City' },
    'tp.hcm': { lat: 10.7769, lng: 106.6951, name: 'Ho Chi Minh City' },
    'hà nội': { lat: 21.0285, lng: 105.8542, name: 'Hanoi' },
    'hanoi': { lat: 21.0285, lng: 105.8542, name: 'Hanoi' },
    'đà nẵng': { lat: 16.0544, lng: 108.2022, name: 'Da Nang' },
    'danang': { lat: 16.0544, lng: 108.2022, name: 'Da Nang' },
    'nha trang': { lat: 12.2388, lng: 109.1967, name: 'Nha Trang' },
    'nhatrang': { lat: 12.2388, lng: 109.1967, name: 'Nha Trang' },
    'đà lạt': { lat: 11.9404, lng: 108.4583, name: 'Da Lat' },
    'dalat': { lat: 11.9404, lng: 108.4583, name: 'Da Lat' },
    'vũng tàu': { lat: 10.3459, lng: 107.0843, name: 'Vung Tau' },
    'vungtau': { lat: 10.3459, lng: 107.0843, name: 'Vung Tau' },
    'phú quốc': { lat: 10.2899, lng: 103.9840, name: 'Phu Quoc' },
    'phuquoc': { lat: 10.2899, lng: 103.9840, name: 'Phu Quoc' },
    'huế': { lat: 16.4637, lng: 107.5909, name: 'Hue' },
    'hue': { lat: 16.4637, lng: 107.5909, name: 'Hue' },
    'hội an': { lat: 15.8801, lng: 108.3380, name: 'Hoi An' },
    'hoian': { lat: 15.8801, lng: 108.3380, name: 'Hoi An' },
    'cần thơ': { lat: 10.0452, lng: 105.7469, name: 'Can Tho' },
    'cantho': { lat: 10.0452, lng: 105.7469, name: 'Can Tho' },
    'quy nhơn': { lat: 13.7563, lng: 109.2237, name: 'Quy Nhon' },
    'quynhon': { lat: 13.7563, lng: 109.2237, name: 'Quy Nhon' },
    'buôn ma thuột': { lat: 12.6667, lng: 108.0500, name: 'Buon Ma Thuot' },
    'buonmathuot': { lat: 12.6667, lng: 108.0500, name: 'Buon Ma Thuot' },
    'cà mau': { lat: 9.1768, lng: 105.1524, name: 'Ca Mau' },
    'camau': { lat: 9.1768, lng: 105.1524, name: 'Ca Mau' },
    'rạch giá': { lat: 10.0452, lng: 105.0809, name: 'Rach Gia' },
    'rachgia': { lat: 10.0452, lng: 105.0809, name: 'Rach Gia' },
  };

  // Common tourist attractions in Vietnam
  private touristAttractions = {
    'nhà thờ đức bà': { lat: 10.7797, lng: 106.699, name: 'Notre Dame Cathedral' },
    'chợ bến thành': { lat: 10.772, lng: 106.698, name: 'Ben Thanh Market' },
    'dinh độc lập': { lat: 10.777, lng: 106.6956, name: 'Independence Palace' },
    'bưu điện sài gòn': { lat: 10.7796, lng: 106.6992, name: 'Saigon Central Post Office' },
    'phố cổ hội an': { lat: 15.8801, lng: 108.3380, name: 'Hoi An Ancient Town' },
    'cầu rồng': { lat: 16.0614, lng: 108.2278, name: 'Dragon Bridge' },
    'bãi biển mỹ khê': { lat: 16.0583, lng: 108.2419, name: 'My Khe Beach' },
    'vịnh hạ long': { lat: 20.9101, lng: 107.1839, name: 'Ha Long Bay' },
    'hồ gươm': { lat: 21.0285, lng: 105.8542, name: 'Hoan Kiem Lake' },
    'chùa một cột': { lat: 21.0356, lng: 105.8322, name: 'One Pillar Pagoda' },
  };

  /**
   * Parse location information from chat message
   */
  async parseLocationFromMessage(message: string): Promise<ParsedLocation[]> {
    const locations: ParsedLocation[] = [];
    const lowerMessage = message.toLowerCase();

    console.log('[LocationParser] Analyzing message:', message.substring(0, 100) + '...');

    // Check for Vietnamese cities (with better matching)
    for (const [key, city] of Object.entries(this.vietnameseCities)) {
      const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(message)) {
        locations.push({
          name: city.name,
          coordinates: { lat: city.lat, lng: city.lng },
          type: 'city',
          confidence: 0.9
        });
        console.log('[LocationParser] Found city:', city.name);
      }
    }

    // Check for tourist attractions (with better matching)
    for (const [key, attraction] of Object.entries(this.touristAttractions)) {
      const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(message)) {
        locations.push({
          name: attraction.name,
          coordinates: { lat: attraction.lat, lng: attraction.lng },
          type: 'attraction',
          confidence: 0.8
        });
        console.log('[LocationParser] Found attraction:', attraction.name);
      }
    }

    // Enhanced regex patterns for better location extraction
    const locationPatterns = [
      // Patterns for Vietnamese locations
      /(?:đi|đến|tại|ở|từ|thăm|khám phá|du lịch|ghé|thăm quan)\s+([a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]+?)(?:\s|$|,|\.|!|\?|và|hoặc)/gi,
      /(?:thành phố|tỉnh|quận|huyện|phường|xã|thị trấn)\s+([a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]+?)(?:\s|$|,|\.|!|\?|và|hoặc)/gi,
      // Patterns for specific landmarks
      /(?:chợ|chùa|nhà thờ|bảo tàng|công viên|bãi biển|núi|sông|hồ|đảo|vịnh)\s+([a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]+?)(?:\s|$|,|\.|!|\?|và|hoặc)/gi,
      // Patterns for numbered locations (Ngày 1, Ngày 2, etc.)
      /(?:ngày\s+\d+[:\-]?\s*)([a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]+?)(?:\s|$|,|\.|!|\?|và|hoặc)/gi,
    ];

    // Limit geocoding calls to prevent too many API requests
    let geocodeCount = 0;
    const maxGeocodeCalls = 3; // Limit to 3 geocoding calls per message

    for (const pattern of locationPatterns) {
      if (geocodeCount >= maxGeocodeCalls) break;
      
      const matches = message.match(pattern);
      if (matches) {
        for (const match of matches) {
          if (geocodeCount >= maxGeocodeCalls) break;
          
          const locationName = match
            .replace(/(?:đi|đến|tại|ở|từ|thăm|khám phá|du lịch|ghé|thăm quan|thành phố|tỉnh|quận|huyện|phường|xã|thị trấn|chợ|chùa|nhà thờ|bảo tàng|công viên|bãi biển|núi|sông|hồ|đảo|vịnh|ngày\s+\d+[:\-]?)\s+/gi, '')
            .trim();
          
          if (locationName.length > 2 && locationName.length < 50) {
            // Skip if already found in cities or attractions
            const alreadyFound = locations.some(loc => 
              loc.name.toLowerCase().includes(locationName.toLowerCase()) ||
              locationName.toLowerCase().includes(loc.name.toLowerCase())
            );
            
            if (!alreadyFound) {
              try {
                geocodeCount++;
                console.log(`[LocationParser] Geocoding attempt ${geocodeCount}/${maxGeocodeCalls}:`, locationName);
                const geocodeResult = await MapsService.geocode(locationName);
                if (geocodeResult) {
                  locations.push({
                    name: geocodeResult.formatted_address,
                    coordinates: { lat: geocodeResult.lat, lng: geocodeResult.lng },
                    type: 'general',
                    confidence: 0.6
                  });
                  console.log('[LocationParser] Found location via geocoding:', locationName);
                }
              } catch (error) {
                console.warn('[LocationParser] Failed to geocode location:', locationName);
              }
            }
          }
        }
      }
    }

    // Remove duplicates and sort by confidence
    const uniqueLocations = locations.filter((loc, index, self) => 
      index === self.findIndex(l => l.name === loc.name)
    );

    console.log('[LocationParser] Found', uniqueLocations.length, 'locations:', uniqueLocations.map(l => l.name));
    return uniqueLocations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get the most relevant location from parsed locations
   */
  getPrimaryLocation(locations: ParsedLocation[]): ParsedLocation | null {
    if (locations.length === 0) return null;
    
    // Prefer cities over attractions, then by confidence
    const cityLocations = locations.filter(loc => loc.type === 'city');
    if (cityLocations.length > 0) {
      return cityLocations[0];
    }
    
    return locations[0];
  }

  /**
   * Search for nearby places based on location
   */
  async getNearbyPlaces(location: ParsedLocation, type: string = 'tourist_attraction'): Promise<any[]> {
    if (!location.coordinates) return [];

    try {
      const places = await MapsService.searchNearby(
        location.coordinates.lat,
        location.coordinates.lng,
        type,
        5000 // 5km radius
      );

      return places.slice(0, 8); // Limit to 8 places
    } catch (error) {
      console.error('Failed to get nearby places:', error);
      return [];
    }
  }
}

export default new LocationParserService();
