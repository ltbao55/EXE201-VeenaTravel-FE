import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_CONFIG } from "../config/mapbox";

// Set Mapbox access token from config
mapboxgl.accessToken = MAPBOX_CONFIG.ACCESS_TOKEN;

interface Destination {
  name: string;
  lat: number;
  lng: number;
  description: string;
  type?: "origin" | "destination" | "waypoint";
}

interface ChatMapProps {
  className?: string;
  destinations?: Destination[];
}

const ChatMap: React.FC<ChatMapProps> = ({
  className = "chat-map",
  destinations = [],
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Default destinations for Ho Chi Minh City to Da Lat trip
  const defaultDestinations: Destination[] = [
    {
      name: "Thành phố Hồ Chí Minh",
      lat: 10.7769,
      lng: 106.6951,
      description: "Điểm khởi hành - Thành phố sôi động nhất Việt Nam",
      type: "origin",
    },
    {
      name: "Nhà thờ Đức Bà Sài Gòn",
      lat: 10.7797,
      lng: 106.699,
      description: "Biểu tượng kiến trúc Gothic nổi tiếng của Sài Gòn",
      type: "waypoint",
    },
    {
      name: "Chợ Bến Thành",
      lat: 10.772,
      lng: 106.698,
      description: "Chợ truyền thống sầm uất với đủ loại hàng hóa",
      type: "waypoint",
    },
    {
      name: "Dinh Độc Lập",
      lat: 10.777,
      lng: 106.6956,
      description: "Cung điện lịch sử với kiến trúc độc đáo",
      type: "waypoint",
    },
    {
      name: "Đà Lạt",
      lat: 11.9404,
      lng: 108.4583,
      description: "Thành phố ngàn hoa với khí hậu mát mẻ - Điểm đến chính",
      type: "destination",
    },
  ];

  const allDestinations =
    destinations.length > 0 ? destinations : defaultDestinations;

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_CONFIG.STYLES.STREETS,
      center: MAPBOX_CONFIG.DEFAULT_CENTER as [number, number],
      zoom: MAPBOX_CONFIG.DEFAULT_ZOOM,
      attributionControl: false,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");

    map.current.on("load", () => {
      setMapLoaded(true);
      addDestinationMarkers();
      fitMapToDestinations();
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const addDestinationMarkers = () => {
    if (!map.current) return;

    allDestinations.forEach((destination, index) => {
      // Create custom marker element
      const markerElement = document.createElement("div");
      markerElement.className = "custom-marker";

      // Different styles for different types
      const getMarkerColor = (type?: string) => {
        switch (type) {
          case "origin":
            return "#4CAF50"; // Green
          case "destination":
            return "#FF4D85"; // Pink
          case "waypoint":
            return "#2196F3"; // Blue
          default:
            return "#FF9800"; // Orange
        }
      };

      markerElement.innerHTML = `
        <div style="
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: ${getMarkerColor(destination.type)};
          border: 3px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          cursor: pointer;
        ">
          ${index + 1}
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
      }).setHTML(`
        <div style="padding: 10px; min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: ${getMarkerColor(
            destination.type
          )}; font-size: 16px;">
            ${destination.name}
          </h4>
          <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.4;">
            ${destination.description}
          </p>
          ${
            destination.type
              ? `
            <span style="
              display: inline-block;
              margin-top: 8px;
              padding: 2px 8px;
              background-color: ${getMarkerColor(destination.type)};
              color: white;
              border-radius: 12px;
              font-size: 12px;
              text-transform: capitalize;
            ">
              ${
                destination.type === "origin"
                  ? "Điểm khởi hành"
                  : destination.type === "destination"
                  ? "Điểm đến"
                  : "Điểm dừng"
              }
            </span>
          `
              : ""
          }
        </div>
      `);

      // Add marker to map
      new mapboxgl.Marker(markerElement)
        .setLngLat([destination.lng, destination.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });
  };

  const fitMapToDestinations = () => {
    if (!map.current || allDestinations.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    allDestinations.forEach((destination) => {
      bounds.extend([destination.lng, destination.lat]);
    });

    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 12,
    });
  };

  return (
    <div className="map-container">
      <div
        ref={mapContainer}
        className={className}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "400px",
        }}
      />
      {!mapLoaded && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(255, 255, 255, 0.9)",
            padding: "20px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              border: "2px solid #FF4D85",
              borderTop: "2px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          Đang tải bản đồ...
        </div>
      )}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatMap;
