import React from "react";

const ChatHistorySidebar: React.FC = () => {
  return (
    <div className="chat-history-view">
      <div className="chat-sidebar-header">
        <div className="chat-sidebar-header-top">
          <h2>
            Chats <span className="badge">1</span>
          </h2>
          <button className="btn-new-chat-sidebar">New chat</button>
        </div>
        <div className="chat-tabs">
          <div className="chat-tab active">All</div>
          <div className="chat-tab">Trips</div>
        </div>
      </div>
      <div className="chat-search-container">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 21L16.65 16.65"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <input type="text" placeholder="Search chat titles..." />
      </div>
      <div className="chat-history-list">
        <div className="chat-history-item active">
          <div className="chat-item-title">New chat</div>
          <div className="chat-item-snippet">
            Bắt đầu cuộc trò chuyện mới...
          </div>
        </div>
        {/* Add more chat history items here */}
      </div>
    </div>
  );
};

export default ChatHistorySidebar;
