import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import ChatService, { type ChatSession } from "../services/chatService";

interface ChatHistorySidebarProps {
  onSelectSession?: (sessionId: string) => void;
  selectedSessionId?: string;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  onSelectSession,
  selectedSessionId,
}) => {
  const { user, isAuthenticated } = useAuth();
  const currentUserId = React.useMemo(() => {
    const anyUser = user as unknown as Record<string, unknown>;
    return (anyUser?.id ?? anyUser?._id ?? anyUser?.uid) as string | undefined;
  }, [user]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "trips">("all");

  const loadChatSessions = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      console.log(
        "[ChatHistorySidebar] Loading chat sessions for user:",
        currentUserId
      );
      const data = await ChatService.getChatSessions(currentUserId);
      setSessions(data.sessions || []);
      console.log(
        "[ChatHistorySidebar] Loaded sessions:",
        data.sessions?.length || 0
      );
    } catch (error) {
      console.error(
        "[ChatHistorySidebar] Failed to load chat sessions:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentUserId]);

  useEffect(() => {
    // Add a small delay to avoid race condition with ChatPage
    const timer = setTimeout(() => {
      loadChatSessions();
    }, 100);

    return () => clearTimeout(timer);
  }, [loadChatSessions]);

  const handleDeleteSession = async (
    sessionId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc muốn xóa cuộc trò chuyện này?")) return;

    try {
      await ChatService.deleteChatSession(sessionId, currentUserId);
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      console.log("[ChatHistorySidebar] Deleted session:", sessionId);
    } catch (error) {
      console.error("[ChatHistorySidebar] Failed to delete session:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Hôm nay";
    if (diffDays === 2) return "Hôm qua";
    if (diffDays <= 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "all" || (activeTab === "trips" && session.generatedTrip);
    return matchesSearch && matchesTab;
  });

  if (!isAuthenticated) {
    return (
      <div className="chat-history-view">
        <div className="chat-sidebar-header">
          <h2>Lịch sử chat</h2>
        </div>
        <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
          Vui lòng đăng nhập để xem lịch sử chat
        </div>
      </div>
    );
  }

  return (
    <div className="chat-history-view">
      <div className="chat-sidebar-header">
        <div className="chat-sidebar-header-top">
          <h2>
            Chats <span className="badge">{sessions.length}</span>
          </h2>
        </div>
        <div className="chat-tabs">
          <div
            className={`chat-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All
          </div>
          <div
            className={`chat-tab ${activeTab === "trips" ? "active" : ""}`}
            onClick={() => setActiveTab("trips")}
          >
            Trips
          </div>
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
        <input
          type="text"
          placeholder="Search chat titles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="chat-history-list">
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
            Đang tải...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
            {searchTerm
              ? "Không tìm thấy chat nào"
              : "Chưa có cuộc trò chuyện nào"}
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.sessionId}
              className={`chat-history-item ${
                selectedSessionId === session.sessionId ? "active" : ""
              }`}
              onClick={() => onSelectSession?.(session.sessionId)}
            >
              <div className="chat-item-title">
                {session.title || "New chat"}
              </div>
              <div className="chat-item-snippet">
                {session.messageCount} tin nhắn •{" "}
                {formatDate(session.lastActivity)}
              </div>
              <button
                className="chat-item-delete"
                onClick={(e) => handleDeleteSession(session.sessionId, e)}
                title="Xóa cuộc trò chuyện"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatHistorySidebar;
