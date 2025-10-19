import { apiClient } from "./api";
import { API_ENDPOINTS } from "../config/api";

export interface ChatSendRequest {
  message: string;
  sessionId?: string;
  userId?: string;
  context?: Record<string, unknown>;
}

export interface ChatMessageDTO {
  id: string;
  sender: "user" | "bot";
  content: string;
  createdAt?: string;
  meta?: Record<string, unknown>;
}

export interface ChatSendResponse {
  sessionId: string;
  messages: ChatMessageDTO[];
  payload?: {
    conversationId?: string;
    locations?: any[];
    itinerary?: any;
  };
}

export interface ChatSession {
  _id: string;
  sessionId: string;
  userId?: string;
  title?: string;
  lastActivity: string;
  messageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  generatedTrip?: any;
  messages?: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp?: string;
  }>;
}

export interface ChatHistoryResponse {
  sessions: ChatSession[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export class ChatService {
  private static readonly SESSIONS_CACHE_KEY = "chat_sessions_cache";

  private static cacheKey(userId?: string) {
    return userId ? `${ChatService.SESSIONS_CACHE_KEY}:${userId}` : ChatService.SESSIONS_CACHE_KEY;
  }

  private static readSessionsCache(userId?: string): ChatSession[] {
    try {
      const raw = localStorage.getItem(ChatService.cacheKey(userId));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as ChatSession[];
    } catch {
      return [];
    }
  }

  private static writeSessionsCache(sessions: ChatSession[], userId?: string) {
    try {
      localStorage.setItem(ChatService.cacheKey(userId), JSON.stringify(sessions));
    } catch {
      // ignore quota errors
    }
  }

  static getCachedSessions(userId?: string): ChatHistoryResponse {
    const sessions = ChatService.readSessionsCache(userId);
    return {
      sessions,
      totalPages: 1,
      currentPage: 1,
      total: sessions.length,
    };
  }

  static upsertSessionToCache(partial: {
    sessionId: string;
    title?: string;
    incrementMessagesBy?: number;
    userId?: string;
  }) {
    const nowIso = new Date().toISOString();
    const sessions = ChatService.readSessionsCache(partial.userId);
    const idx = sessions.findIndex((s) => s.sessionId === partial.sessionId);
    if (idx >= 0) {
      const current = sessions[idx];
      const inc = partial.incrementMessagesBy ?? 1;
      const updated: ChatSession = {
        ...current,
        title: partial.title || current.title,
        lastActivity: nowIso,
        messageCount: Math.max(0, (current.messageCount || 0) + inc),
        updatedAt: nowIso,
      } as ChatSession;
      sessions[idx] = updated;
    } else {
      const created: ChatSession = {
        _id: partial.sessionId,
        sessionId: partial.sessionId,
        title: partial.title || "New chat",
        lastActivity: nowIso,
        messageCount: Math.max(1, partial.incrementMessagesBy ?? 1),
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      } as ChatSession;
      sessions.unshift(created);
    }
    ChatService.writeSessionsCache(sessions, partial.userId);
  }

  static removeSessionFromCache(sessionId: string, userId?: string) {
    const sessions = ChatService.readSessionsCache(userId);
    const filtered = sessions.filter((s) => s.sessionId !== sessionId);
    ChatService.writeSessionsCache(filtered, userId);
  }

  static async send(request: ChatSendRequest) {
    console.log("[ChatService.send] request", request);
    // Backend expects { message, conversationId }
    const payload = {
      message: request.message,
      conversationId: request.sessionId,
      userId: request.userId,
      context: request.context,
    } as any;

    const url = `${API_ENDPOINTS.CHAT.SEND}/message`;
    const CHAT_TIMEOUT_MS = 60000; // Allow slow BE response
    const MAX_RETRIES = 1; // one light retry
    const RETRY_DELAY_MS = 1500;
    let res: any;
    let attempt = 0;
    while (true) {
      try {
        res = await apiClient.post<any>(url, payload, { timeout: CHAT_TIMEOUT_MS });
        break;
      } catch (e: any) {
        attempt++;
        if (attempt > MAX_RETRIES) {
          // Persist minimal payload under provided temp conversation id to avoid 'unknown'
          try {
            const tempConvId = payload.conversationId || `temp_${Date.now()}`;
            const lastPayload = {
              conversationId: tempConvId,
              locations: [],
              itinerary: null,
              savedAt: new Date().toISOString(),
            };
            localStorage.setItem(`chat:lastPayload:${tempConvId}`, JSON.stringify(lastPayload));
          } catch {}
          throw e;
        }
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
    
    console.log("[ChatService.send] response", res);

    // Log BE-provided locations and itinerary coordinates (for markers) – preview only
    try {
      const beLocations = Array.isArray(res?.data?.locations) ? res.data.locations : [];
      console.log("[ChatService.send] BE locations count:", beLocations.length);
      if (beLocations.length) {
        const preview = beLocations.map((loc: any, i: number) => ({
          i,
          name: loc?.name,
          address: loc?.address,
          coordinates: loc?.coordinates || null,
          type: loc?.type,
          category: loc?.category,
        }));
        console.log("[ChatService.send] BE locations (preview):", preview);
      }

      const itin = res?.data?.itinerary;
      if (itin && Array.isArray(itin.days)) {
        const actWithCoords: Array<{ day: number; title?: string; location?: string; coordinates?: any }>= [];
        itin.days.forEach((day: any, dayIdx: number) => {
          if (Array.isArray(day?.activities)) {
            day.activities.forEach((act: any) => {
              if (act?.coordinates && typeof act.coordinates.lat === "number" && typeof act.coordinates.lng === "number") {
                actWithCoords.push({
                  day: dayIdx + 1,
                  title: act?.title,
                  location: act?.location,
                  coordinates: act?.coordinates,
                });
              }
            });
          }
        });
        console.log("[ChatService.send] Itinerary activities with coordinates:", actWithCoords.length);
        if (actWithCoords.length) {
          console.log("[ChatService.send] Itinerary coords (preview):", actWithCoords.slice(0, 20));
        }
      }

      // Persist last structured payload for this conversationId to support logging on reload
      try {
        const lastPayload = {
          conversationId: res?.data?.conversationId || payload.conversationId,
          locations: beLocations,
          itinerary: itin || null,
          savedAt: new Date().toISOString(),
        };
        const storageKey = `chat:lastPayload:${lastPayload.conversationId || "unknown"}`;
        localStorage.setItem(storageKey, JSON.stringify(lastPayload));
        console.log("[ChatService.send] Persisted last payload for conversation:", storageKey);
      } catch (persistErr) {
        console.warn("[ChatService.send] Persist last payload failed:", persistErr);
      }
    } catch (logErr) {
      console.warn("[ChatService.send] Logging BE locations failed:", logErr);
    }
    if (!res.success) {
      throw new Error(res.error || "Chat send failed");
    }

    // Map backend shape -> FE expected shape
    const conversationId = res.data?.conversationId;
    const responseText = res.data?.response ?? "";
    const mapped: ChatSendResponse = {
      sessionId: conversationId,
      messages: [
        {
          id: `${Date.now()}`,
          sender: "bot",
          content: responseText,
        },
      ],
      payload: {
        conversationId,
        locations: (res as any)?.data?.locations || [],
        itinerary: (res as any)?.data?.itinerary || null,
      },
    };
    // Update local cache for history list (assumes one user msg + one bot msg)
    const firstUserText = request.message;
    const inferredTitle = firstUserText?.slice(0, 50) || "New chat";
    ChatService.upsertSessionToCache({
      sessionId: conversationId,
      title: inferredTitle,
      incrementMessagesBy: 2,
      userId: request.userId,
    });
    return mapped;
  }

  static async history() {
    console.log("[ChatService.history] fetch");
    const res = await apiClient.get<ChatHistoryResponse>(API_ENDPOINTS.CHAT.HISTORY);
    console.log("[ChatService.history] response", res);
    if (!res.success) {
      throw new Error(res.error || "Chat history failed");
    }
    return res.data;
  }

  static async getChatSessions(userId?: string) {
    console.log("[ChatService.getChatSessions] fetch", { userId });
    const baseUrl = API_ENDPOINTS.CHAT_SESSIONS.LIST;
    const ts = Date.now();
    const url = `${baseUrl}?_ts=${ts}${userId ? `&user=${encodeURIComponent(userId)}` : ""}`; // prefer server-side filtering
    try {
      const res = await apiClient.get<any>(url);
      console.log("[ChatService.getChatSessions] response", res);
      // Accept both shapes:
      // 1) { success, data: { sessions, totalPages, currentPage, total } }
      // 2) { sessions, totalPages, currentPage, total }
      let payload: ChatHistoryResponse | undefined;
      if (res && typeof res === "object") {
        if (Array.isArray((res as any).sessions)) {
          payload = {
            sessions: (res as any).sessions,
            totalPages: (res as any).totalPages ?? 1,
            currentPage: (res as any).currentPage ?? 1,
            total: (res as any).total ?? (res as any).sessions.length,
          };
        } else if (res.success && res.data && Array.isArray(res.data.sessions)) {
          payload = res.data as ChatHistoryResponse;
        }
      }
      if (!payload) {
        throw new Error((res && res.error) || "Failed to fetch chat sessions");
      }
      // Client-side safety filter by userId if provided
      if (Array.isArray(payload.sessions) && userId) {
        const normalize = (v: any): string => {
          if (typeof v === "string") return v;
          if (v && typeof v === "object") {
            if (typeof v._id === "string") return v._id;
            if (typeof v.$oid === "string") return v.$oid;
          }
          return String(v || "");
        };
        payload.sessions = payload.sessions.filter((s: any) => normalize((s as any).userId) === String(userId));
      }
      // Sync cache for quick subsequent loads (store only filtered list)
      if (Array.isArray(payload.sessions)) {
        ChatService.writeSessionsCache(payload.sessions, userId);
      }
      return payload;
    } catch (err) {
      console.warn("[ChatService.getChatSessions] falling back to local cache due to error", err);
      return ChatService.getCachedSessions(userId);
    }
  }

  static async getChatSession(sessionId: string) {
    console.log("[ChatService.getChatSession] fetch", { sessionId });
    const baseUrl = API_ENDPOINTS.CHAT_SESSIONS.BY_SESSION_ID.replace(':sessionId', sessionId);
    const url = `${baseUrl}?_ts=${Date.now()}`; // prevent HTTP 304 cache
    const res = await apiClient.get<any>(url);
    console.log("[ChatService.getChatSession] response", res);
    // Accept both shapes:
    // 1) Raw ChatSession document (has messages)
    // 2) { success, data: ChatSession }
    if (res && Array.isArray((res as any).messages)) {
      return res as unknown as ChatSession;
    }
    if (res && res.success && res.data) {
      return res.data as ChatSession;
    }
    throw new Error((res && res.error) || "Failed to fetch chat session");
  }

  static async deleteChatSession(sessionId: string, userId?: string) {
    console.log("[ChatService.deleteChatSession] delete", { sessionId });
    try {
      const res = await apiClient.delete(API_ENDPOINTS.CHAT_SESSIONS.DELETE.replace(':id', sessionId));
      console.log("[ChatService.deleteChatSession] response", res);
      if (!res.success) {
        throw new Error(res.error || "Failed to delete chat session");
      }
      ChatService.removeSessionFromCache(sessionId, userId);
      return res.data;
    } catch (err) {
      console.warn("[ChatService.deleteChatSession] backend failed, removing from local cache", err);
      ChatService.removeSessionFromCache(sessionId, userId);
      return { success: true } as any;
    }
  }
}

export default ChatService;


