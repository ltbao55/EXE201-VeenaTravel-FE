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
}) => {
  // Tạo URL nhúng Google Map đơn giản không cần API key
  // Sử dụng Google Maps embed URL công khai
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d1959876.4544479!2d106.36933!3d11.358!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e6!4m5!1s0x317529292e8d3dd1%3A0xf15f5aad773c112b!2zVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!3m2!1d10.8230989!2d106.6296638!4m5!1s0x3171ac71294bf0ad%3A0x9327d7c4d0e5c5c3!2zxJDDoCBM4bqhdCwgTMOibSDEkOG7k25nLCBWaeG7h3QgTmFt!3m2!1d11.9404!2d108.4583!5e0!3m2!1svi!2s!4v1640995200000!5m2!1svi!2s`;

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
          title="Google Maps - Tuyến đường từ TP.HCM đến Đà Lạt"
        />
      </div>
    </div>
  );
};

export default GoogleMapContainer;
