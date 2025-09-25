import React, { useState, useEffect } from "react";
import LeftSidebar from "../components/LeftSidebar";
import MapContainer from "../components/MapContainer";
import "../styles/ExplorePage.css";

// Declare Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

const ExplorePage: React.FC = () => {
  const [exploreMap, setExploreMap] = useState<any>(null);
  const [isContentVisible, setIsContentVisible] = useState<boolean>(true);

  // Handle content visibility toggle and map resize
  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);

    // Wait for CSS transition to complete, then resize map
    setTimeout(() => {
      if (exploreMap) {
        exploreMap.invalidateSize();
      }
    }, 300); // Match CSS transition duration
  };

  // Initialize map when component mounts
  useEffect(() => {
    // Load Leaflet CSS and JS
    const loadLeaflet = async () => {
      // Add Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const leafletCSS = document.createElement("link");
        leafletCSS.rel = "stylesheet";
        leafletCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(leafletCSS);
      }

      // Add Leaflet JS
      if (!window.L) {
        const leafletJS = document.createElement("script");
        leafletJS.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        leafletJS.onload = () => {
          setTimeout(() => {
            initExploreMap();
          }, 100);
        };
        document.head.appendChild(leafletJS);
      } else {
        setTimeout(() => {
          initExploreMap();
        }, 100);
      }
    };

    loadLeaflet();

    return () => {
      if (exploreMap) {
        exploreMap.remove();
      }
    };
  }, []);

  // Initialize explore map
  const initExploreMap = () => {
    if (exploreMap) {
      exploreMap.remove();
      setExploreMap(null);
    }

    const mapContainer = document.getElementById("explore-map");
    if (!mapContainer || mapContainer.offsetWidth === 0 || !window.L) {
      setTimeout(() => initExploreMap(), 100);
      return;
    }

    // Center on Ho Chi Minh City
    const map = window.L.map("explore-map").setView([10.7769, 106.6951], 13);

    // Add tile layer
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    setExploreMap(map);

    // Force map to recalculate size
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, 100);

    // Add sample markers
    addExploreMapMarkers(map);
  };

  // Add markers to explore map
  const addExploreMapMarkers = (map: any) => {
    const destinations = [
      {
        name: "Bưu điện Thành Phố",
        lat: 10.7797,
        lng: 106.699,
        description: "Biểu tượng kiến trúc Gothic nổi tiếng của Sài Gòn",
        image:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      },
      {
        name: "Bitexco",
        lat: 10.772,
        lng: 106.698,
        description: "Tòa nhà cao nhất Sài Gòn với tầm nhìn 360 độ",
        image:
          "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=300&h=200&fit=crop",
      },
      {
        name: "Nhà hàng Ăn Đô Banana Leaf Sài Gòn",
        lat: 10.777,
        lng: 106.6956,
        description: "Nhà hàng phục vụ món ăn truyền thống",
        image:
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=200&fit=crop",
      },
      {
        name: "Đại quán sát Sài Gòn",
        lat: 10.765,
        lng: 106.692,
        description: "Vòng quay khổng lồ với tầm nhìn toàn cảnh thành phố",
        image:
          "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop",
      },
      {
        name: "Bảo tàng Sài Gòn",
        lat: 10.769,
        lng: 106.698,
        description: "Bảo tàng lịch sử và văn hóa Sài Gòn",
        image:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop",
      },
      {
        name: "Bến Bạch Đằng",
        lat: 10.771,
        lng: 106.705,
        description: "Bến thuyền du lịch sông Sài Gòn",
        image:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      },
    ];

    destinations.forEach((dest) => {
      window.L.marker([dest.lat, dest.lng]).addTo(map).bindPopup(`
          <div style="text-align: center; min-width: 200px;">
            <h4 style="margin: 0 0 8px 0; color: #FF4D85; font-size: 16px;">${dest.name}</h4>
            <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.4;">${dest.description}</p>
          </div>
        `);
    });
  };

  const destinations = [
    {
      name: "Bưu điện Thành Phố",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      category: "Kiến trúc",
    },
    {
      name: "Bitexco",
      image:
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=300&h=200&fit=crop",
      category: "Tòa nhà",
    },
    {
      name: "Nhà hàng Ăn Đô Banana Leaf Sài Gòn",
      image:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=200&fit=crop",
      category: "Ẩm thực",
    },
    {
      name: "Đại quán sát Sài Gòn",
      image:
        "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop",
      category: "Giải trí",
    },
    {
      name: "Bảo tàng Sài Gòn",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop",
      category: "Văn hóa",
    },
    {
      name: "Bến Bạch Đằng",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      category: "Du thuyền",
    },
  ];

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Left Sidebar Navigation */}
        <LeftSidebar activeItem="explore" />

        {/* Explore Content */}
        <div className={`explore-content ${!isContentVisible ? "hidden" : ""}`}>
          <div className="explore-header">
            <h1>Thành phố Hồ Chí Minh</h1>
            <div className="search-bar">
              <input type="text" placeholder="Tìm kiếm địa điểm..." />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M21 21L16.65 16.65"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className="filter-tabs">
            <button className="filter-tab active">Quan điểm</button>
            <button className="filter-tab">Ăn uống</button>
            <button className="filter-tab">Thú vị</button>
            <button className="filter-tab">Nghỉ ngơi</button>
            <button className="filter-tab">Mua sắm</button>
          </div>

          <div className="destinations-grid">
            {destinations.map((dest, index) => (
              <div key={index} className="destination-card">
                <div className="destination-image">
                  <img src={dest.image} alt={dest.name} />
                </div>
                <div className="destination-info">
                  <h3>{dest.name}</h3>
                  <span className="category">{dest.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Container */}
        <div className="map-container">
          <button
            className="toggle-content-btn"
            onClick={toggleContentVisibility}
            title={
              isContentVisible
                ? "Ẩn panel để xem bản đồ rộng hơn"
                : "Hiển thị panel khám phá"
            }
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                transform: isContentVisible ? "rotate(0deg)" : "rotate(180deg)",
              }}
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <MapContainer mapId="explore-map" />
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
