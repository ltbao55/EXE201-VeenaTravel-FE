// Mapbox configuration
export const MAPBOX_CONFIG = {
  // Token Mapbox công khai - để sử dụng thực tế, tạo token tại: https://account.mapbox.com/access-tokens/
  // Token này là token demo công khai của Mapbox
  ACCESS_TOKEN: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  
  // Map styles
  STYLES: {
    STREETS: 'mapbox://styles/mapbox/streets-v12',
    SATELLITE: 'mapbox://styles/mapbox/satellite-v9',
    OUTDOORS: 'mapbox://styles/mapbox/outdoors-v12',
    LIGHT: 'mapbox://styles/mapbox/light-v11',
    DARK: 'mapbox://styles/mapbox/dark-v11'
  },
  
  // Default map settings
  DEFAULT_CENTER: [106.6951, 10.7769], // Ho Chi Minh City
  DEFAULT_ZOOM: 6,
  
  // Map bounds for Vietnam
  VIETNAM_BOUNDS: [
    [102.144, 8.179], // Southwest coordinates
    [109.464, 23.393] // Northeast coordinates
  ]
};

// Helper function to validate token
export const isValidMapboxToken = (token: string): boolean => {
  return token.startsWith('pk.') && token.length > 50;
};
