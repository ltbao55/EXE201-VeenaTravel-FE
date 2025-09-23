import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ChatPage.css";

// Declare Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Tôi muốn đi du lịch thành phố Hồ Chí Minh đến Đà Lạt 3 ngày 2 đêm chơi gì ? 3 đâu? Du lịch gia đình 4 người 2 người lớn, 2 trẻ em, 1 con thú cưng, ngân sách khoảng 15 triệu",
    },
    {
      id: 2,
      type: "bot",
      content:
        "Cảm ơn bạn đã chia sẻ thông tin! Tôi sẽ tạo ra hành trình cụ của bạn. Gia đình 4 người lớn 2 trẻ em cùng một chú mèo muốn đi du lịch từ Thành phố Hồ Chí Minh đến Đà Lạt trong 3 ngày 2 đêm, với ngân sách khoảng 15 triệu đồng và thú cưng đi cùng. Hãy để tôi tạo một kế hoạch chi tiết cho chuyến đi này.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [chatMap, setChatMap] = useState<any>(null);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: "user",
        content: inputValue,
      };
      setMessages([...messages, newMessage]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
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
            initChatMap();
          }, 100);
        };
        document.head.appendChild(leafletJS);
      } else {
        setTimeout(() => {
          initChatMap();
        }, 100);
      }
    };

    loadLeaflet();

    return () => {
      if (chatMap) {
        chatMap.remove();
      }
    };
  }, []);

  // Initialize chat map
  const initChatMap = () => {
    if (chatMap) {
      chatMap.remove();
      setChatMap(null);
    }

    const mapContainer = document.getElementById("chat-map");
    if (!mapContainer || mapContainer.offsetWidth === 0 || !window.L) {
      setTimeout(() => initChatMap(), 100);
      return;
    }

    // Center on Ho Chi Minh City
    const map = window.L.map("chat-map").setView([10.7769, 106.6951], 13);

    // Add tile layer
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    setChatMap(map);

    // Force map to recalculate size
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, 100);

    // Add sample markers
    addChatMapMarkers(map);
  };

  // Add markers to chat map
  const addChatMapMarkers = (map: any) => {
    const destinations = [
      {
        name: "Nhà thờ Đức Bà Sài Gòn",
        lat: 10.7797,
        lng: 106.699,
        description: "Biểu tượng kiến trúc Gothic nổi tiếng của Sài Gòn",
      },
      {
        name: "Chợ Bến Thành",
        lat: 10.772,
        lng: 106.698,
        description: "Chợ truyền thống sầm uất với đủ loại hàng hóa",
      },
      {
        name: "Dinh Độc Lập",
        lat: 10.777,
        lng: 106.6956,
        description: "Cung điện lịch sử với kiến trúc độc đáo",
      },
      {
        name: "Đà Lạt",
        lat: 11.9404,
        lng: 108.4583,
        description: "Thành phố ngàn hoa với khí hậu mát mẻ",
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

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Left Sidebar Navigation */}
        <div className="left-sidebar">
          <div className="sidebar-header">
            <div className="logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="#FF4D85"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="#FF4D85"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="#FF4D85"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              <span>veena travel.</span>
            </div>
            <button className="back-btn" onClick={() => navigate("/")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 12H5M12 19L5 12L12 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="sidebar-menu">
            <div className="menu-item active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Chats</span>
              <span className="badge">1</span>
            </div>

            <div className="menu-item">
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
              <span>Khám phá</span>
            </div>

            <div className="menu-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 3C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 3C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.041 1.55 8.5C1.5487 9.959 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.9379 22.4518 9.2225 22.45 8.5C22.4518 7.7775 22.3095 7.0621 22.0329 6.3947C21.7563 5.7272 21.351 5.1208 20.84 4.61Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Saved</span>
            </div>

            <div className="menu-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  ry="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="16"
                  y1="2"
                  x2="16"
                  y2="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="8"
                  y1="2"
                  x2="8"
                  y2="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="3"
                  y1="10"
                  x2="21"
                  y2="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>Trips</span>
            </div>

            <div className="menu-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Updates</span>
            </div>

            <div className="menu-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2569 9.77251 19.9859C9.5799 19.7148 9.31074 19.5063 9 19.38C8.69838 19.2469 8.36381 19.2072 8.03941 19.266C7.71502 19.3248 7.41568 19.4795 7.18 19.71L7.12 19.77C6.93425 19.956 6.71368 20.1035 6.47088 20.2041C6.22808 20.3048 5.96783 20.3566 5.705 20.3566C5.44217 20.3566 5.18192 20.3048 4.93912 20.2041C4.69632 20.1035 4.47575 19.956 4.29 19.77C4.10405 19.5843 3.95653 19.3637 3.85588 19.1209C3.75523 18.8781 3.70343 18.6178 3.70343 18.355C3.70343 18.0922 3.75523 17.8319 3.85588 17.5891C3.95653 17.3463 4.10405 17.1257 4.29 16.94L4.35 16.88C4.58054 16.6443 4.73519 16.345 4.794 16.0206C4.85282 15.6962 4.81312 15.3616 4.68 15.06C4.55324 14.7642 4.34276 14.512 4.07447 14.3343C3.80618 14.1566 3.49179 14.0613 3.17 14.06H3C2.46957 14.06 1.96086 13.8493 1.58579 13.4742C1.21071 13.0991 1 12.5904 1 12.06C1 11.5296 1.21071 11.0209 1.58579 10.6458C1.96086 10.2707 2.46957 10.06 3 10.06H3.09C3.42099 10.0523 3.742 9.94512 4.01309 9.75251C4.28417 9.5599 4.49268 9.29074 4.62 8.98C4.75312 8.67838 4.79282 8.34381 4.734 8.01941C4.67519 7.69502 4.52054 7.39568 4.29 7.16L4.23 7.1C4.04405 6.91425 3.89653 6.69368 3.79588 6.45088C3.69523 6.20808 3.64343 5.94783 3.64343 5.685C3.64343 5.42217 3.69523 5.16192 3.79588 4.91912C3.89653 4.67632 4.04405 4.45575 4.23 4.27C4.41575 4.08405 4.63632 3.93653 4.87912 3.83588C5.12192 3.73523 5.38217 3.68343 5.645 3.68343C5.90783 3.68343 6.16808 3.73523 6.41088 3.83588C6.65368 3.93653 6.87425 4.08405 7.06 4.27L7.12 4.33C7.35568 4.56054 7.65502 4.71519 7.97941 4.774C8.30381 4.83282 8.63838 4.79312 8.94 4.66H9C9.29577 4.53324 9.54802 4.32276 9.72569 4.05447C9.90337 3.78618 9.99872 3.47179 10 3.15V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Inspiration</span>
            </div>

            <div className="menu-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                  ry="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="12"
                  y1="8"
                  x2="12"
                  y2="16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="8"
                  y1="12"
                  x2="16"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>Create</span>
            </div>
          </div>

          <div className="new-chat-btn">
            <button className="btn-new-chat">New chat</button>
          </div>

          <div className="sidebar-footer">
            <div
              className="user-profile"
              onClick={() => navigate("/profile")}
              style={{ cursor: "pointer" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="7"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <span>Traveler</span>
              <div className="profile-tooltip">View profile</div>
            </div>
            <div className="footer-links">
              <a href="#">Company</a>
              <a href="#">Contact</a>
              <a href="#">Help</a>
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
            </div>
            <div className="copyright">© 2025 Veena Travel, Inc.</div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="chat-sidebar">
          <div className="chat-content">
            <div className="chat-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.type}-message`}
                >
                  <div className="message-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#FF4D85" />
                      <path
                        d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="message-content">
                    <>
                      <p>{message.content}</p>
                      {message.id === 2 && (
                        <>
                          <div className="itinerary-section">
                            <h4>
                              Ngày 1: Khởi hành & Khám phá trung tâm Đà Lạt
                            </h4>
                            <p>
                              <strong>Sáng:</strong>
                            </p>
                            <p>
                              Khởi hành từ Thành phố Hồ Chí Minh đến Đà Lạt. Bạn
                              có thể nghỉ ngơi tại - Dalat Edensee Lake Resort &
                              Spa - nơi chào đón thú cưng và có không gian rộng
                              rãi cho trẻ nhỏ vui chơi. Đăng ký phòng và nghỉ
                              ngơi sau chuyến đi dài.
                            </p>

                            <p>
                              <strong>Chiều:</strong>
                            </p>
                            <p>
                              Đông với thức ăn Việt phong phú. Chiều, cả nhà đạo
                              chơi tại Vườt hoa Thành Phố Đà Lạt, nơi có nhiều
                              góc đẹp để chụp hình và khu vui chơi cho trẻ em.
                              Tối đến, trường thức dạo san Đà Lạt tại 3 Lầu Đà
                              Lạt từ 5-6:00.
                            </p>
                          </div>

                          <div className="itinerary-section">
                            <h4>
                              Ngày 2: Khám phá thiên nhiên & âm thực địa phương
                            </h4>
                            <p>
                              <strong>Sáng:</strong>
                            </p>
                            <p>
                              Tại 4 Hồ Tuyền Lâm - bạn có thể mang theo thú
                              cưng, đạo quanh bờ hồ hoặc thuê vịt hoạc picnic
                              tại bãi cỏ. Buổi trưa thưởng thức món ăn địa
                              phương tại 3 Cafe F-cảnh Đồng Hoa tại view cực
                              đẹp. Chiều, tới Vườn Dâu Tây Đà Lạt - nơi có Buổi
                              tối, ngắm cảnh về thành sem và có thể gọi thêm ăn
                              nhẹ tại phòng.
                            </p>
                          </div>

                          <div className="itinerary-section">
                            <h4>Ngày 3: Tham quan & mua sắm trước khi về</h4>
                            <p>
                              <strong>
                                Sáng đầu sớm, gia đình ghé Chợ Đà Lạt thưởng
                                thức ẩm thực sáng và chọn mua quà cho bạn bè,
                                người thân. Sau đó, ghé qua Trường Lâm Viên -
                                nơi có biểu tượng hoa đà lạt.
                              </strong>
                            </p>
                          </div>
                        </>
                      )}
                    </>
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input-container">
              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Hỏi gì đó..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="send-btn" onClick={handleSendMessage}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22 2L11 13M22 2L15 22L11 13M22 2L2 11L11 13"
                      stroke="#FF4D85"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="map-container">
          <div id="chat-map" className="map-view">
            {/* Interactive map will be rendered here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
