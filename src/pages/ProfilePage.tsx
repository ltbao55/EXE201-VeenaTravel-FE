import React, { useState, useEffect } from "react";
import LeftSidebar from "../components/LeftSidebar";
import MapContainer from "../components/MapContainer";
import Profile from "../components/Profile";
import "../styles/ChatPage.css";

// Declare Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

const ProfilePage: React.FC = () => {
  const [profileMap, setProfileMap] = useState<any>(null);

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
            initProfileMap();
          }, 100);
        };
        document.head.appendChild(leafletJS);
      } else {
        setTimeout(() => {
          initProfileMap();
        }, 100);
      }
    };

    loadLeaflet();

    return () => {
      if (profileMap) {
        profileMap.remove();
      }
    };
  }, []);

  // Initialize profile map
  const initProfileMap = () => {
    if (profileMap) {
      profileMap.remove();
      setProfileMap(null);
    }

    const mapContainer = document.getElementById("profile-map");
    if (!mapContainer || mapContainer.offsetWidth === 0 || !window.L) {
      setTimeout(() => initProfileMap(), 100);
      return;
    }

    // Center on Ho Chi Minh City
    const map = window.L.map("profile-map").setView([10.7769, 106.6951], 13);

    // Add tile layer
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    setProfileMap(map);

    // Force map to recalculate size
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, 100);

    // Add sample markers for user's favorite places
    addProfileMapMarkers(map);
  };

  // Add markers to profile map
  const addProfileMapMarkers = (map: any) => {
    const favoriteDestinations = [
      {
        name: "Nhà thờ Đức Bà Sài Gòn",
        lat: 10.7797,
        lng: 106.699,
        description: "Địa điểm yêu thích - Kiến trúc Gothic tuyệt đẹp",
      },
      {
        name: "Chợ Bến Thành",
        lat: 10.772,
        lng: 106.698,
        description: "Đã ghé thăm - Trải nghiệm mua sắm tuyệt vời",
      },
      {
        name: "Đà Lạt",
        lat: 11.9404,
        lng: 108.4583,
        description: "Muốn đến - Thành phố ngàn hoa mộng mơ",
      },
    ];

    favoriteDestinations.forEach((dest) => {
      window.L.marker([dest.lat, dest.lng]).addTo(map).bindPopup(`
          <div style="text-align: center; min-width: 200px;">
            <h4 style="margin: 0 0 8px 0; color: #FF4D85; font-size: 16px;">${dest.name}</h4>
            <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.4;">${dest.description}</p>
          </div>
        `);
    });
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Left Sidebar Navigation */}
        <LeftSidebar activeItem="profile" />

        {/* Profile Section - replaces chat-sidebar */}
        <Profile />

        {/* Map Container - Hidden on profile page */}
        <div className="map-container" style={{ display: "none" }}>
          <MapContainer mapId="profile-map" />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
