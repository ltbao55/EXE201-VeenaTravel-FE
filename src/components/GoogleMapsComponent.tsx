import React, { useEffect, useRef, useState } from "react";
import { apiClient as api } from "../services/api";
import { ENV_CONFIG, validateEnvironment } from "../config/environment";

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface Marker {
  id?: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  placeId?: string;
  type?: string;
}

interface GoogleMapsComponentProps {
  mapId: string;
  className?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Marker[];
  onMarkerClick?: (marker: Marker) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

const GoogleMapsComponent: React.FC<GoogleMapsComponentProps> = ({
  mapId,
  className = "map-view",
  center = { lat: 10.7769, lng: 106.6951 }, // Ho Chi Minh City
  zoom = 13,
  markers = [],
  onMarkerClick,
  onMapClick,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string>("");

  // Initialize API key from environment
  useEffect(() => {
    const initializeApiKey = async () => {
      // First, try to get API key from environment
      if (
        ENV_CONFIG.GOOGLE_MAPS_API_KEY &&
        ENV_CONFIG.GOOGLE_MAPS_API_KEY !==
          "YOUR_ACTUAL_GOOGLE_MAPS_API_KEY_HERE"
      ) {
        console.log("Using Google Maps API key from environment");
        setApiKey(ENV_CONFIG.GOOGLE_MAPS_API_KEY);
        return;
      }

      // If no environment key, try to fetch from backend
      try {
        console.log("Fetching Google Maps API key from backend...");
        const response = await api.get("/maps/api-key");
        if (response.data.success) {
          setApiKey(response.data.data.apiKey);
        } else {
          console.warn("Backend API key not available");
          setError("Không thể lấy Google Maps API key từ backend");
        }
      } catch (err) {
        console.error("Error fetching API key from backend:", err);
        setError("Lỗi khi lấy Google Maps API key từ backend");
      }
    };

    // Validate environment
    validateEnvironment();
    initializeApiKey();
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey) return;

    const loadGoogleMapsScript = () => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        console.log("Google Maps already loaded");
        setIsLoaded(true);
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );
      if (existingScript) {
        console.log("Google Maps script already exists, waiting for load");
        existingScript.addEventListener("load", () => {
          console.log("Existing Google Maps script loaded");
          setIsLoaded(true);
        });
        return;
      }

      console.log(
        "Loading Google Maps script with API key:",
        apiKey.substring(0, 10) + "..."
      );

      // Create and load script
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;

      // Set global callback
      window.initMap = () => {
        console.log("Google Maps script loaded successfully");
        setIsLoaded(true);
      };

      script.onerror = () => {
        console.error("Failed to load Google Maps script");
        setError("Không thể tải Google Maps API");
      };

      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, [apiKey]);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return;

    try {
      // Initialize map
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: zoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }],
          },
          {
            featureType: "transit",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }],
          },
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      // Add click listener to map
      if (onMapClick) {
        mapInstanceRef.current.addListener("click", (event: any) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          onMapClick(lat, lng);
        });
      }
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Lỗi khi khởi tạo bản đồ");
    }
  }, [isLoaded, center, zoom, onMapClick]);

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    try {
      console.log(
        "[GoogleMaps] Updating markers. Incoming:",
        Array.isArray(markers) ? markers.length : 0
      );
    } catch {}

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      // Support both {lat,lng} and {position:{lat,lng}}
      const pos = (markerData as any).position || markerData;
      const lat = Number((pos as any)?.lat);
      const lng = Number((pos as any)?.lng);
      if (!isFinite(lat) || !isFinite(lng)) {
        console.warn("[GoogleMaps] Skip invalid marker position:", markerData);
        return;
      }
      // Different icons for different types
      let icon = null;
      if (markerData.type === "city") {
        icon = {
          url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          scaledSize: new window.google.maps.Size(32, 32),
        };
      } else if (markerData.type === "attraction") {
        icon = {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          scaledSize: new window.google.maps.Size(32, 32),
        };
      } else if (markerData.type === "restaurant") {
        icon = {
          url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
          scaledSize: new window.google.maps.Size(32, 32),
        };
      } else if (markerData.type === "hotel") {
        icon = {
          url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
          scaledSize: new window.google.maps.Size(32, 32),
        };
      } else {
        icon = {
          url: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
          scaledSize: new window.google.maps.Size(32, 32),
        };
      }

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        title: markerData.title,
        icon: icon,
        animation: window.google.maps.Animation.DROP,
      });

      // Add info window with type information
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333; font-weight: 600;">${
              markerData.title
            }</h3>
            <div style="margin: 0 0 8px 0; font-size: 12px; color: #666; text-transform: uppercase; font-weight: 500;">
              ${markerData.type || "Địa điểm"}
            </div>
            ${
              markerData.description
                ? `<p style="margin: 0; font-size: 14px; color: #666; line-height: 1.4;">${markerData.description}</p>`
                : ""
            }
            <div style="margin-top: 8px; font-size: 12px; color: #999;">
              📍 ${lat.toFixed?.(6) ?? lat}, ${lng.toFixed?.(6) ?? lng}
            </div>
          </div>
        `,
      });

      // Add click listener to marker
      marker.addListener("click", () => {
        infoWindow.open(mapInstanceRef.current, marker);
        if (onMarkerClick) {
          onMarkerClick(markerData);
        }
      });

      markersRef.current.push(marker);
    });

    try {
      console.log(
        "[GoogleMaps] Applied markers to map:",
        markersRef.current.length
      );
    } catch {}
  }, [markers, onMarkerClick]);

  // Update map center and zoom when props change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center, zoom]);

  if (error) {
    return (
      <div className="map-container">
        <div
          className="map-error"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#666",
            fontSize: "14px",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <div>
            <p>{error}</p>
            <p style={{ fontSize: "12px", marginTop: "8px" }}>
              Sử dụng bản đồ embed làm fallback...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="map-container">
        <div
          className="map-loading"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#666",
            fontSize: "14px",
          }}
        >
          Đang tải bản đồ...
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <div
        id={mapId}
        ref={mapRef}
        className={className}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    </div>
  );
};

export default GoogleMapsComponent;
