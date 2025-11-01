import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import LeftSidebar from "../components/LeftSidebar";
import ChatHistorySidebar from "../components/ChatHistorySidebar";
import GoogleMapsComponent from "../components/GoogleMapsComponent";
import "../styles/ChatPage.css";
import ChatService from "../services/chatService";
import { exploreService } from "../services/exploreService";
import { useAuth } from "../context/AuthContext";
import subscriptionService, { type PlanType } from "../services/subscriptionService";
import PaymentService from "../services/paymentService";

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

// Session Map State Interface
interface SessionMapState {
  sessionId: string;
  markers: any[];
  center: { lat: number; lng: number };
  zoom: number;
  lastUpdated: string;
}

const ChatPage: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  // Quick Planner state (compact chips + modals)
  const [qpDestination, setQpDestination] = useState<string>("");
  const [qpDays, setQpDays] = useState<number | null>(null);
  const [qpTravelers, setQpTravelers] = useState<number>(2);
  const [qpBudget, setQpBudget] = useState<
    "" | "save" | "balanced" | "premium"
  >("");
  const [qpPreferences, setQpPreferences] = useState<string[]>([]);
  const [qpOpen, setQpOpen] = useState<
    null | "where" | "when" | "who" | "budget" | "preferences"
  >(null);

  // Dynamic markers from Google Maps API
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 10.7769, lng: 106.6951 });
  const [mapZoom, setMapZoom] = useState(13);

  // Marker details state
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [showMarkerDetails, setShowMarkerDetails] = useState(false);
  const [markerDetailLoading, setMarkerDetailLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  
  // Session-based map state management
  const [sessionMapStates, setSessionMapStates] = useState<Record<string, SessionMapState>>({});
  // const [isUpdatingMap] = useState(false);
  const [hasLoadedInitialSession, setHasLoadedInitialSession] = useState(false);
  const locationsLoggedRef = useRef(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [userPlan, setUserPlan] = useState<PlanType | null>(null);
  const [sessionLimitNotice, setSessionLimitNotice] = useState<string | null>(null);
  const [messageLimitNotice, setMessageLimitNotice] = useState<string | null>(null);


  const sendingRef = useRef(false);
  const { isAuthenticated, openAuthModal, user } = useAuth();
  const currentUserId = useMemo(() => {
    const anyUser: any = user as any;
    return (anyUser?.id ?? anyUser?._id ?? anyUser?.uid) as string | undefined;
  }, [user]);

  // Ensure we have latest plan when needed (declare AFTER useAuth)
  const fetchPlanIfNeeded = useCallback(async (): Promise<PlanType | null> => {
    if (!isAuthenticated) return null;
    try {
      const res = await subscriptionService.getCurrent();
      // Accept both shapes: { success, data: subscription } OR { success, data: { subscription } }
      let planType: PlanType | null = null;
      const maybeSub: any = (res as any)?.data?.subscription || (res as any)?.data;
      if (maybeSub && (maybeSub as any)?.planId) {
        const plan = (maybeSub as any).planId as any;
        planType = (plan?.type || null) as PlanType | null;
      }
      if (!planType) {
        // Fallback: if any paid payment exists, consider premium
        try {
          const paid = await PaymentService.getUserPayments(1, 1, "paid");
          if (Array.isArray(paid.data) && paid.data.length > 0) {
            planType = "premium";
          }
        } catch {}
      }
      const finalPlan = (planType || "free") as PlanType;
      setUserPlan(finalPlan);
      return finalPlan;
    } catch {
      // Network/server error: try payments fallback
      try {
        const paid = await PaymentService.getUserPayments(1, 1, "paid");
        if (Array.isArray(paid.data) && paid.data.length > 0) {
          setUserPlan("premium");
          return "premium";
        }
      } catch {}
      setUserPlan("free");
      return "free";
    }
  }, [isAuthenticated]);

  // ✅ COMPRESS: Compress map state to reduce storage size
  const compressMapState = useCallback((mapState: SessionMapState) => {
    return {
      sessionId: mapState.sessionId,
      markers: mapState.markers.map(marker => ({
        id: marker.id,
        lat: marker.lat,
        lng: marker.lng,
        title: marker.title,
        description: marker.description,
        type: marker.type,
        // Keep essential data only
        name: marker.name,
        address: marker.address,
        placeId: marker.placeId,
        rating: marker.rating,
        // Remove heavy data to save space
        // photos: undefined,
        // reviews: undefined,
        // amenities: undefined,
        // tips: undefined
      })),
      center: mapState.center,
      zoom: mapState.zoom,
      lastUpdated: mapState.lastUpdated
    };
  }, []);

  // ✅ UTILITY: Check localStorage usage
  const getLocalStorageUsage = useCallback(() => {
    try {
      let totalSize = 0;
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      });
      
      return {
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        keyCount: keys.length,
        mapStateKeys: keys.filter(key => key.startsWith(`mapState:${currentUserId}:`)).length
      };
    } catch (error) {
      console.error('Failed to get localStorage usage:', error);
      return { totalSize: 0, totalSizeMB: '0', keyCount: 0, mapStateKeys: 0 };
    }
  }, [currentUserId]);

  // ✅ CLEANUP: Clean up old map states when localStorage is full
  const cleanupOldMapStates = useCallback(() => {
    try {
      const keys = Object.keys(localStorage);
      const mapStateKeys = keys.filter(key => key.startsWith(`mapState:${currentUserId}:`));
      
      if (mapStateKeys.length === 0) return;
      
      // Get all map states with their timestamps
      const mapStates = mapStateKeys.map(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          return { key, lastUpdated: data.lastUpdated || '1970-01-01T00:00:00.000Z' };
        } catch {
          return { key, lastUpdated: '1970-01-01T00:00:00.000Z' };
        }
      });
      
      // Sort by lastUpdated (oldest first)
      mapStates.sort((a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime());
      
      // Remove oldest 50% of map states
      const toDelete = mapStates.slice(0, Math.floor(mapStates.length / 2));
      toDelete.forEach(({ key }) => {
        localStorage.removeItem(key);
        console.log(`🗑️ Cleaned up old map state: ${key}`);
      });
      
      console.log(`🗑️ Cleaned up ${toDelete.length} old map states`);
      
      // Log usage after cleanup
      const usage = getLocalStorageUsage();
      console.log(`🗑️ localStorage usage after cleanup:`, usage);
    } catch (error) {
      console.error('Failed to cleanup old map states:', error);
    }
  }, [currentUserId, getLocalStorageUsage]);

  // ✅ SAVE: Save map state with error handling and cleanup
  const saveMapStateForSession = useCallback((sessionId: string, markers: any[], center: {lat: number, lng: number}, zoom: number = 13) => {
    const mapState: SessionMapState = {
      sessionId,
      markers,
      center,
      zoom,
      lastUpdated: new Date().toISOString()
    };
    
    setSessionMapStates(prev => ({
      ...prev,
      [sessionId]: mapState
    }));
    
    const storageKey = `mapState:${currentUserId}:${sessionId}`;
    
    try {
      // Compress data before saving
      const compressedState = compressMapState(mapState);
      const compressedData = JSON.stringify(compressedState);
      
      // Try to save
      localStorage.setItem(storageKey, compressedData);
      console.log(`🗺️ 💾 SAVED map state for session: ${sessionId}`, { 
        markers: markers.length, 
        center,
        zoom,
        timestamp: mapState.lastUpdated,
        storageKey,
        compressedSize: compressedData.length
      });
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn(`🗺️ ⚠️ localStorage quota exceeded, cleaning up old data...`);
        
        // Clean up old data
        cleanupOldMapStates();
        
        try {
          // Try to save again after cleanup
          const compressedState = compressMapState(mapState);
          const compressedData = JSON.stringify(compressedState);
          localStorage.setItem(storageKey, compressedData);
          console.log(`🗺️ ✅ SAVED map state after cleanup: ${sessionId}`, { 
            markers: markers.length, 
            compressedSize: compressedData.length
          });
        } catch (retryError) {
          console.error(`🗺️ ❌ Failed to save map state even after cleanup:`, retryError);
          // Still update in-memory state even if localStorage fails
        }
      } else {
        console.error(`🗺️ ❌ Failed to save map state:`, error);
      }
    }
  }, [currentUserId, compressMapState, cleanupOldMapStates]);

  // Helper function to build markers from payload (moved from inline)
  const buildMarkersFromPayload = useCallback((payload: any) => {
        if (!payload) return [] as any[];
        console.log("[Markers] Build from payload:", {
          hasLocations: Array.isArray(payload?.locations),
          hasItinerary: !!payload?.itinerary,
        });
        
        // ✅ DEBUG: Log payload structure
        if (payload?.locations) {
          console.log(`🗺️ [DEBUG] Locations count: ${payload.locations.length}`);
          payload.locations.forEach((loc: any, i: number) => {
            console.log(`🗺️ [DEBUG] Location ${i}:`, {
              hasCoordinates: !!(loc.coordinates?.lat && loc.coordinates?.lng),
              coordinates: loc.coordinates,
              name: loc.name,
              address: loc.address
            });
          });
        }
        
        
        const fromLocations = Array.isArray(payload?.locations)
          ? payload.locations
              .filter(
                (loc: any) =>
                  loc &&
                  loc.coordinates &&
                  typeof loc.coordinates.lat === "number" &&
                  typeof loc.coordinates.lng === "number"
              )
              .map((loc: any, i: number) => {
                const marker = {
                id: loc.id || `loc-${i}`,
                lat: Number(loc.coordinates.lat),
                lng: Number(loc.coordinates.lng),
                title: String(loc.name || loc.address || "Địa điểm"),
                description: loc.description,
                type: loc.type || loc.category || "place",
                  
                  // ✅ ENHANCED: Map all enriched data from backend
                  name: loc.name,
                  address: loc.address,
                  placeId: loc.placeId || loc.place_id, // ✅ FIXED: Map both placeId and place_id
                  rating: loc.rating,
                  photos: loc.photos || [],
                  photoUrl: loc.photoUrl,
                  contact: loc.contact,
                  openingHours: loc.openingHours,
                  priceLevel: loc.priceLevel,
                  userRatingsTotal: loc.userRatingsTotal || loc.user_ratings_total,
                  reviews: loc.reviews || [],
                  amenities: loc.amenities || [],
                  estimatedCost: loc.estimatedCost,
                  bestTimeToVisit: loc.bestTimeToVisit,
                  tips: loc.tips,
                  formatted_address: loc.formatted_address,
                  category: loc.category,
                  user_ratings_total: loc.user_ratings_total
                };
                
                
                return marker;
              })
          : [];
        if (fromLocations.length) {
          console.log(
            "[Markers] Locations (with coords)",
            fromLocations.length,
            fromLocations
              .slice(0, 10)
              .map((m: any) => ({ title: m.title, lat: m.lat, lng: m.lng }))
          );
        }

        const itin = payload?.itinerary;
        const fromItin: any[] = [];
        
        
        if (itin && Array.isArray(itin.days)) {
          itin.days.forEach((day: any, dayIdx: number) => {
            if (Array.isArray(day?.activities)) {
              day.activities.forEach((act: any, actIdx: number) => {
                const c = act?.coordinates;
                if (
                  c &&
                  typeof c.lat === "number" &&
                  typeof c.lng === "number"
                ) {
                  const marker = {
                    id: act.id || `itin-${dayIdx + 1}-${actIdx + 1}`,
                    lat: Number(c.lat),
                    lng: Number(c.lng),
                    title: String(act.title || act.location || "Hoạt động"),
                    description: act.description,
                    type: act.type || "activity",
                    
                    // ✅ ENHANCED: Map all enriched data from backend
                    name: act.title || act.name,
                    address: act.formatted_address || act.location || act.address,
                    placeId: act.place_id || act.placeId, // ✅ FIXED: Map both place_id and placeId
                    rating: act.rating,
                    photos: act.photos || [],
                    photoUrl: act.photoUrl,
                    contact: act.contact,
                    openingHours: act.openingHours,
                    priceLevel: act.priceLevel,
                    userRatingsTotal: act.userRatingsTotal || act.user_ratings_total,
                    reviews: act.reviews || [],
                    amenities: act.amenities || [],
                    estimatedCost: act.estimatedCost,
                    duration: act.duration,
                    priority: act.priority,
                    day: dayIdx + 1,
                    time: act.time,
                    formatted_address: act.formatted_address,
                    category: act.category || 'itinerary',
                    user_ratings_total: act.user_ratings_total
                  };
                  
                  
                  fromItin.push(marker);
                }
              });
            }
          });
        }
        if (fromItin.length) {
          console.log(
            "[Markers] Itinerary activities (with coords)",
            fromItin.length,
            fromItin
              .slice(0, 10)
              .map((m: any) => ({ title: m.title, lat: m.lat, lng: m.lng }))
          );
        }

        const merged = [...fromLocations, ...fromItin];
        const seen = new Set<string>();
        const unique = [] as any[];
        for (const m of merged) {
          const key = `${m.title}|${m.lat.toFixed(6)}|${m.lng.toFixed(6)}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(m);
          }
          if (unique.length >= 30) break;
        }
        console.log("[Markers] Unique markers count:", unique.length);
        return unique;
  }, []);

  // Load map state for a session
  const loadMapStateForSession = useCallback(async (sessionId: string) => {
    console.log(`🗺️ Loading map state for session: ${sessionId}`);
    
    // Try to load from localStorage first (most reliable) with user-specific key
    const localStorageKey = `mapState:${currentUserId}:${sessionId}`;
    
    try {
      const savedFromStorage = localStorage.getItem(localStorageKey);
      console.log(`🗺️ Checking localStorage for key: ${localStorageKey}`, { exists: !!savedFromStorage });
      
      if (savedFromStorage) {
        try {
          const mapState = JSON.parse(savedFromStorage);
          console.log(`🗺️ Parsed map state:`, { 
            sessionId: mapState.sessionId, 
            markersCount: mapState.markers?.length,
            center: mapState.center,
            zoom: mapState.zoom 
          });
          
          if (mapState.markers && mapState.center) {
            setMapMarkers(mapState.markers);
            setMapCenter(mapState.center);
            setMapZoom(mapState.zoom || 13);
            console.log(`🗺️ ✅ Loaded map state from localStorage for session: ${sessionId}`, { markers: mapState.markers.length });
            return;
          } else {
            console.log(`🗺️ ❌ Invalid map state data for session: ${sessionId}`);
          }
        } catch (error) {
          console.warn('Failed to parse saved map state:', error);
          // Remove corrupted data
          localStorage.removeItem(localStorageKey);
        }
      } else {
        console.log(`🗺️ ❌ No saved map state found for session: ${sessionId}`);
      }
    } catch (error) {
      console.error('Failed to access localStorage:', error);
    }
    
    // Try to load from memory
    const savedState = sessionMapStates[sessionId];
    if (savedState && savedState.markers && savedState.center) {
      setMapMarkers(savedState.markers);
      setMapCenter(savedState.center);
      setMapZoom(savedState.zoom);
      console.log(`🗺️ Loaded saved map state for session: ${sessionId}`, { markers: savedState.markers.length });
      return;
    }
    
    // Try to load from session messages
    try {
      const session = await ChatService.getChatSession(sessionId);
      if (session?.messages) {
        // Find last bot message with payload
        const lastBotMessage = session.messages
          .filter((msg: any) => msg.role === 'assistant')
          .pop();
        
        if (lastBotMessage?.payload) {
          const markers = buildMarkersFromPayload(lastBotMessage.payload);
          if (markers.length > 0) {
            setMapMarkers(markers);
            setMapCenter(markers[0]);
            setMapZoom(13);
            
            // Save this state
            saveMapStateForSession(sessionId, markers, markers[0]);
            console.log(`🗺️ Loaded map from session messages for session: ${sessionId}`, { markers: markers.length });
          }
        }
      }
    } catch (error) {
      console.error('Failed to load map from session messages:', error);
    }
  }, [sessionMapStates, saveMapStateForSession, buildMarkersFromPayload, currentUserId]);

  const handleSendMessage = async () => {
    if (!isAuthenticated) {
      console.warn("[ChatPage] Blocked send: user not authenticated");
      openAuthModal("login");
      return;
    }
    if (!inputValue.trim() || sendingRef.current) return;
    const text = inputValue.trim();

    const newMessage = {
      id: messages.length + 1,
      type: "user",
      content: text,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // If creating a new session (no current sessionId), enforce free plan limit (max 1 session)
    const planNow = await fetchPlanIfNeeded();
    if (!sessionId && planNow === "free") {
      try {
        const list = await ChatService.getChatSessions(currentUserId);
        const count = Array.isArray(list.sessions) ? list.sessions.length : 0;
        if (count >= 1) {
          setSessionLimitNotice(
            "Bạn đã đạt giới hạn số phiên chat cho gói miễn phí (1 phiên). Đóng phiên cũ hoặc nâng cấp để tạo thêm."
          );
          return;
        }
      } catch (e) {
        console.warn("[ChatPage] Could not verify session limit, allowing send.", e);
      }
    }

    // Check message limit with backend middleware endpoint (blocks when exceeded)
    try {
      const limitRes = await subscriptionService.checkMessageLimit();
      if (!limitRes.success) {
        setMessageLimitNotice(limitRes.error || "Bạn đã hết lượt chat miễn phí. Vui lòng nâng cấp để tiếp tục.");
        return;
      }
    } catch (e: any) {
      // If BE says 403, apiClient maps to success:false; other errors we let it pass to avoid blocking unnecessarily
      console.warn("[ChatPage] checkMessageLimit error", e?.message || e);
    }

    // Prepare a temporary session id to keep UI consistent while waiting for BE
    const tempSessionId = sessionId || `temp_${Date.now()}`;
    if (!sessionId) {
      setSessionId(tempSessionId);
      setSelectedSessionId(tempSessionId);
    }

    try {
      setIsBotTyping(true);
      sendingRef.current = true;
      const data = await ChatService.send({
        message: text,
        sessionId: tempSessionId,
        userId: currentUserId,
      });

      // If backend returns a different (real) sessionId, migrate from temp → real
      if (data.sessionId && data.sessionId !== tempSessionId) {
        try {
          const oldKey = `chat:lastPayload:${tempSessionId}`;
          const newKey = `chat:lastPayload:${data.sessionId}`;
          const old = localStorage.getItem(oldKey);
          if (old && !localStorage.getItem(newKey)) {
            const parsed = JSON.parse(old);
            parsed.conversationId = data.sessionId;
            localStorage.setItem(newKey, JSON.stringify(parsed));
          }
          localStorage.removeItem(oldKey);
        } catch {}
      }

      const currentSessionId = data.sessionId || tempSessionId;
      setSessionId(currentSessionId);
      setSelectedSessionId(currentSessionId);

      // append bot messages
      const botMsgs = data.messages
        .filter((m) => m.sender === "bot")
        .map((m, idx) => ({
          id: messages.length + 2 + idx,
          type: "bot" as const,
          content: m.content,
        }));
      if (botMsgs.length) {
        setMessages((prev) => [...prev, ...botMsgs]);
      }

      // ✅ SIMPLIFIED: Process map markers from response
      let newMarkers: any[] = [];
      let newCenter: {lat: number, lng: number} | null = null;
      
      // Try to get markers from response payload
      if ((data as any)?.payload) {
        try {
          newMarkers = buildMarkersFromPayload((data as any).payload);
          console.log(`🗺️ [DEBUG] Got ${newMarkers.length} markers from response payload`);
        } catch (error) {
          console.error(`🗺️ [DEBUG] Error processing payload:`, error);
        }
      }
      
      // If no markers from response, try localStorage fallback
      if (newMarkers.length === 0) {
        try {
          const storageKey = `chat:lastPayload:${currentSessionId}`;
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            newMarkers = buildMarkersFromPayload(parsed);
            console.log(`🗺️ [DEBUG] Got ${newMarkers.length} markers from localStorage fallback`);
          }
        } catch (error) {
          console.error(`🗺️ [DEBUG] Error processing localStorage fallback:`, error);
        }
      }
      
      // Update map if we have new markers
      if (newMarkers.length > 0) {
        setMapMarkers(newMarkers);
        const first = newMarkers[0];
        if (first?.lat && first?.lng) {
          newCenter = { lat: first.lat, lng: first.lng };
          setMapCenter(newCenter);
          setMapZoom(13);
          console.log(`🗺️ [DEBUG] Updated map with ${newMarkers.length} markers`);
        }
      }
      
      // ✅ SIMPLIFIED: Always save current map state for this session
      const markersToSave = newMarkers.length > 0 ? newMarkers : mapMarkers;
      const centerToSave = newCenter || mapCenter || { lat: 10.7769, lng: 106.6951 };
      
      saveMapStateForSession(currentSessionId, markersToSave, centerToSave);
      console.log(`🗺️ ✅ Saved map state for session: ${currentSessionId}`, { 
        markers: markersToSave.length, 
        center: centerToSave
      });
      
    } catch (err: any) {
      console.error("[ChatPage] send error", err);
      const msg = (err && (err.message || err.error)) || "Đã xảy ra lỗi khi gửi tin nhắn.";
      // If backend enforces message limit, surface it to UI
      if (/lượt chat miễn phí|MESSAGE_LIMIT_EXCEEDED|hết lượt chat/i.test(String(msg))) {
        setMessageLimitNotice(String(msg));
      }
    } finally {
      setIsBotTyping(false);
      sendingRef.current = false;
    }
  };

  const handleSelectSession = async (nextSessionId: string) => {
    // ✅ Save current session's map state BEFORE switching
    if (sessionId && mapMarkers.length > 0 && mapCenter) {
      saveMapStateForSession(sessionId, mapMarkers, mapCenter);
      console.log(`🗺️ 💾 Saved current map state before switching away from: ${sessionId}`, {
        markers: mapMarkers.length,
        center: mapCenter
      });
    }

    // Set selected session immediately for UI
    setSelectedSessionId(nextSessionId);

    if (!nextSessionId) {
      const planNow = await fetchPlanIfNeeded();
      // New chat requested → enforce free plan session limit before clearing state
      if (isAuthenticated && planNow === "free") {
        try {
          const list = await ChatService.getChatSessions(currentUserId);
          const count = Array.isArray(list.sessions) ? list.sessions.length : 0;
          if (count >= 1) {
            setSessionLimitNotice(
              "Bạn đã đạt giới hạn số phiên chat cho gói miễn phí (1 phiên). Đóng phiên cũ hoặc nâng cấp để tạo thêm."
            );
            return; // Do not create a new session state
          }
        } catch (e) {
          console.warn("[ChatPage] Could not verify session limit on new chat.", e);
        }
      }
      // Also pre-check message limit before preparing new chat box
      try {
        const limitRes = await subscriptionService.checkMessageLimit();
        if (!limitRes.success) {
          setMessageLimitNotice(limitRes.error || "Bạn đã hết lượt chat miễn phí. Vui lòng nâng cấp để tiếp tục.");
          return;
        }
      } catch (e: any) {
        console.warn("[ChatPage] checkMessageLimit error (new chat)", e?.message || e);
      }
      // New chat: clear and switch to chat view
      setMessages([]);
      setSessionId(undefined);
      setShowChatHistory(false);
      // Reset map to default
      setMapMarkers([]);
      setMapCenter({ lat: 10.7769, lng: 106.6951 });
      setMapZoom(13);
      console.log("🗺️ Reset map for new chat");
      return;
    }

    try {
      // Load existing session messages
      const session = await ChatService.getChatSession(nextSessionId);

      if (session && session.messages) {
        // Convert backend messages to frontend format
        const frontendMessages = session.messages.map(
          (msg: any, index: number) => ({
            id: `${nextSessionId}-${index}`,
            type: msg.role === "user" ? "user" : "bot",
            content: msg.content,
          })
        );
        setMessages(frontendMessages);
        setSessionId(nextSessionId);
        
        // Load map state for this session
        console.log(`🗺️ 🔄 Switching to session: ${nextSessionId}`);
        // Clear current map to avoid showing old map while loading
        setMapMarkers([]);
        // Load target session map state
        await loadMapStateForSession(nextSessionId);
        console.log(`🗺️ ✅ Completed loading session: ${nextSessionId}`);
        
        // Tự động đóng panel lịch sử để hiển thị nội dung chat
        setShowChatHistory(false);
      }
    } catch (error) {
      console.error("[ChatPage] Failed to load session:", error);
      
      // Handle specific error cases
      if (error.message?.includes('Network error') || error.message?.includes('CORS')) {
        console.warn("[ChatPage] Backend connection issue, trying to load from localStorage only");
        
        // Try to load map state from localStorage even if session load failed
        try {
          await loadMapStateForSession(nextSessionId);
          console.log(`🗺️ ✅ Loaded map state from localStorage despite session load failure`);
        } catch (mapError) {
          console.warn("[ChatPage] Could not load map state either:", mapError);
        }
        
        // Try to load messages from localStorage as fallback
        try {
          const localStorageKey = `chat:lastPayload:${nextSessionId}`;
          const savedPayload = localStorage.getItem(localStorageKey);
          if (savedPayload) {
            const payload = JSON.parse(savedPayload);
            console.log("[ChatPage] Found saved payload for session:", nextSessionId);
            
            // Create mock messages from payload if available
            const mockMessages = [
              { id: `${nextSessionId}-0`, type: "user", content: "User message" },
              { id: `${nextSessionId}-1`, type: "bot", content: "AI response with locations and itinerary" }
            ];
            setMessages(mockMessages);
            setSessionId(nextSessionId);
            console.log("[ChatPage] Loaded mock messages from localStorage");
          } else {
            // Try to find session info from chat history
            const chatHistoryKey = `chatSessions:${currentUserId}`;
            const savedHistory = localStorage.getItem(chatHistoryKey);
            if (savedHistory) {
              const history = JSON.parse(savedHistory);
              const sessionInfo = history.sessions?.find((s: any) => s.sessionId === nextSessionId);
              if (sessionInfo) {
                console.log("[ChatPage] Found session info in chat history:", sessionInfo);
                setSessionId(nextSessionId);
                // Create basic messages from session info
                const basicMessages = [
                  { id: `${nextSessionId}-0`, type: "user", content: "Previous conversation" },
                  { id: `${nextSessionId}-1`, type: "bot", content: "AI response with travel suggestions" }
                ];
                setMessages(basicMessages);
                console.log("[ChatPage] Loaded basic messages from chat history");
              }
            }
          }
        } catch (payloadError) {
          console.warn("[ChatPage] Failed to load from localStorage:", payloadError);
        }
        
        // Don't clear messages and sessionId on network errors - keep current state
        console.log("[ChatPage] Keeping current chat state due to network error");
        setShowChatHistory(false);
        return;
      } else {
        // For other errors, still try to load map state
        try {
          await loadMapStateForSession(nextSessionId);
        } catch (mapError) {
          console.warn("[ChatPage] Could not load map state:", mapError);
        }
      }
      
      // Only clear messages for non-network errors
      setMessages([]);
      setSessionId(undefined);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Stable map callbacks to avoid re-initializing map while typing
  const handleMapMarkerClick = useCallback(async (marker: any) => {
    console.log("Marker clicked:", marker);
    
    
    setSelectedMarker(marker);
    setShowMarkerDetails(true);
    setMarkerDetailLoading(true);

    try {
      // ✅ ENHANCED: Check if marker has enriched data from backend
      if (marker.placeId && marker.placeId.startsWith('ChIJ')) {
        // This is a valid Google Maps placeId - try to get additional details
        try {
          const placeDetail = await exploreService.getById(marker.placeId, "auto");
          // Merge backend data with API data
          const enrichedMarker = {
            ...marker,
            ...placeDetail,
            // Keep backend data as priority
            photos: marker.photos?.length > 0 ? marker.photos : placeDetail.photos,
            rating: marker.rating || placeDetail.rating,
            reviews: marker.reviews?.length > 0 ? marker.reviews : placeDetail.reviews
          };
          setSelectedMarker(enrichedMarker);
          setMarkerDetailLoading(false);
          console.log("Marker details loaded from Google Maps + Backend:", enrichedMarker);
        } catch (apiError) {
          console.warn("API call failed, using backend data:", apiError);
          // ✅ FIXED: If API fails, use marker data directly (it should have enriched data from backend)
          console.log("Using enriched marker data from backend:", marker);
          setSelectedMarker(marker);
          setMarkerDetailLoading(false);
        }
      } else if (marker.photos?.length > 0 || marker.rating || marker.reviews?.length > 0) {
        // ✅ ENHANCED: Marker has enriched data from backend, use it directly
        console.log("Using enriched marker data from backend:", {
          photos: marker.photos?.length || 0,
          rating: marker.rating,
          reviews: marker.reviews?.length || 0,
          amenities: marker.amenities?.length || 0
        });
        setSelectedMarker(marker);
        setMarkerDetailLoading(false);
      } else if (marker.title && marker.lat && marker.lng) {
        // Fallback: Try to get place details using coordinates and name
        try {
          // Use Google Maps Places API to find place by coordinates and name
          const geocoder = new window.google.maps.Geocoder();
          const latlng = new window.google.maps.LatLng(marker.lat, marker.lng);
          
          geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
              // Find the result that matches the marker title
              const matchingResult = results.find(result => 
                result.formatted_address.includes(marker.title) ||
                result.address_components.some(component => 
                  component.long_name.includes(marker.title)
                )
              );
              
              if (matchingResult) {
                const placeId = matchingResult.place_id;
                // Now get place details using the placeId
                exploreService.getById(placeId, "auto")
                  .then(placeDetail => {
                    setSelectedMarker(placeDetail);
                    setMarkerDetailLoading(false);
                    console.log("Marker details loaded via geocoding:", placeDetail);
                  })
                  .catch(error => {
                    console.error("Failed to get place details after geocoding:", error);
                    setSelectedMarker(marker);
                    setMarkerDetailLoading(false);
                  })
                  .finally(() => {
                    setMarkerDetailLoading(false);
                  });
              } else {
                // No matching result found, use marker data
                setSelectedMarker(marker);
                setMarkerDetailLoading(false);
              }
            } else {
              console.error("Geocoding failed:", status);
              setSelectedMarker(marker);
              setMarkerDetailLoading(false);
            }
          });
        } catch (geocodeError) {
          console.error("Geocoding error:", geocodeError);
          setSelectedMarker(marker);
          setMarkerDetailLoading(false);
        }
      } else {
        // ✅ FIXED: Use marker data directly for basic markers
        console.log("Using basic marker data:", marker);
        setSelectedMarker(marker);
        setMarkerDetailLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch marker details:", error);
      // Fallback: use marker data as is
      setSelectedMarker(marker);
      setMarkerDetailLoading(false);
    }
  }, []);

  const handleMapClickStable = useCallback((lat: number, lng: number) => {
    console.log("Map clicked at:", lat, lng);
  }, []);

  // Feature flag: disable auto-updating map from messages (only show base map)
  // const ENABLE_MESSAGE_MAP = false;

  // Update map based on latest chat message
  // const updateMapFromLatestMessage = useCallback(async () => {
  //   if (!ENABLE_MESSAGE_MAP) return;
  //   if (messages.length === 0 || isUpdatingMap) return;

  //   setIsUpdatingMap(true);
  //   try {
  //     // Get the latest message (bot response is usually more informative)
  //     const latestMessage = messages[messages.length - 1];
  //     const messageContent = latestMessage.content;

  //     console.log(
  //       "[ChatPage] Analyzing message for locations:",
  //       messageContent.substring(0, 100) + "..."
  //     );

  //     // Parse locations from the message
  //     const locations = await LocationParserService.parseLocationFromMessage(
  //       messageContent
  //     );

  //     if (locations.length > 0) {
  //       const primaryLocation =
  //         LocationParserService.getPrimaryLocation(locations);

  //       if (primaryLocation && primaryLocation.coordinates) {
  //         console.log("[ChatPage] Found primary location:", primaryLocation);

  //         // Update map center to the found location
  //         setMapCenter(primaryLocation.coordinates);
  //         setMapZoom(13);
  //         setCurrentLocation(primaryLocation);
  //       }

  //       // Create markers for ALL locations found in the message
  //       const allMarkers = locations.map((location, index) => ({
  //         id: `location-${index}`,
  //         position: location.coordinates,
  //         title: location.name,
  //         type: location.type || "general",
  //       }));

  //       setMapMarkers(allMarkers);
  //       console.log(
  //         "[ChatPage] Updated map with",
  //         allMarkers.length,
  //         "markers:",
  //         allMarkers.map((m) => m.title)
  //       );
  //     } else {
  //       console.log("[ChatPage] No locations found in message");
  //     }
  //   } catch (error) {
  //     console.error("[ChatPage] Failed to update map from message:", error);
  //   } finally {
  //     setIsUpdatingMap(false);
  //   }
  // }, [messages, isUpdatingMap]);

  // Build and send structured planner message (to meet BE minimal requirements)
  const handleQuickPlan = async () => {
    // Compose one-shot prompt with destination + preferences; include soft hints
    const prefs = qpPreferences.length > 0 ? qpPreferences.join(", ") : "";
    const hints = [
      qpTravelers ? `${qpTravelers} người` : "",
      qpBudget === "save"
        ? "ngân sách tiết kiệm"
        : qpBudget === "balanced"
        ? "ngân sách trung bình"
        : qpBudget === "premium"
        ? "ngân sách cao cấp"
        : "",
    ]
      .filter(Boolean)
      .join(", ");

    const daysPart = qpDays ? ` trong ${qpDays} ngày` : "";
    const prefsPart = prefs ? ` Sở thích: ${prefs}.` : "";
    const text = `Tôi muốn tạo lịch trình${daysPart} tại ${qpDestination}.${prefsPart}${
      hints ? " Gợi ý thêm: " + hints + "." : ""
    }`;

    if (!qpDestination) {
      // If not enough info, just focus input with template
      setInputValue(text);
      return;
    }

    setInputValue("");
    // If this action will create a new session, enforce free plan session limit first
    const planNow = await fetchPlanIfNeeded();
    if (!sessionId && isAuthenticated && planNow === "free") {
      try {
        const list = await ChatService.getChatSessions(currentUserId);
        const count = Array.isArray(list.sessions) ? list.sessions.length : 0;
        if (count >= 1) {
          setSessionLimitNotice(
            "Bạn đã đạt giới hạn số phiên chat cho gói miễn phí (1 phiên). Đóng phiên cũ hoặc nâng cấp để tạo thêm."
          );
          return;
        }
      } catch (e) {
        console.warn("[ChatPage] Could not verify session limit (QuickPlan).", e);
      }
    }
    // Check message limit for QuickPlan
    try {
      const limitRes = await subscriptionService.checkMessageLimit();
      if (!limitRes.success) {
        setMessageLimitNotice(limitRes.error || "Bạn đã hết lượt chat miễn phí. Vui lòng nâng cấp để tiếp tục.");
        return;
      }
    } catch (e: any) {
      console.warn("[ChatPage] checkMessageLimit error (QuickPlan)", e?.message || e);
    }
    await setTimeout(() => {}, 0);
    // Reuse normal send
    const prev = inputValue;
    try {
      setIsBotTyping(true);
      // Push user message for immediate UX
      setMessages((prevMsgs) => [
        ...prevMsgs,
        { id: Date.now(), type: "user", content: text },
      ]);
      const data = await ChatService.send({
        message: text,
        sessionId,
        userId: currentUserId,
      });
      setSessionId(data.sessionId);
      setSelectedSessionId(data.sessionId);
      const botMsgs = data.messages
        .filter((m) => m.sender === "bot")
        .map((m, idx) => ({
          id: Date.now() + idx + 1,
          type: "bot" as const,
          content: m.content,
        }));
      if (botMsgs.length) setMessages((p) => [...p, ...botMsgs]);

      // After chat completes: update map markers (same logic as handleSendMessage)
      let appliedImmediate = false;
      let finalMarkers: any[] = [];
      let finalCenter: {lat: number, lng: number} | null = null;
      
      try {
        const immediate = buildMarkersFromPayload((data as any)?.payload);
        if (immediate.length) {
          setMapMarkers(immediate);
          console.log(
            "[Markers] Applied immediate payload markers (QuickPlan):",
            immediate.length
          );
          const first = immediate[0];
          if (first?.lat && first?.lng) {
            setMapCenter({ lat: first.lat, lng: first.lng });
            setMapZoom((z) => (z < 5 || z > 18 ? 13 : z));
            console.log("[Markers] Center map to first marker (QuickPlan):", first);
            finalMarkers = immediate;
            finalCenter = { lat: first.lat, lng: first.lng };
          }
          appliedImmediate = true;
        }
      } catch {}

      // 2) Fallback: update map markers from BE structured payload persisted by ChatService
      try {
        const storageKey = `chat:lastPayload:${
          data.sessionId || sessionId
        }`;
        const raw = localStorage.getItem(storageKey);
        if (raw && !appliedImmediate) {
          const parsed = JSON.parse(raw);
          const unique = buildMarkersFromPayload(parsed);
          if (unique.length) {
            setMapMarkers(unique);
            console.log(
              "[Markers] Applied fallback payload markers (QuickPlan):",
              unique.length
            );
            const first = unique[0];
            if (first?.lat && first?.lng) {
              setMapCenter({ lat: first.lat, lng: first.lng });
              setMapZoom((z) => (z < 5 || z > 18 ? 13 : z));
              console.log("[Markers] Center map to first marker (QuickPlan fallback):", first);
              finalMarkers = unique;
              finalCenter = { lat: first.lat, lng: first.lng };
            }
          }
        }
      } catch {}

      // 3) Save map state for session
      if (finalMarkers.length > 0 && finalCenter) {
        saveMapStateForSession(data.sessionId || sessionId, finalMarkers, finalCenter);
        console.log(`🗺️ Saved map state for QuickPlan session: ${data.sessionId || sessionId}`, { markers: finalMarkers.length });
      }
    } catch (e: any) {
      console.warn("[ChatPage] quick plan send error", e);
      const msg = (e && (e.message || e.error)) || "Đã xảy ra lỗi khi gửi yêu cầu.";
      if (/lượt chat miễn phí|MESSAGE_LIMIT_EXCEEDED|hết lượt chat/i.test(String(msg))) {
        setMessageLimitNotice(String(msg));
      }
      setInputValue(prev);
    } finally {
      setIsBotTyping(false);
    }
  };

  // Only show base map on enter; do not load or set any default markers
  const defaultLoadedRef = useRef(false);
  useEffect(() => {
    if (defaultLoadedRef.current) return; // avoid StrictMode double invoke
    defaultLoadedRef.current = true;
    setMapMarkers([]);
  }, []);

  // Load current subscription plan for the authenticated user
  useEffect(() => {
    const fetchPlan = async () => {
      if (!isAuthenticated) {
        setUserPlan(null);
        return;
      }
      try {
        const res = await subscriptionService.getCurrent();
        if (res.success && res.data?.subscription) {
          const plan: any = res.data.subscription.planId as any;
          const planType = (plan?.type || null) as PlanType | null;
          setUserPlan(planType);
        } else {
          setUserPlan("free");
        }
      } catch (e) {
        console.warn("[ChatPage] Failed to load subscription, default to free", e);
        setUserPlan("free");
      }
    };
    fetchPlan();
  }, [isAuthenticated]);

  // Load saved map states from localStorage on mount
  useEffect(() => {
    const loadSavedMapStates = () => {
      if (!currentUserId) {
        console.log('🗺️ No currentUserId, skipping map state load');
        return;
      }
      
      const savedStates: Record<string, SessionMapState> = {};
      const userPrefix = `mapState:${currentUserId}:`;
      
      // First, try to load user-specific states
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(userPrefix)) {
          const sessionId = key.replace(userPrefix, '');
          try {
            const state = JSON.parse(localStorage.getItem(key) || '{}');
            if (state.sessionId && state.markers && state.center) {
              savedStates[sessionId] = state;
            }
          } catch (error) {
            console.warn('Failed to parse saved map state:', error);
          }
        }
      }
      
      // If no user-specific states found, try to migrate old format
      if (Object.keys(savedStates).length === 0) {
        console.log('🗺️ No user-specific map states found, checking for old format...');
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('mapState:') && !key.includes(':')) {
            const sessionId = key.replace('mapState:', '');
            try {
              const state = JSON.parse(localStorage.getItem(key) || '{}');
              if (state.sessionId && state.markers && state.center) {
                // Migrate to new format
                const newKey = `mapState:${currentUserId}:${sessionId}`;
                localStorage.setItem(newKey, JSON.stringify(state));
                localStorage.removeItem(key); // Remove old key
                savedStates[sessionId] = state;
                console.log(`🗺️ Migrated map state: ${key} → ${newKey}`);
              }
            } catch (error) {
              console.warn('Failed to migrate map state:', error);
            }
          }
        }
      }
      
      setSessionMapStates(savedStates);
      console.log('🗺️ Loaded saved map states for user:', currentUserId, 'count:', Object.keys(savedStates).length);
    };
    
    loadSavedMapStates();
  }, [currentUserId]);

  // Log: load BE-provided structured locations/itinerary from localStorage when viewing latest bot message
  useEffect(() => {
    if (!hasLoadedInitialSession) return;
    if (locationsLoggedRef.current) return;
    if (!messages.length) return;
    const latest = messages[messages.length - 1];
    if (!latest?.content || latest.type !== "bot") return;

    const sid = selectedSessionId || sessionId;
    const storageKey = sid ? `chat:lastPayload:${sid}` : undefined;
    if (storageKey) {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          const beLocations = Array.isArray(parsed?.locations)
            ? parsed.locations
            : [];
          console.log(
            "[ChatPage] BE locations on load (preview) count:",
            beLocations.length
          );
          if (beLocations.length) {
            const preview = beLocations.map((loc: any, i: number) => ({
              i,
              name: loc?.name,
              address: loc?.address,
              coordinates: loc?.coordinates || null,
              type: loc?.type,
              category: loc?.category,
            }));
            console.log("[ChatPage] BE locations on load (preview):", preview);
          }

          const itin = parsed?.itinerary;
          if (itin && Array.isArray(itin.days)) {
            const actWithCoords: Array<{
              day: number;
              title?: string;
              location?: string;
              coordinates?: any;
            }> = [];
            itin.days.forEach((day: any, dayIdx: number) => {
              if (Array.isArray(day?.activities)) {
                day.activities.forEach((act: any) => {
                  if (
                    act?.coordinates &&
                    typeof act.coordinates.lat === "number" &&
                    typeof act.coordinates.lng === "number"
                  ) {
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
            console.log(
              "[ChatPage] Itinerary coords on load (count):",
              actWithCoords.length
            );
            if (actWithCoords.length) {
              console.log(
                "[ChatPage] Itinerary coords on load (preview):",
                actWithCoords.slice(0, 50)
              );
            }
          }
        } else {
          console.log(
            "[ChatPage] No stored structured payload for session; BE likely returned text only"
          );
        }
      } catch (e) {
        console.warn("[ChatPage] Failed to read stored payload:", e);
      }
    } else {
      console.log("[ChatPage] No sessionId found to load structured payload");
    }

    locationsLoggedRef.current = true;
  }, [hasLoadedInitialSession, messages, selectedSessionId, sessionId]);

  // Log: parse địa điểm từ text của bot message mới nhất (history chỉ có text)
  useEffect(() => {
    if (!hasLoadedInitialSession) return;
    if (!messages.length) return;
    const latest = messages[messages.length - 1];
    if (!latest?.content || latest.type !== "bot") return;

    const raw = String(latest.content);
    const text = raw.toLowerCase();

    // Danh sách từ khóa địa danh mẫu (có thể mở rộng dần)
    const placeKeywords = [
      "sài gòn",
      "hồ chí minh",
      "hcm",
      "hà nội",
      "đà nẵng",
      "nha trang",
      "đà lạt",
      "vũng tàu",
      "phú quốc",
      "huế",
      "hội an",
      "quy nhơn",
      "cần thơ",
      // landmarks thường gặp
      "chợ bến thành",
      "nhà thờ đức bà",
      "dinh độc lập",
      "bưu điện thành phố",
      "bitexco",
      "landmark 81",
      "bảo tàng chứng tích chiến tranh",
    ];

    const found: string[] = [];
    for (const kw of placeKeywords) {
      const re = new RegExp(
        `(^|[^a-zà-ỹ])${kw.replace(
          /[-\\^$*+?.()|[\]{}]/g,
          "\\$&"
        )}(?=$|[^a-zà-ỹ])`,
        "i"
      );
      if (re.test(text)) found.push(kw);
    }
    const uniquePlaces = Array.from(new Set(found));

    // Lấy các dòng đánh dấu bằng emoji 📍
    const pinRe = /📍\s*([^\n]+)/g;
    const pinned: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = pinRe.exec(raw))) {
      const line = (m[1] || "").trim();
      if (line) pinned.push(line);
    }

    console.log(
      "[ChatPage] Parsed places (from latest AI text) count:",
      uniquePlaces.length
    );
    uniquePlaces.forEach((n, i) =>
      console.log(`[ChatPage] Parsed place #${i + 1}:`, n)
    );
    console.log("[ChatPage] Parsed pinned addresses count:", pinned.length);
    pinned.forEach((n, i) =>
      console.log(`[ChatPage] Parsed pinned #${i + 1}:`, n)
    );
  }, [hasLoadedInitialSession, messages]);

  // Auto-load latest chat session on mount/auth ready
  useEffect(() => {
    console.log("[ChatPage] useEffect triggered for auto-load:", { 
      isAuthenticated, 
      currentUserId, 
      hasLoadedInitialSession 
    });
    
    const init = async () => {
      console.log("[ChatPage] Auto-load check:", { 
        isAuthenticated, 
        currentUserId, 
        hasLoadedInitialSession 
      });
      
      if (!isAuthenticated || !currentUserId || hasLoadedInitialSession) {
        console.log("[ChatPage] Auto-load skipped:", {
          reason: !isAuthenticated ? "not authenticated" : 
                  !currentUserId ? "no userId" : 
                  "already loaded"
        });
        return;
      }

      // Add a small delay to avoid race condition with ChatHistorySidebar
      const timer = setTimeout(async () => {
        try {
          console.log("[ChatPage] Fetching chat sessions for user:", currentUserId);
          const list = await ChatService.getChatSessions(currentUserId);
          const sessions = Array.isArray(list.sessions) ? list.sessions : [];
          console.log("[ChatPage] Found sessions:", sessions.length);
          if (sessions.length === 0) {
            console.log("[ChatPage] No chat sessions found, checking for any saved map states");
            // Try to load the most recent map state from localStorage
            try {
              const savedStates: Record<string, SessionMapState> = {};
              const userPrefix = `mapState:${currentUserId}:`;
              
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith(userPrefix)) {
                  const sessionId = key.replace(userPrefix, '');
                  try {
                    const state = JSON.parse(localStorage.getItem(key) || '{}');
                    if (state.sessionId && state.markers && state.center) {
                      savedStates[sessionId] = state;
                    }
                  } catch (error) {
                    console.warn('Failed to parse saved map state:', error);
                  }
                }
              }
              
              // Find the most recent map state
              const sortedStates = Object.values(savedStates).sort((a, b) => 
                new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
              );
              
              if (sortedStates.length > 0) {
                const latestMapState = sortedStates[0];
                setMapMarkers(latestMapState.markers);
                setMapCenter(latestMapState.center);
                setMapZoom(latestMapState.zoom);
                console.log(`🗺️ ✅ Loaded most recent map state: ${latestMapState.sessionId}`, { 
                  markers: latestMapState.markers.length 
                });
              }
            } catch (mapError) {
              console.warn("[ChatPage] Failed to load fallback map state:", mapError);
            }
            
            setHasLoadedInitialSession(true);
            return;
          }

          // pick most recent by lastActivity
          const latest = [...sessions].sort((a: any, b: any) => {
            const ta = new Date(
              a.lastActivity || a.updatedAt || a.createdAt || 0
            ).getTime();
            const tb = new Date(
              b.lastActivity || b.updatedAt || b.createdAt || 0
            ).getTime();
            return tb - ta;
          })[0];

          console.log("[ChatPage] Latest session:", latest);

          if (!latest?.sessionId) {
            console.log("[ChatPage] No valid latest session found");
            setHasLoadedInitialSession(true);
            return;
          }

          // load messages for latest session
          console.log("[ChatPage] Loading session detail for:", latest.sessionId);
          const sessionDetail = await ChatService.getChatSession(
            latest.sessionId
          );
          console.log("[ChatPage] Session detail loaded:", !!sessionDetail, "messages:", sessionDetail?.messages?.length);
          
          if (sessionDetail && Array.isArray(sessionDetail.messages)) {
            const frontendMessages = sessionDetail.messages.map(
              (msg: any, index: number) => ({
                id: `${latest.sessionId}-${index}`,
                type: msg.role === "user" ? "user" : "bot",
                content: msg.content,
              })
            );
            setMessages(frontendMessages);
            setSessionId(latest.sessionId);
            setSelectedSessionId(latest.sessionId);
            setShowChatHistory(false);
            
            // Load map state for the latest session
            console.log(`🗺️ 🔄 Auto-loading latest session: ${latest.sessionId}`);
            try {
              await loadMapStateForSession(latest.sessionId);
              console.log(`🗺️ ✅ Auto-loaded map state for latest session: ${latest.sessionId}`);
            } catch (mapError) {
              console.warn(`🗺️ ⚠️ Failed to load map state for latest session: ${latest.sessionId}`, mapError);
            }
            // Log all AI messages for inspection on entering chat
            const aiMessages = frontendMessages.filter(
              (m: any) => m.type === "bot"
            );
            if (aiMessages.length) {
              console.log(
                "[ChatPage] AI messages loaded (count):",
                aiMessages.length
              );
              aiMessages.forEach((m: any, i: number) => {
                console.log(`[ChatPage] AI message #${i + 1}:`, m.content);
              });
            } else {
              console.log("[ChatPage] No AI messages in latest session");
            }
          }
          setHasLoadedInitialSession(true);
        } catch (e) {
          console.warn("[ChatPage] Failed to load latest session", e);
          console.log("[ChatPage] Error details:", {
            message: e.message,
            stack: e.stack
          });
          setHasLoadedInitialSession(true);
        }
      }, 1000); // Increase delay to 1 second

      return () => clearTimeout(timer);
    };

    init();
  }, [isAuthenticated, currentUserId, hasLoadedInitialSession]);

  // ✅ FIXED: Save map state on component unmount
  useEffect(() => {
    return () => {
      // Save current map state when component unmounts
      if (sessionId && mapMarkers.length > 0 && mapCenter) {
        saveMapStateForSession(sessionId, mapMarkers, mapCenter);
        console.log(`🗺️ 💾 Saved map state on unmount for session: ${sessionId}`, {
          markers: mapMarkers.length,
          center: mapCenter
        });
      }
    };
  }, [sessionId, mapMarkers, mapCenter, saveMapStateForSession]);

  // ✅ DEBUG: Monitor mapMarkers changes
  useEffect(() => {
    console.log(`🗺️ [DEBUG] mapMarkers changed:`, {
      count: mapMarkers.length,
      sessionId: sessionId,
      hasCenter: !!mapCenter
    });
  }, [mapMarkers, sessionId, mapCenter]);

  // ✅ SIMPLIFIED: Auto-save map state when markers change
  useEffect(() => {
    if (sessionId && mapMarkers.length > 0 && mapCenter) {
      // Small delay to ensure state is stable
      const timer = setTimeout(() => {
        saveMapStateForSession(sessionId, mapMarkers, mapCenter);
        console.log(`🗺️ 💾 Auto-saved map state for session: ${sessionId}`, {
          markers: mapMarkers.length,
          center: mapCenter
        });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [mapMarkers, mapCenter, sessionId, saveMapStateForSession]);

  // ✅ CLEANUP: Clean up localStorage on component mount to prevent accumulation
  useEffect(() => {
    const cleanupOnMount = () => {
      try {
        const keys = Object.keys(localStorage);
        const mapStateKeys = keys.filter(key => key.startsWith(`mapState:${currentUserId}:`));
        
        if (mapStateKeys.length > 20) { // If more than 20 map states, clean up
          console.log(`🗑️ Found ${mapStateKeys.length} map states, cleaning up old ones...`);
          cleanupOldMapStates();
        }
      } catch (error) {
        console.error('Failed to cleanup on mount:', error);
      }
    };
    
    if (currentUserId) {
      cleanupOnMount();
    }
  }, [currentUserId, cleanupOldMapStates]);

  // Removed: one-time location logger

  // --- Message formatting helpers ---
  const escapeHtml = (raw: string) =>
    raw
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const formatMessageHTML = (text: string, type: "user" | "bot") => {
    // Base escape
    let t = escapeHtml(text);

    // Bold markers (**text**)
    t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    // Emphasize ONLY a few key facts (first occurrence only)
    // Days 📅 (first match only)
    t = t.replace(/(\b\d+\s*(ngày|day|days?)\b)/i, "📅 <strong>$1</strong>");
    // People 👥 (first match only)
    t = t.replace(/(\b\d+\s*người\b)/i, "👥 <strong>$1</strong>");
    // Budget 💰 (first match of either pattern only)
    if (!/💰/.test(t))
      t = t.replace(/(\b\d+\s*triệu\b)/i, "💰 <strong>$1</strong>");
    if (!/💰/.test(t))
      t = t.replace(/(ngân\s*sách[^\.;\n]*)/i, "💰 <strong>$1</strong>");

    // Destinations 📍
    const places = [
      "sài gòn",
      "hồ chí minh",
      "nha trang",
      "đà nẵng",
      "đà lạt",
      "vũng tàu",
      "phú quốc",
    ];
    let placed = false;
    for (const p of places) {
      if (placed) break;
      const re = new RegExp(`\\b${p}\\b`, "i");
      if (re.test(t)) {
        t = t.replace(re, (m) => `📍 <strong>${m}</strong>`);
        placed = true;
      }
    }

    // Rich formatting similar to sample
    const lines = t
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const normalized = lines.length
      ? lines
      : t
          .split(/(?<=[\.!?])\s+/)
          .map((s) => s.trim())
          .filter(Boolean);

    const html: string[] = [];
    const bullet = (emoji: string, content: string) =>
      `<li><span class="bemoji">${emoji}</span><span>${content}</span></li>`;

    for (let i = 0; i < normalized.length; i++) {
      const line = normalized[i];

      const dayMatch = line.match(/^ngày\s*(\d+)/i);
      if (dayMatch) {
        if (html.length > 0) html.push('<hr class="fmt-sep"/>');
        const dayNum = dayMatch[1];
        const title = line.replace(/^ngày\s*\d+\s*[-–:]?\s*/i, "").trim();
        html.push(
          `<h3 class="fmt-day">Ngày ${dayNum} <span class="sep">–</span> ${
            title || "Lịch trình"
          }</h3>`
        );
        continue;
      }

      if (/^(di\s*chuyển|khám phá|kết thúc|ghi chú)/i.test(line)) {
        html.push(`<p class="fmt-sub">${line}</p>`);
        continue;
      }

      const morning = line.match(/^sáng\s*[:\-–]\s*(.*)/i);
      const afternoon = line.match(/^chiều\s*[:\-–]\s*(.*)/i);
      const evening = line.match(/^tối\s*[:\-–]\s*(.*)/i);
      if (morning || afternoon || evening) {
        if (!html.length || !html[html.length - 1].startsWith("<ul")) {
          html.push('<ul class="fmt-list">');
        }
        if (morning) html.push(bullet("🌞", morning[1]));
        if (afternoon) html.push(bullet("🌤️", afternoon[1]));
        if (evening) html.push(bullet("🌙", evening[1]));
        continue;
      }

      if (/^[-•]\s+/.test(line)) {
        if (!html.length || !html[html.length - 1].startsWith("<ul")) {
          html.push('<ul class="fmt-list">');
        }
        html.push(bullet("•", line.replace(/^[-•]\s+/, "")));
        continue;
      }

      if (html.length && html[html.length - 1].startsWith("<li")) {
        let j = html.length - 1;
        while (j >= 0 && !html[j].startsWith("<ul")) j--;
        if (j >= 0) html.push("</ul>");
      }

      if (i === 0 && type === "bot") {
        html.push(`<p class="fmt-intro">${line}</p>`);
        continue;
      }

      html.push(`<p>${line}</p>`);
    }

    if (html.length && html[html.length - 1].startsWith("<li")) {
      html.push("</ul>");
    }

    return html.join("");
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Left Sidebar Navigation */}
        <LeftSidebar activeItem="chats" />

        {/* Right side: Shared header + two columns */}
        <div className="chat-right">
          {/* Shared Header */}
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
            <button
              className="btn-new-chat"
              onClick={() => handleSelectSession("")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Chat mới
            </button>
            <div className="chat-header-actions">
              <div className="qp-compact">
                <button className="qp-pill" onClick={() => setQpOpen("where")}>
                  {qpDestination ? qpDestination : "Đi đâu"}
                </button>
                <div className="qp-pill-divider" />
                <button className="qp-pill" onClick={() => setQpOpen("when")}>
                  {qpDays ? `${qpDays} ngày` : "Khi nào"}
                </button>
                <div className="qp-pill-divider" />
                <button className="qp-pill" onClick={() => setQpOpen("who")}>
                  {qpTravelers} người
                </button>
                <div className="qp-pill-divider" />
                <button className="qp-pill" onClick={() => setQpOpen("budget")}>
                  {qpBudget
                    ? qpBudget === "save"
                      ? "$"
                      : qpBudget === "balanced"
                      ? "$$"
                      : "$$$"
                    : "Ngân sách"}
                </button>
                <div className="qp-pill-divider" />
                <button className="qp-pill" onClick={() => setQpOpen("preferences")}>
                  {qpPreferences.length > 0 
                    ? `${qpPreferences.length} sở thích` 
                    : "Sở thích"}
                </button>
              </div>
              <button className="qp-plan-btn" onClick={handleQuickPlan}>
                Lên lịch trình
              </button>
            </div>
          </div>

          {/* Quick Planner Modals */}
          {qpOpen === "where" && (
            <div className="qp-modal" onClick={() => setQpOpen(null)}>
              <div
                className="qp-modal-inner"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="qp-modal-header">
                  <span>Đi đâu</span>
                  <button className="qp-close" onClick={() => setQpOpen(null)}>
                    ✕
                  </button>
                </div>
                <input
                  className="qp-modal-input"
                  placeholder="Nhập địa điểm"
                  value={qpDestination}
                  onChange={(e) => setQpDestination(e.target.value)}
                />
                <div className="qp-modal-actions">
                  <button
                    className="qp-modal-btn"
                    onClick={() => setQpOpen(null)}
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          )}
          {qpOpen === "when" && (
            <div className="qp-modal" onClick={() => setQpOpen(null)}>
              <div
                className="qp-modal-inner"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="qp-modal-header">
                  <span>Khi nào</span>
                  <button className="qp-close" onClick={() => setQpOpen(null)}>
                    ✕
                  </button>
                </div>
                <div className="qp-row">
                  <label>Số ngày</label>
                  <input
                    type="number"
                    min={1}
                    className="qp-num"
                    value={qpDays ?? 5}
                    onChange={(e) => setQpDays(parseInt(e.target.value || "1"))}
                  />
                </div>
                <div className="qp-modal-actions">
                  <button
                    className="qp-modal-btn"
                    onClick={() => setQpOpen(null)}
                  >
                    Cập nhật
                  </button>
                </div>
              </div>
            </div>
          )}
          {qpOpen === "who" && (
            <div className="qp-modal" onClick={() => setQpOpen(null)}>
              <div
                className="qp-modal-inner"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="qp-modal-header">
                  <span>Số người</span>
                  <button className="qp-close" onClick={() => setQpOpen(null)}>
                    ✕
                  </button>
                </div>
                <div className="qp-row">
                  <label>Số người</label>
                    <div className="qp-counter">
                    <button onClick={() => setQpTravelers(Math.max(1, qpTravelers - 1))}>
                        –
                      </button>
                    <span>{qpTravelers}</span>
                    <button onClick={() => setQpTravelers(qpTravelers + 1)}>+</button>
                    </div>
                  </div>
                <div className="qp-modal-actions">
                  <button
                    className="qp-modal-btn"
                    onClick={() => setQpOpen(null)}
                  >
                    Cập nhật
                  </button>
                </div>
              </div>
            </div>
          )}
          {qpOpen === "budget" && (
            <div className="qp-modal" onClick={() => setQpOpen(null)}>
              <div
                className="qp-modal-inner"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="qp-modal-header">
                  <span>Ngân sách</span>
                  <button className="qp-close" onClick={() => setQpOpen(null)}>
                    ✕
                  </button>
                </div>
                <div className="qp-radio">
                  {[
                    { k: "", l: "Bất kỳ ngân sách nào" },
                    { k: "save", l: "$ Tiết kiệm" },
                    { k: "balanced", l: "$$ Trung bình" },
                    { k: "premium", l: "$$$ Cao cấp" },
                  ].map((b) => (
                    <label key={b.k} className="qp-radio-row">
                      <input
                        type="radio"
                        name="qp-budget"
                        checked={qpBudget === (b.k as any)}
                        onChange={() => setQpBudget(b.k as any)}
                      />
                      <span>{b.l}</span>
                    </label>
                  ))}
                </div>
                <div className="qp-modal-actions">
                  <button
                    className="qp-modal-btn"
                    onClick={() => setQpOpen(null)}
                  >
                    Cập nhật
                  </button>
                </div>
              </div>
            </div>
          )}
          {qpOpen === "preferences" && (
            <div className="qp-modal" onClick={() => setQpOpen(null)}>
              <div
                className="qp-modal-inner"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="qp-modal-header">
                  <span>Sở thích</span>
                  <button className="qp-close" onClick={() => setQpOpen(null)}>
                    ✕
                  </button>
                </div>
                <div className="qp-checkbox-group">
                  {[
                    "Ăn uống",
                    "Tham quan",
                    "Mua sắm",
                    "Thể thao",
                    "Nghỉ dưỡng",
                    "Văn hóa",
                    "Thiên nhiên",
                    "Lịch sử",
                    "Nghệ thuật",
                    "Giải trí",
                    "Phiêu lưu",
                    "Tâm linh"
                  ].map((pref) => (
                    <label key={pref} className="qp-checkbox-row">
                      <input
                        type="checkbox"
                        checked={qpPreferences.includes(pref)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setQpPreferences([...qpPreferences, pref]);
                          } else {
                            setQpPreferences(qpPreferences.filter(p => p !== pref));
                          }
                        }}
                      />
                      <span>{pref}</span>
                    </label>
                  ))}
                </div>
                <div className="qp-modal-actions">
                  <button
                    className="qp-modal-btn"
                    onClick={() => setQpOpen(null)}
                  >
                    Cập nhật
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Two-column layout */}
          <div className="chat-columns">
            <div className="chat-main-content">
              {/* Conditional Content: Chat History or Chat Messages */}
              {showChatHistory ? (
                <ChatHistorySidebar
                  onSelectSession={handleSelectSession}
                  selectedSessionId={selectedSessionId}
                />
              ) : (
                <div className="chat-content">
                  {sessionLimitNotice && (
                    <div
                      className="auth-required-banner"
                      style={{
                        margin: "0.5rem 1rem",
                        padding: "0.75rem 1rem",
                        borderRadius: 12,
                        background: "rgba(255, 152, 0, 0.08)",
                        border: "1px solid rgba(255, 152, 0, 0.25)",
                        color: "#a15c00",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <span>{sessionLimitNotice}</span>
                        <button
                          className="send-btn"
                          onClick={() => setSessionLimitNotice(null)}
                        >
                          Đã hiểu
                        </button>
                      </div>
                    </div>
                  )}
                  {messageLimitNotice && (
                    <div
                      className="auth-required-banner"
                      style={{
                        margin: "0.5rem 1rem",
                        padding: "0.75rem 1rem",
                        borderRadius: 12,
                        background: "rgba(255, 77, 133, 0.08)",
                        border: "1px solid rgba(255, 77, 133, 0.2)",
                        color: "#D63570",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <span>{messageLimitNotice}</span>
                        <button
                          className="send-btn"
                          onClick={() => setMessageLimitNotice(null)}
                        >
                          Đã hiểu
                        </button>
                      </div>
                    </div>
                  )}
                  {!isAuthenticated && (
                    <div
                      className="auth-required-banner"
                      style={{
                        margin: "0.5rem 1rem",
                        padding: "0.75rem 1rem",
                        borderRadius: 12,
                        background: "rgba(255, 77, 133, 0.08)",
                        border: "1px solid rgba(255, 77, 133, 0.2)",
                        color: "#D63570",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <span>Vui lòng đăng nhập để bắt đầu trò chuyện.</span>
                        <button
                          className="send-btn"
                          onClick={() => openAuthModal("login")}
                        >
                          Đăng nhập
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="chat-messages">
                    {messages.length === 0 && (
                      <div
                        style={{
                          margin: "1rem",
                          padding: "1rem",
                          borderRadius: 12,
                          background: "rgba(99, 102, 241, 0.06)",
                          border: "1px dashed rgba(99, 102, 241, 0.35)",
                          color: "#3730A3",
                          textAlign: "center",
                        }}
                      >
                        <h3 style={{ margin: 0, marginBottom: 8 }}>
                          🤖 Trợ lý du lịch AI
                        </h3>
                        <p style={{ margin: 0, opacity: 0.9 }}>
                          Hãy nói điều bạn muốn: điểm đến, số ngày, ngân sách hay sở thích.
                          Ví dụ: “Lên lịch trình 3 ngày ở Đà Nẵng cho gia đình, ưu tiên biển và ẩm thực”.
                        </p>
                      </div>
                    )}
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message ${message.type}-message`}
                      >
                        <div className="message-avatar">
                          {message.type === "user" ? (
                            // User icon
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Z"
                                fill="#2563EB"
                              />
                              <path
                                d="M4 20.5C4 17.462 8.477 16 12 16s8 1.462 8 4.5V22H4v-1.5Z"
                                fill="#60A5FA"
                              />
                            </svg>
                          ) : (
                            // Bot icon
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect
                                x="5"
                                y="8"
                                width="14"
                                height="9"
                                rx="3"
                                fill="#FF4D85"
                              />
                              <circle cx="10" cy="12.5" r="1.5" fill="white" />
                              <circle cx="14" cy="12.5" r="1.5" fill="white" />
                              <path
                                d="M12 3v3"
                                stroke="#FF4D85"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <circle cx="12" cy="6" r="1" fill="#FF4D85" />
                            </svg>
                          )}
                        </div>
                        <div className="message-content">
                          <div
                            className="formatted-text"
                            dangerouslySetInnerHTML={{
                              __html: formatMessageHTML(
                                message.content,
                                message.type
                              ),
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {isBotTyping && (
                      <div className={`message bot-message`}>
                        <div className="message-avatar">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              x="5"
                              y="8"
                              width="14"
                              height="9"
                              rx="3"
                              fill="#FF4D85"
                            />
                            <circle cx="10" cy="12.5" r="1.5" fill="white" />
                            <circle cx="14" cy="12.5" r="1.5" fill="white" />
                            <path
                              d="M12 3v3"
                              stroke="#FF4D85"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <circle cx="12" cy="6" r="1" fill="#FF4D85" />
                          </svg>
                        </div>
                        <div className="message-content typing-bubble">
                          <div className="typing-row">
                            <span className="typing-dot" />
                            <span className="typing-dot" />
                            <span className="typing-dot" />
                          </div>
                          <div className="typing-shimmer">
                            <span className="line l1" />
                            <span className="line l2" />
                            <span className="line l3" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="chat-input-container">
                    <div className="chat-input">
                      <input
                        type="text"
                        placeholder="Hỏi gì đó..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={!isAuthenticated}
                      />
                      <button className="send-btn" onClick={handleSendMessage}>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M22 2L11 13M22 2L15 22L11 13M22 2L2 11L11 13"
                            stroke="#FFFFFF"
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
            {/* Map column */}
            <div className="map-container">
              {/* Location indicator */}
              {currentLocation && (
                <div className="map-location-indicator">
                  <div className="location-info">
                    <span className="location-icon">📍</span>
                    <span className="location-name">
                      {currentLocation.name}
                    </span>
                    <span className="location-type">
                      {currentLocation.type === "city"
                        ? "Thành phố"
                        : currentLocation.type === "attraction"
                        ? "Địa điểm"
                        : "Địa điểm"}
                    </span>
                  </div>
                </div>
              )}

              <GoogleMapsComponent
                mapId="chat-map"
                center={mapCenter}
                zoom={mapZoom}
                markers={mapMarkers}
                onMarkerClick={handleMapMarkerClick}
                onMapClick={handleMapClickStable}
              />
            </div>
          </div>

          {/* Marker Details Sidebar */}
          {showMarkerDetails && (
            <div className="marker-detail-sidebar">
              <div className="marker-detail-header">
                <button
                  className="close-marker-detail-btn"
                  onClick={() => setShowMarkerDetails(false)}
                >
                  ✕
                </button>
        </div>

              {markerDetailLoading ? (
                <div className="marker-detail-loading">
                  <div className="loading-spinner"></div>
                  <p>Đang tải chi tiết địa điểm...</p>
      </div>
              ) : selectedMarker ? (
                <div className="marker-detail-content">
                  
                  {/* Place Header */}
                  <div className="place-header">
                    <h1 className="place-title">
                      {selectedMarker.name || selectedMarker.title || "Địa điểm"}
                    </h1>
                    <div className="place-rating">
                      <span className="rating-stars">
                        ★{" "}
                        {(
                          selectedMarker.rating?.average ??
                          selectedMarker.ratingAverage ??
                          selectedMarker.rating
                        )?.toFixed(1) || "N/A"}
                      </span>
                      <span className="rating-count">
                        {(
                          selectedMarker.rating?.count ??
                          selectedMarker.ratingCount ??
                          selectedMarker.userRatingsTotal ??
                          selectedMarker.user_ratings_total
                        )?.toLocaleString() || 0}{" "}
                        reviews
                      </span>
                    </div>
                    <div className="place-location">
                      📍 {selectedMarker.address || selectedMarker.formatted_address || "Địa chỉ không có"}
                    </div>
                    <div className="place-meta">
                      <span className="place-category">
                        {selectedMarker.category ||
                          selectedMarker.types?.[0] ||
                          selectedMarker.type ||
                          "Địa điểm"}
                      </span>
                      {selectedMarker.priceLevel && (
                        <span className="place-price">
                          {"$".repeat(selectedMarker.priceLevel)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Photos */}
                  {selectedMarker.photos && selectedMarker.photos.length > 0 ? (
                    <div className="place-photos">
                      <h3>Hình ảnh ({selectedMarker.photos.length})</h3>
                      <div className="photos-grid">
                        {selectedMarker.photos.slice(0, 4).map((photo: any, index: number) => {
                          const photoUrl = photo.url_medium || photo.url_small || photo;
                          console.log(`[DEBUG] Photo ${index}:`, { photoUrl, photo });
                          return (
                            <img
                              key={index}
                              src={photoUrl}
                              alt={selectedMarker.name}
                              className="place-photo"
                              onError={(e) => {
                                console.log(`[DEBUG] Photo ${index} failed to load:`, photoUrl);
                                (e.currentTarget as HTMLImageElement).src = 
                                  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop";
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="place-photos">
                      <h3>Hình ảnh</h3>
                      <p>Không có hình ảnh</p>
                      <p>Debug: photos = {JSON.stringify(selectedMarker.photos)}</p>
                    </div>
                  )}

                  {/* Description */}
                  {selectedMarker.description && (
                    <div className="place-description">
                      <h3>Mô tả</h3>
                      <p>{selectedMarker.description}</p>
                    </div>
                  )}

                  {/* Amenities */}
                  {selectedMarker.amenities && selectedMarker.amenities.length > 0 && (
                    <div className="place-amenities">
                      <h3>Tiện ích</h3>
                      <div className="amenities-list">
                        {selectedMarker.amenities.map((amenity: string, index: number) => (
                          <span key={index} className="amenity-tag">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  {selectedMarker.tips && (
                    <div className="place-tips">
                      <h3>Mẹo</h3>
                      <p>{selectedMarker.tips}</p>
                    </div>
                  )}

                  {/* Best Time to Visit */}
                  {selectedMarker.bestTimeToVisit && (
                    <div className="place-timing">
                      <h3>Thời gian tốt nhất</h3>
                      <p>{selectedMarker.bestTimeToVisit}</p>
                    </div>
                  )}

                  {/* Duration */}
                  {selectedMarker.duration && (
                    <div className="place-duration">
                      <h3>Thời gian tham quan</h3>
                      <p>{selectedMarker.duration}</p>
                    </div>
                  )}

                  {/* Estimated Cost */}
                  {selectedMarker.estimatedCost && (
                    <div className="place-cost">
                      <h3>Chi phí ước tính</h3>
                      <p>{selectedMarker.estimatedCost}</p>
                    </div>
                  )}

                  {/* Reviews */}
                  {selectedMarker.reviews && selectedMarker.reviews.length > 0 && (
                    <div className="place-reviews">
                      <h3>Đánh giá</h3>
                      <div className="reviews-list">
                        {selectedMarker.reviews.slice(0, 3).map((review: any, index: number) => (
                          <div key={index} className="review-item">
                            <div className="review-header">
                              <span className="review-author">{review.author_name}</span>
                              <span className="review-rating">★ {review.rating}</span>
                            </div>
                            <p className="review-text">{review.text}</p>
                            <span className="review-time">
                              {new Date(review.time * 1000).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="place-info">
                    <h3>Thông tin bổ sung</h3>
                    <div className="info-grid">
                      {selectedMarker.price_level && (
                        <div className="info-item">
                          <span className="info-label">Mức giá:</span>
                          <span className="info-value">
                            {"$".repeat(selectedMarker.price_level)}
                          </span>
                        </div>
                      )}
                      {selectedMarker.opening_hours && (
                        <div className="info-item">
                          <span className="info-label">Giờ mở cửa:</span>
                          <span className="info-value">
                            {selectedMarker.opening_hours.open_now ? "Đang mở" : "Đã đóng"}
                          </span>
                        </div>
                      )}
                      {selectedMarker.phone && (
                        <div className="info-item">
                          <span className="info-label">Điện thoại:</span>
                          <span className="info-value">{selectedMarker.phone}</span>
                        </div>
                      )}
                      {selectedMarker.website && (
                        <div className="info-item">
                          <span className="info-label">Website:</span>
                          <a href={selectedMarker.website} target="_blank" rel="noopener noreferrer" className="info-link">
                            Xem website
                          </a>
                        </div>
                      )}
                    </div>
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

export default ChatPage;
