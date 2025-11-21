import React, { useEffect, useMemo, useState } from "react";
import LeftSidebar from "../components/LeftSidebar";
import GoogleMapsComponent from "../components/GoogleMapsComponent";
import {
  exploreService,
  type ExploreCategory,
  type ExplorePlace,
} from "../services/exploreService";
import "../styles/ExplorePage.css";

const ExplorePage: React.FC = () => {
  const [isContentVisible, setIsContentVisible] = useState<boolean>(true);
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [cityLabel, setCityLabel] = useState<string>("Thành phố Hồ Chí Minh");
  const [cityQuery, setCityQuery] = useState<string>(
    "Ho Chi Minh City, Vietnam"
  );
  const [showLocationDropdown, setShowLocationDropdown] =
    useState<boolean>(false);
  const [recentLocations, setRecentLocations] = useState<
    Array<{ label: string; lat: number; lng: number }>
  >(() => {
    try {
      const raw = localStorage.getItem("explore:recentLocations");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [activeCategory, setActiveCategory] = useState<string>("for_you");
  const [categories, setCategories] = useState<ExploreCategory[]>([]);
  const [items, setItems] = useState<ExplorePlace[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [sort, _setSort] = useState<
    "recent" | "rating" | "popular" | "distance"
  >("popular");
  const [minRating, _setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [source, setSource] = useState<
    "all" | "places" | "partners" | "google"
  >("all");
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(50);
  const [radiusNearby, setRadiusNearby] = useState<number>(8000);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedPlace, setSelectedPlace] = useState<ExplorePlace | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [showDetailSidebar, setShowDetailSidebar] = useState<boolean>(false);
  const detailRatingValue = selectedPlace
    ? getRatingValue(selectedPlace)
    : undefined;
  const detailRatingCount = selectedPlace
    ? getRatingCount(selectedPlace)
    : undefined;

  const [cityCenter, setCityCenter] = useState<{ lat: number; lng: number }>({
    lat: 10.7769,
    lng: 106.6951,
  }); // HCMC
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 10.7769,
    lng: 106.6951,
  });
  const [mapZoom, setMapZoom] = useState<number>(13);

  const toggleContentVisibility = () => setIsContentVisible(!isContentVisible);

  // Handle place selection and fetch details
  const handlePlaceClick = async (place: ExplorePlace) => {
    setSelectedId(place.id);
    setShowDetailSidebar(true);
    setDetailLoading(true);

    try {
      // Thử gọi API để lấy chi tiết đầy đủ
      const placeDetail = await exploreService.getById(place.id, "auto");
      setSelectedPlace(placeDetail);

      // Update map center to selected place
      const location = placeDetail.coordinates || placeDetail.location;
      if (location) {
        setMapCenter(location);
        setMapZoom(15);
      }
    } catch (error) {
      console.error("Failed to fetch place details from API:", error);
      // Nếu API thất bại, sử dụng dữ liệu từ danh sách đã có
      console.log("Using existing place data as fallback:", place);
      setSelectedPlace(place);

      // Update map center to selected place
      const location = place.coordinates || place.location;
      if (location) {
        setMapCenter(location);
        setMapZoom(15);
      }
    } finally {
      setDetailLoading(false);
    }
  };

  // Close detail sidebar
  const closeDetailSidebar = () => {
    setShowDetailSidebar(false);
    setSelectedId("");
    setSelectedPlace(null);
  };

  // Fallback helper to always derive a human-readable place name
  const getPlaceName = (p: any): string => {
    return (
      p?.title || // BE format mới
      p?.name || // Fallback
      p?.displayName?.text ||
      p?.displayName ||
      p?.structuredFormatting?.mainText ||
      p?.vicinity ||
      p?.address ||
      "Unknown place"
    );
  };

  function getRatingValue(p?: ExplorePlace | null): number | undefined {
    if (!p) return undefined;
    if (typeof p.ratingAverage === "number") return p.ratingAverage;
    const rating = p.rating as
      | number
      | { average?: number; count?: number }
      | undefined;
    if (typeof rating === "number") return rating;
    if (rating && typeof rating === "object") {
      return rating.average;
    }
    return undefined;
  }

  function getRatingCount(p?: ExplorePlace | null): number | undefined {
    if (!p) return undefined;
    const rating = p.rating as
      | { average?: number; count?: number }
      | number
      | undefined;
    if (
      rating &&
      typeof rating === "object" &&
      typeof rating.count === "number"
    ) {
      return rating.count;
    }
    if (typeof p.ratingCount === "number") return p.ratingCount;
    if (typeof p.userRatingsTotal === "number") return p.userRatingsTotal;
    return undefined;
  }

  // Debounce search query
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch categories on mount and when city changes
  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const cats = await exploreService.getCategories({ city: cityQuery });
        if (!isMounted) return;
        // Prepend default tabs theo yêu cầu BE
        const preset: ExploreCategory[] = [
          { key: "for_you", name: "For you" },
          { key: "things_to_do", name: "Things to do" },
          { key: "restaurant", name: "Restaurant" },
          { key: "stay", name: "Stay" },
          { key: "cafe", name: "Cafe" },
        ];
        const merged = [...preset, ...cats];
        setCategories(merged);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        if (!isMounted) return;
        // fallback minimal tabs if backend categories not available
        setCategories([
          { key: "for_you", name: "For you" },
          { key: "things_to_do", name: "Things to do" },
          { key: "restaurant", name: "Restaurant" },
          { key: "stay", name: "Stay" },
          { key: "cafe", name: "Cafe" },
        ]);
      }
    };
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, [cityQuery]);

  // Fetch list whenever filters change
  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        let res: any;
        const wantDistance = sort === "distance";
        const wantGeo =
          wantDistance ||
          (typeof maxDistanceKm === "number" && maxDistanceKm > 0);

        // Map category keys to API category values
        const getApiCategory = (categoryKey: string): string | undefined => {
          const categoryMap: Record<string, string | undefined> = {
            for_you: undefined, // Tổng hợp tất cả
            things_to_do: "attraction", // Những mục được yêu thích và thu hút
            restaurant: "restaurant", // Nơi ăn uống
            stay: "hotel", // Khách sạn, nhà trọ hoặc nơi ở
            cafe: "cafe", // Quán nước
          };
          return categoryMap[categoryKey];
        };

        const apiCategory = getApiCategory(activeCategory);

        if (activeCategory === "for_you") {
          // For you: Tổng hợp tất cả địa điểm (không filter category)
          res = await exploreService.list({
            q: debouncedQuery || undefined,
            city: cityQuery,
            sort: sort,
            minRating: minRating > 0 ? minRating : undefined,
            source: source !== "all" ? source : undefined,
            lat: wantGeo ? cityCenter.lat : undefined,
            lng: wantGeo ? cityCenter.lng : undefined,
            maxDistance: wantGeo ? maxDistanceKm : undefined,
            page: 1,
            limit: 24,
          });
        } else {
          // Các category khác: sử dụng API /api/explore với category cụ thể
          res = await exploreService.list({
            q: debouncedQuery || undefined,
            category: apiCategory,
            city: cityQuery,
            sort: sort,
            minRating: minRating > 0 ? minRating : undefined,
            source: source !== "all" ? source : undefined,
            lat: wantGeo ? cityCenter.lat : undefined,
            lng: wantGeo ? cityCenter.lng : undefined,
            maxDistance: wantGeo ? maxDistanceKm : undefined,
            page: 1,
            limit: 24,
          });
        }
        if (!isMounted) return;
        setItems(res.items || []);
        setPage(res.page || 1);
        setTotalPages(res.totalPages || 1);
        // Reset selection when filter changes
        setSelectedId("");
        setMapCenter(cityCenter);
        setMapZoom(13);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || "Không thể tải dữ liệu khám phá");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [
    activeCategory,
    debouncedQuery,
    cityCenter,
    sort,
    minRating,
    cityQuery,
    source,
    maxDistanceKm,
    radiusNearby,
  ]);

  const markers = useMemo(
    () =>
      (items || [])
        .filter((p) => {
          const location = p?.coordinates || p?.location;
          return location && isFinite(location.lat) && isFinite(location.lng);
        })
        .map((p) => {
          const location = (p?.coordinates || p?.location)!;
          return {
            id: p.id,
            lat: location.lat,
            lng: location.lng,
            title: getPlaceName(p),
            description: p.address || p.description,
            type: (() => {
              // Map category to marker type
              if (
                p.category === "restaurant" ||
                (p.types || []).includes("restaurant")
              ) {
                return "restaurant";
              } else if (
                p.category === "hotel" ||
                (p.types || []).includes("lodging")
              ) {
                return "hotel";
              } else if (
                p.category === "cafe" ||
                (p.types || []).includes("cafe")
              ) {
                return "restaurant"; // Use restaurant icon for cafe
              } else if (
                p.category === "attraction" ||
                (p.types || []).includes("tourist_attraction")
              ) {
                return "attraction";
              } else {
                return "attraction"; // Default
              }
            })(),
          };
        }),
    [items]
  );

  const handleLoadMore = async () => {
    if (loading) return;
    const next = page + 1;
    if (next > totalPages) return;
    setLoading(true);
    try {
      let res: any;
      const wantDistance = sort === "distance";
      const wantGeo =
        wantDistance ||
        (typeof maxDistanceKm === "number" && maxDistanceKm > 0);

      // Map category keys to API category values (same logic as above)
      const getApiCategory = (categoryKey: string): string | undefined => {
        const categoryMap: Record<string, string | undefined> = {
          for_you: undefined, // Tổng hợp tất cả
          things_to_do: "attraction", // Những mục được yêu thích và thu hút
          restaurant: "restaurant", // Nơi ăn uống
          stay: "hotel", // Khách sạn, nhà trọ hoặc nơi ở
          cafe: "cafe", // Quán nước
        };
        return categoryMap[categoryKey];
      };

      const apiCategory = getApiCategory(activeCategory);

      if (activeCategory === "for_you") {
        // For you: Tổng hợp tất cả địa điểm (không filter category)
        res = await exploreService.list({
          q: debouncedQuery || undefined,
          city: cityQuery,
          sort: sort,
          minRating: minRating > 0 ? minRating : undefined,
          source: source !== "all" ? source : undefined,
          lat: wantGeo ? cityCenter.lat : undefined,
          lng: wantGeo ? cityCenter.lng : undefined,
          maxDistance: wantGeo ? maxDistanceKm : undefined,
          page: next,
          limit: 24,
        });
      } else {
        // Các category khác: sử dụng API /api/explore với category cụ thể
        res = await exploreService.list({
          q: debouncedQuery || undefined,
          category: apiCategory,
          city: cityQuery,
          sort: sort,
          minRating: minRating > 0 ? minRating : undefined,
          source: source !== "all" ? source : undefined,
          lat: wantGeo ? cityCenter.lat : undefined,
          lng: wantGeo ? cityCenter.lng : undefined,
          maxDistance: wantGeo ? maxDistanceKm : undefined,
          page: next,
          limit: 24,
        });
      }
      setItems((prev) => [...prev, ...(res.items || [])]);
      setPage(res.page || next);
      setTotalPages(res.totalPages || totalPages);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-page explore-page">
      <div className="chat-container">
        {/* Left Sidebar Navigation */}
        <LeftSidebar activeItem="explore" />

        {/* Main two-column area */}
        <div className="explore-main">
          {/* Explore Content */}
          <div
            className={`explore-content ${!isContentVisible ? "hidden" : ""}`}
          >
            <div className="explore-header sticky">
              {/* City selector - like Mindtrip */}
              <div className="city-selector">
                <h1
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    margin: 0,
                  }}
                >
                  {cityLabel}
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>▼</span>
                </h1>
                {showLocationDropdown && (
                  <div className="location-dropdown">
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              const { latitude, longitude } = pos.coords as any;
                              setCityCenter({ lat: latitude, lng: longitude });
                              setMapCenter({ lat: latitude, lng: longitude });
                              setMapZoom(13);
                              setCityLabel("Vị trí hiện tại");
                              setCityQuery("Vị trí hiện tại");
                              setActiveCategory("for_you");
                              const next = [
                                {
                                  label: "Vị trí hiện tại",
                                  lat: latitude,
                                  lng: longitude,
                                },
                                ...recentLocations,
                              ].slice(0, 5);
                              setRecentLocations(next);
                              localStorage.setItem(
                                "explore:recentLocations",
                                JSON.stringify(next)
                              );
                              setShowLocationDropdown(false);
                            },
                            () => setShowLocationDropdown(false)
                          );
                        } else {
                          setShowLocationDropdown(false);
                        }
                      }}
                    >
                      Sử dụng vị trí hiện tại
                    </button>
                    {recentLocations.length > 0 && (
                      <div className="dropdown-section">
                        <div className="dropdown-title">Gần đây</div>
                        {recentLocations.map((loc) => (
                          <button
                            key={`${loc.label}-${loc.lat}`}
                            className="dropdown-item"
                            onClick={() => {
                              setCityCenter({ lat: loc.lat, lng: loc.lng });
                              setMapCenter({ lat: loc.lat, lng: loc.lng });
                              setMapZoom(13);
                              setCityLabel(loc.label);
                              setCityQuery(loc.label);
                              setShowLocationDropdown(false);
                            }}
                          >
                            {loc.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Search bar - like Mindtrip */}
              <div className="search-section">
                <div className="search-input-container">
                  <span className="search-icon">🔎</span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setDebouncedQuery(query.trim());
                      }
                    }}
                  />
                </div>
                <button
                  className="filters-btn"
                  onClick={() => setShowFilters(true)}
                >
                  <span className="filter-icon">⚙️</span>
                  Filters
                </button>
              </div>
            </div>

            {/* Category tabs - like Mindtrip */}
            <div className="category-tabs">
              {categories.map((c) => (
                <button
                  key={c.key}
                  className={`category-tab ${
                    activeCategory === c.key ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveCategory(c.key);
                    // Reset search when switching categories
                    setQuery("");
                    setDebouncedQuery("");
                  }}
                  title={c.name}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {error ? (
              <div style={{ padding: 16, color: "#e11d48" }}>{error}</div>
            ) : null}

            {/* Content section - Mindtrip-like grid */}
            <div className="content-section">
              {activeCategory !== "for_you" && (
                <h2 className="section-title">
                  {categories.find((c) => c.key === activeCategory)?.name ||
                    "Things to do"}
                </h2>
              )}

              {loading && items.length === 0 ? (
                <div className="loading-state">Đang tải...</div>
              ) : null}

              {!loading && items.length === 0 ? (
                <div className="empty-state">
                  Không tìm thấy địa điểm phù hợp.
                </div>
              ) : null}

              {/* Grid 3 columns like Mindtrip */}
              <div className="destinations-grid-3">
                {items.map((place) => {
                  const ratingValue = getRatingValue(place);
                  const ratingCount = getRatingCount(place);
                  return (
                    <div
                      key={place.id}
                      className={`destination-card-v2 ${
                        selectedId === place.id ? "active" : ""
                      }`}
                      onClick={() => handlePlaceClick(place)}
                    >
                      <div className="card-image-container">
                        <img
                          src={
                            place.photoUrl ||
                            (place as any).images?.[0] ||
                            "https://source.unsplash.com/random/800x600?travel"
                          }
                          alt={place.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop";
                          }}
                        />
                        <div className="card-overlay">
                          <button className="heart-btn">♡</button>
                          <button className="add-btn">＋</button>
                        </div>
                        <div className="image-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                      <div className="card-content">
                        <h3 className="card-title">{getPlaceName(place)}</h3>
                        <div className="meta-row">
                          <span className="meta-item">
                            🏷 {place.category || place.types?.[0] || "Place"}
                          </span>
                          {typeof ratingValue === "number" ? (
                            <span className="meta-item">
                              ★ {ratingValue.toFixed(1)}
                              {typeof ratingCount === "number"
                                ? ` (${Math.floor(ratingCount / 1000)}k)`
                                : ""}
                            </span>
                          ) : null}
                        </div>
                        <div className="meta-row light">
                          <span className="meta-item">
                            📍 {place.address || cityLabel}
                          </span>
                          {typeof place.distance === "number" ? (
                            <span className="meta-item">
                              📏 {(place.distance / 1000).toFixed(1)} km
                            </span>
                          ) : null}
                        </div>
                        <div className="mentions">
                          Mentioned by {Math.floor(Math.random() * 15) + 5}{" "}
                          people
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                  transform: isContentVisible
                    ? "rotate(0deg)"
                    : "rotate(180deg)",
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
            <GoogleMapsComponent
              mapId="explore-map"
              className="explore-map"
              center={mapCenter}
              zoom={mapZoom}
              markers={markers}
            />
            {/* Load more button overlay at bottom-left on large screens */}
            {page < totalPages && (
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  left: 12,
                  zIndex: 2,
                }}
              >
                <button
                  onClick={handleLoadMore}
                  className="btn-register"
                  style={{ padding: "8px 14px", borderRadius: 12 }}
                >
                  Tải thêm
                </button>
              </div>
            )}
          </div>
          {showFilters && (
            <div className="qp-modal" onClick={() => setShowFilters(false)}>
              <div
                className="qp-modal-inner"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="qp-modal-header">
                  Bộ lọc
                  <button
                    className="qp-close"
                    onClick={() => setShowFilters(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="qp-row">
                  <div style={{ fontWeight: 600 }}>Nguồn</div>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as any)}
                    className="pill-input"
                    style={{ padding: "8px 12px", borderRadius: 12 }}
                  >
                    <option value="all">Tất cả</option>
                    <option value="partners">Đối tác</option>
                    <option value="places">Places</option>
                    <option value="google">Google</option>
                  </select>
                </div>
                <div className="qp-row" style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 600 }}>Bán kính Nearby (m)</div>
                  <input
                    type="number"
                    className="pill-input"
                    value={radiusNearby}
                    onChange={(e) =>
                      setRadiusNearby(Number(e.target.value) || 8000)
                    }
                  />
                </div>
                <div className="qp-row" style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 600 }}>Khoảng cách tối đa (km)</div>
                  <input
                    type="number"
                    className="pill-input"
                    value={maxDistanceKm}
                    onChange={(e) =>
                      setMaxDistanceKm(Number(e.target.value) || 50)
                    }
                  />
                </div>
                <div className="qp-modal-actions">
                  <button
                    className="qp-modal-btn"
                    onClick={() => {
                      setShowFilters(false);
                      // Trigger reload when filters change
                      setDebouncedQuery(debouncedQuery);
                    }}
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Detail Sidebar - Mindtrip style */}
          {showDetailSidebar && (
            <div className="detail-sidebar">
              <div className="detail-sidebar-header">
                <button
                  className="close-detail-btn"
                  onClick={closeDetailSidebar}
                >
                  ✕
                </button>
              </div>

              {detailLoading ? (
                <div className="detail-loading">
                  <div className="loading-spinner"></div>
                  <p>Đang tải chi tiết...</p>
                </div>
              ) : selectedPlace ? (
                <div className="detail-content">
                  {/* Place Header */}
                  <div className="place-header">
                    <h1 className="place-title">
                      {getPlaceName(selectedPlace)}
                    </h1>
                    <div className="place-rating">
                      <span className="rating-stars">
                        ★{" "}
                        {typeof detailRatingValue === "number"
                          ? detailRatingValue.toFixed(1)
                          : "--"}
                      </span>
                      <span className="rating-count">
                        {typeof detailRatingCount === "number"
                          ? detailRatingCount.toLocaleString()
                          : "--"}{" "}
                        reviews
                      </span>
                    </div>
                    <div className="place-location">
                      📍 {selectedPlace.address || cityLabel}
                    </div>
                    <div className="place-meta">
                      <span className="place-category">
                        {selectedPlace.category ||
                          selectedPlace.types?.[0] ||
                          "Place"}
                      </span>
                      <span className="place-price">
                        {selectedPlace.priceRange ||
                          "$".repeat(selectedPlace.priceLevel || 1)}
                      </span>
                    </div>
                  </div>

                  {/* Image Gallery */}
                  <div className="place-gallery">
                    <div className="main-image">
                      <img
                        src={
                          selectedPlace.photoUrl ||
                          selectedPlace.images?.[0] ||
                          "https://source.unsplash.com/random/800x600?restaurant"
                        }
                        alt={getPlaceName(selectedPlace)}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop";
                        }}
                      />
                    </div>
                    {selectedPlace.images &&
                      selectedPlace.images.length > 1 && (
                        <div className="image-grid">
                          {selectedPlace.images
                            .slice(1, 5)
                            .map((img, index) => (
                              <div key={index} className="grid-image">
                                <img
                                  src={img}
                                  alt={`${getPlaceName(selectedPlace)} ${
                                    index + 2
                                  }`}
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src =
                                      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop";
                                  }}
                                />
                              </div>
                            ))}
                          {selectedPlace.images.length > 5 && (
                            <div className="show-all-photos">
                              <button>Show all photos</button>
                            </div>
                          )}
                        </div>
                      )}
                  </div>

                  {/* Social Mentions */}
                  <div className="place-mentions">
                    <div className="mentions-count">
                      <span className="heart-icon">♡</span>
                      <span>{Math.floor(Math.random() * 15) + 5}</span>
                    </div>
                    <div className="mentioned-by">
                      <span>
                        Mentioned by {Math.floor(Math.random() * 10) + 3} people
                      </span>
                    </div>
                  </div>

                  {/* Detail Tabs */}
                  <div className="detail-tabs">
                    <button className="tab active">Overview</button>
                    <button className="tab">Guides</button>
                    <button className="tab">Reviews</button>
                    <button className="tab">Location</button>
                  </div>

                  {/* Overview Content */}
                  <div className="overview-content">
                    <p className="place-description">
                      {selectedPlace.description ||
                        `Khám phá ${getPlaceName(
                          selectedPlace
                        )} - một địa điểm ${
                          selectedPlace.category ||
                          selectedPlace.types?.[0] ||
                          "thú vị"
                        } tại ${
                          selectedPlace.address || cityLabel
                        }. Đây là nơi lý tưởng để trải nghiệm và khám phá.`}
                    </p>

                    {/* Contact Information */}
                    {selectedPlace.contact && (
                      <div className="contact-info">
                        <h4>Contact Information</h4>
                        {selectedPlace.contact.phone && (
                          <p>📞 {selectedPlace.contact.phone}</p>
                        )}
                        {selectedPlace.contact.email && (
                          <p>✉️ {selectedPlace.contact.email}</p>
                        )}
                      </div>
                    )}

                    {/* Opening Hours */}
                    {selectedPlace.openingHours && (
                      <div className="opening-hours">
                        <h4>Giờ mở cửa</h4>
                        <p>{selectedPlace.openingHours}</p>
                      </div>
                    )}

                    {/* Source Information */}
                    <div className="source-info">
                      <h4>Thông tin nguồn</h4>
                      <p>
                        <strong>Nguồn:</strong>{" "}
                        {selectedPlace.source || "Unknown"}
                        {selectedPlace.isPartner && <span> (Đối tác)</span>}
                      </p>
                      {selectedPlace.priority && (
                        <p>
                          <strong>Độ ưu tiên:</strong> {selectedPlace.priority}
                          /10
                        </p>
                      )}
                    </div>

                    {/* Tags */}
                    {(() => {
                      const tags = Array.isArray(selectedPlace.tags)
                        ? selectedPlace.tags
                        : typeof selectedPlace.tags === "string"
                        ? selectedPlace.tags.split(",").map((tag) => tag.trim())
                        : [];
                      if (!tags.length) return null;
                      return (
                        <div className="place-tags">
                          <h4>Tags</h4>
                          <div className="tags-container">
                            {tags.map((tag, index) => (
                              <span key={index} className="tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Amenities */}
                    {(() => {
                      const amenities = Array.isArray(selectedPlace.amenities)
                        ? selectedPlace.amenities
                        : typeof selectedPlace.amenities === "string"
                        ? selectedPlace.amenities
                            .split(",")
                            .map((amenity) => amenity.trim())
                        : [];
                      if (!amenities.length) return null;
                      return (
                        <div className="place-amenities">
                          <h4>Tiện ích</h4>
                          <div className="amenities-container">
                            {amenities.map((amenity, index) => (
                              <span key={index} className="amenity">
                                ✓ {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
