import React from "react";

interface GoogleMapContainerProps {
  mapId: string;
  className?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    lat: number;
    lng: number;
    title: string;
    description?: string;
  }>;
}

const GoogleMapContainer: React.FC<GoogleMapContainerProps> = ({
  mapId,
  className = "map-view",
  center = { lat: 10.7769, lng: 106.6951 }, // Ho Chi Minh City
  zoom = 13,
  markers = [],
}) => {
  // Tạo URL nhúng Google Map sử dụng center và zoom (không cần API key)
  const mapUrl = `https://www.google.com/maps?q=${center.lat},${center.lng}&z=${zoom}&output=embed`;

  return (
    <div className="map-container">
      <div
        id={mapId}
        className={className}
        style={{ width: "100%", height: "100%", minHeight: "400px" }}
      >
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0, borderRadius: "8px" }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
          title={`Google Maps - Vị trí (${markers.length} địa điểm)`}
        />
      </div>
    </div>
  );
};

export default GoogleMapContainer;
