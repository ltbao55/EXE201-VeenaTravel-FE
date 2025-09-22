import React, { useState, useEffect } from "react";
import Navigation from "../components/common/Navigation";
import "../styles/ExplorePage.css";

interface Place {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  lat: number;
  lng: number;
}

const ExplorePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [places] = useState<Place[]>([
    {
      id: 1,
      name: "Bưu điện Thành Phố",
      description: "Kiến trúc Pháp cổ điển",
      category: "culture",
      image:
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=300&h=200&fit=crop",
      lat: 10.7769,
      lng: 106.7009,
    },
    {
      id: 2,
      name: "Bitexco",
      description: "Tòa nhà cao nhất TPHCM",
      category: "shopping",
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop",
      lat: 10.7829,
      lng: 106.6989,
    },
    {
      id: 3,
      name: "Nhà hàng Ăn Đô",
      description: "Banana Leaf Sài Gòn",
      category: "restaurant",
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=200&fit=crop",
      lat: 10.7756,
      lng: 106.7019,
    },
    {
      id: 4,
      name: "Đài quan sát Sài Gòn",
      description: "View toàn cảnh thành phố",
      category: "culture",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
      lat: 10.7784,
      lng: 106.6958,
    },
    {
      id: 5,
      name: "Bảo tàng Sài Gòn",
      description: "Lịch sử và văn hóa",
      category: "culture",
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop",
      lat: 10.7723,
      lng: 106.6989,
    },
    {
      id: 6,
      name: "Bến Thành Market",
      description: "Chợ truyền thống",
      category: "shopping",
      image:
        "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=300&h=200&fit=crop",
      lat: 10.7699,
      lng: 106.6937,
    },
  ]);

  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>(places);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const categories = [
    { id: "all", name: "Quan điểm", icon: "🗺️" },
    { id: "restaurant", name: "Nhà hàng", icon: "🍽️" },
    { id: "hotel", name: "Khách sạn", icon: "🏨" },
    { id: "shopping", name: "Mua sắm", icon: "🛍️" },
    { id: "culture", name: "Văn hóa", icon: "🏛️" },
  ];

  useEffect(() => {
    let filtered = places;

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter((place) => place.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (place) =>
          place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          place.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPlaces(filtered);
  }, [activeCategory, searchQuery, places]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
  };

  return (
    <div className="explore-container">
      <Navigation />

      <div className="explore-content">
        {/* Sidebar */}
        <div className="explore-sidebar">
          <div className="location-header">
            <h2>Thành phố Hồ Chí Minh</h2>
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Tìm kiếm địa điểm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`filter-btn ${
                  activeCategory === category.id ? "active" : ""
                }`}
                onClick={() => handleCategoryChange(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          <div className="places-grid">
            {filteredPlaces.map((place) => (
              <div
                key={place.id}
                className={`place-card ${
                  selectedPlace?.id === place.id ? "selected" : ""
                }`}
                onClick={() => handlePlaceClick(place)}
              >
                <img src={place.image} alt={place.name} />
                <div className="place-info">
                  <h3>{place.name}</h3>
                  <p>{place.description}</p>
                  <div className="place-category">
                    <span className={`category-badge ${place.category}`}>
                      {
                        categories.find((cat) => cat.id === place.category)
                          ?.icon
                      }
                      {
                        categories.find((cat) => cat.id === place.category)
                          ?.name
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPlaces.length === 0 && (
            <div className="no-results">
              <i className="fas fa-search"></i>
              <p>Không tìm thấy địa điểm nào phù hợp</p>
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="map-container">
          <div id="explore-map" className="map-view">
            <div className="map-placeholder">
              <i className="fas fa-map-marked-alt"></i>
              <h3>Bản đồ khám phá</h3>
              <p>Bản đồ tương tác sẽ hiển thị ở đây</p>
              {selectedPlace && (
                <div className="selected-place-info">
                  <h4>Đã chọn: {selectedPlace.name}</h4>
                  <p>{selectedPlace.description}</p>
                  <p>
                    Tọa độ: {selectedPlace.lat}, {selectedPlace.lng}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Map Controls */}
          <div className="map-controls">
            <button className="map-control-btn" title="Zoom in">
              <i className="fas fa-plus"></i>
            </button>
            <button className="map-control-btn" title="Zoom out">
              <i className="fas fa-minus"></i>
            </button>
            <button className="map-control-btn" title="My location">
              <i className="fas fa-crosshairs"></i>
            </button>
            <button className="map-control-btn" title="Fullscreen">
              <i className="fas fa-expand"></i>
            </button>
          </div>

          {/* Place Details Panel */}
          {selectedPlace && (
            <div className="place-details-panel">
              <div className="panel-header">
                <h3>{selectedPlace.name}</h3>
                <button
                  className="close-panel"
                  onClick={() => setSelectedPlace(null)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="panel-content">
                <img src={selectedPlace.image} alt={selectedPlace.name} />
                <p>{selectedPlace.description}</p>
                <div className="place-actions">
                  <button className="action-btn primary">
                    <i className="fas fa-directions"></i>
                    Chỉ đường
                  </button>
                  <button className="action-btn secondary">
                    <i className="fas fa-heart"></i>
                    Lưu
                  </button>
                  <button className="action-btn secondary">
                    <i className="fas fa-share"></i>
                    Chia sẻ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
