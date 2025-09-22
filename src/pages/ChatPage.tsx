import React, { useState } from 'react';
import '../styles/ChatPage.css';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Tôi muốn đi du lịch thành phố Hồ Chí Minh đến Đà Lạt 3 ngày 2 đêm chơi gì ? 3 đâu? Du lịch gia đình 4 người 2 người lớn, 2 trẻ em, 1 con thú cưng, ngân sách khoảng 15 triệu'
    },
    {
      id: 2,
      type: 'bot',
      content: 'Cảm ơn bạn đã chia sẻ thông tin! Tôi sẽ tạo ra hành trình cụ của bạn. Gia đình 4 người lớn 2 trẻ em cùng một chú mèo muốn đi du lịch từ Thành phố Hồ Chí Minh đến Đà Lạt trong 3 ngày 2 đêm, với ngân sách khoảng 15 triệu đồng và thú cưng đi cùng. Hãy để tôi tạo một kế hoạch chi tiết cho chuyến đi này.'
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: 'user',
        content: inputValue
      };
      setMessages([...messages, newMessage]);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
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
          </div>

          <div className="new-chat-btn">
            <button className="btn-new-chat">New chat</button>
          </div>

          <div className="sidebar-footer">
            <div className="user-profile">
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
                <div key={message.id} className={`message ${message.type}-message`}>
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
                    <p>{message.content}</p>
                    {message.id === 2 && (
                      <div className="itinerary-section">
                        <h4>Ngày 1: Khởi hành & Khám phá trung tâm Đà Lạt</h4>
                        <p><strong>Sáng:</strong></p>
                        <p>
                          Khởi hành từ Thành phố Hồ Chí Minh đến Đà Lạt. Bạn có thể
                          nghỉ ngơi tại - Dalat Edensee Lake Resort & Spa - nơi chào
                          đón thú cưng và có không gian rộng rãi cho trẻ nhỏ vui
                          chơi. Đăng ký phòng và nghỉ ngơi sau chuyến đi dài.
                        </p>
                      </div>
                    )}
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
                  onKeyPress={handleKeyPress}
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
            <div className="map-placeholder">
              <i className="fas fa-map-marked-alt"></i>
              <h3>Bản đồ hành trình</h3>
              <p>Bản đồ tương tác sẽ hiển thị ở đây</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
