import React, { useState } from "react";
import LeftSidebar from "../components/LeftSidebar";
import GoogleMapContainer from "../components/GoogleMapContainer";
import "../styles/ExplorePage.css";

const ExplorePage: React.FC = () => {
  const [isContentVisible, setIsContentVisible] = useState<boolean>(true);

  // Handle content visibility toggle
  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);
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
          <GoogleMapContainer mapId="explore-map" className="explore-map" />
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
