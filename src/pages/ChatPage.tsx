import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarFooter from "../components/SidebarFooter";
import LeftSidebar from "../components/LeftSidebar";
import MapContainer from "../components/MapContainer";
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
        <LeftSidebar activeItem="chats" />

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
        <MapContainer mapId="chat-map" />
      </div>
    </div>
  );
};

export default ChatPage;
