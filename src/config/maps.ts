// Google Maps configuration
export const MAPS_CONFIG = {
  // Thay thế bằng API key thực tế của bạn
  API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
  
  // Default map settings
  DEFAULT_CENTER: { lat: 10.7769, lng: 106.6951 }, // Ho Chi Minh City
  DEFAULT_ZOOM: 13,
  
  // Map styles
  MAP_STYLES: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'on' }]
    },
    {
      featureType: 'transit',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }]
    }
  ]
};
