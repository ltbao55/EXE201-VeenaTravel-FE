import React, { useState } from "react";
import LeftSidebar from "../components/LeftSidebar";
import ChatHistorySidebar from "../components/ChatHistorySidebar";
import ChatMap from "../components/ChatMap";
import "../styles/ChatPage.css";

const ChatPage: React.FC = () => {
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
  const [showChatHistory, setShowChatHistory] = useState(false);

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

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Left Sidebar Navigation */}
        <LeftSidebar activeItem="chats" />

        {/* Main Chat Content */}
        <div className="chat-main-content">
          {/* Chat Header with Toggle Button */}
          <div className="chat-header">
            <button
              className="chat-history-toggle"
              onClick={() => setShowChatHistory(!showChatHistory)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 12h18M3 6h18M3 18h18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              {showChatHistory ? "Quay lại chat" : "Lịch sử chat"}
            </button>
            <button className="btn-new-chat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              New chat
            </button>
          </div>

          {/* Conditional Content: Chat History or Chat Messages */}
          {showChatHistory ? (
            <ChatHistorySidebar />
          ) : (
            <div className="chat-content">
              <div className="chat-messages">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.type}-message`}
                  >
                    <div className="message-avatar">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
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
                                Khởi hành từ Thành phố Hồ Chí Minh đến Đà Lạt.
                                Bạn có thể nghỉ ngơi tại - Dalat Edensee Lake
                                Resort & Spa - nơi chào đón thú cưng và có không
                                gian rộng rãi cho trẻ nhỏ vui chơi. Đăng ký
                                phòng và nghỉ ngơi sau chuyến đi dài.
                              </p>

                              <p>
                                <strong>Chiều:</strong>
                              </p>
                              <p>
                                Đông với thức ăn Việt phong phú. Chiều, cả nhà
                                đạo chơi tại Vườt hoa Thành Phố Đà Lạt, nơi có
                                nhiều góc đẹp để chụp hình và khu vui chơi cho
                                trẻ em. Tối đến, trường thức dạo san Đà Lạt tại
                                3 Lầu Đà Lạt từ 5-6:00.
                              </p>
                            </div>

                            <div className="itinerary-section">
                              <h4>
                                Ngày 2: Khám phá thiên nhiên & âm thực địa
                                phương
                              </h4>
                              <p>
                                <strong>Sáng:</strong>
                              </p>
                              <p>
                                Tại 4 Hồ Tuyền Lâm - bạn có thể mang theo thú
                                cưng, đạo quanh bờ hồ hoặc thuê vịt hoạc picnic
                                tại bãi cỏ. Buổi trưa thưởng thức món ăn địa
                                phương tại 3 Cafe F-cảnh Đồng Hoa tại view cực
                                đẹp. Chiều, tới Vườn Dâu Tây Đà Lạt - nơi có
                                Buổi tối, ngắm cảnh về thành sem và có thể gọi
                                thêm ăn nhẹ tại phòng.
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
          )}
        </div>

        {/* Map Container */}
        <ChatMap className="chat-map" />
      </div>
    </div>
  );
};

export default ChatPage;
