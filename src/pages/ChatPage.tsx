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
import { useAuth } from "../context/AuthContext";

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
  const [qpPreferences] = useState<string[]>([]);
  const [qpDays, setQpDays] = useState<number | null>(null);
  const [qpAdults, setQpAdults] = useState<number>(2);
  const [qpChildren, setQpChildren] = useState<number>(0);
  const [qpInfants, setQpInfants] = useState<number>(0);
  const [qpPets, setQpPets] = useState<number>(0);
  const qpTravelers = qpAdults + qpChildren + qpInfants + qpPets;
  const [qpBudget, setQpBudget] = useState<
    "" | "save" | "balanced" | "premium"
  >("");
  const [qpOpen, setQpOpen] = useState<
    null | "where" | "when" | "who" | "budget"
  >(null);

  // Dynamic markers from Google Maps API
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 10.7769, lng: 106.6951 });
  const [mapZoom, setMapZoom] = useState(13);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  
  // Session-based map state management
  const [sessionMapStates, setSessionMapStates] = useState<Record<string, SessionMapState>>({});
  // const [isUpdatingMap] = useState(false);
  const [hasLoadedInitialSession, setHasLoadedInitialSession] = useState(false);
  const locationsLoggedRef = useRef(false);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const sendingRef = useRef(false);
  const { isAuthenticated, openAuthModal, user } = useAuth();
  const currentUserId = useMemo(() => {
    const anyUser: any = user as any;
    return (anyUser?.id ?? anyUser?._id ?? anyUser?.uid) as string | undefined;
  }, [user]);

  // Save map state for a session
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
    
    // Save to localStorage with user-specific key for persistence
    const storageKey = `mapState:${currentUserId}:${sessionId}`;
    localStorage.setItem(storageKey, JSON.stringify(mapState));
    console.log(`🗺️ 💾 SAVED map state for session: ${sessionId}`, { 
      markers: markers.length, 
      center,
      zoom,
      timestamp: mapState.lastUpdated,
      storageKey
    });
    
    // Debug: verify what was saved
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log(`🗺️ ✅ VERIFIED saved state:`, {
        sessionId: parsed.sessionId,
        markersCount: parsed.markers?.length,
        center: parsed.center,
        zoom: parsed.zoom,
        firstMarker: parsed.markers?.[0] ? {
          title: parsed.markers[0].title,
          lat: parsed.markers[0].lat,
          lng: parsed.markers[0].lng
        } : null
      });
    }
  }, [currentUserId]);

  // Helper function to build markers from payload (moved from inline)
  const buildMarkersFromPayload = useCallback((payload: any) => {
        if (!payload) return [] as any[];
        console.log("[Markers] Build from payload:", {
          hasLocations: Array.isArray(payload?.locations),
          hasItinerary: !!payload?.itinerary,
        });
        const fromLocations = Array.isArray(payload?.locations)
          ? payload.locations
              .filter(
                (loc: any) =>
                  loc &&
                  loc.coordinates &&
                  typeof loc.coordinates.lat === "number" &&
                  typeof loc.coordinates.lng === "number"
              )
              .map((loc: any, i: number) => ({
                id: loc.id || `loc-${i}`,
                lat: Number(loc.coordinates.lat),
                lng: Number(loc.coordinates.lng),
                title: String(loc.name || loc.address || "Địa điểm"),
                description: loc.description,
                type: loc.type || loc.category || "place",
              }))
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
                  fromItin.push({
                    id: act.id || `itin-${dayIdx + 1}-${actIdx + 1}`,
                    lat: Number(c.lat),
                    lng: Number(c.lng),
                    title: String(act.title || act.location || "Hoạt động"),
                    description: act.description,
                    type: act.type || "activity",
                  });
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
      }
    } else {
      console.log(`🗺️ ❌ No saved map state found for session: ${sessionId}`);
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

      setSessionId(data.sessionId || tempSessionId);
      setSelectedSessionId(data.sessionId || tempSessionId);

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

      // After chat completes: update map markers
      // 1) Try immediate payload from response

      let appliedImmediate = false;
      let finalMarkers: any[] = [];
      let finalCenter: {lat: number, lng: number} | null = null;
      
      try {
        const immediate = buildMarkersFromPayload((data as any)?.payload);
        if (immediate.length) {
          setMapMarkers(immediate);
          console.log(
            "[Markers] Applied immediate payload markers:",
            immediate.length
          );
          const first = immediate[0];
          if (first?.lat && first?.lng) {
            setMapCenter({ lat: first.lat, lng: first.lng });
            setMapZoom((z) => (z < 5 || z > 18 ? 13 : z));
            console.log("[Markers] Center map to first marker:", first);
            finalMarkers = immediate;
            finalCenter = { lat: first.lat, lng: first.lng };
          }
          appliedImmediate = true;
        }
      } catch {}

      // 2) Fallback: update map markers from BE structured payload persisted by ChatService
      try {
        const storageKey = `chat:lastPayload:${
          data.sessionId || tempSessionId
        }`;
        const raw = localStorage.getItem(storageKey);
        if (raw && !appliedImmediate) {
          const parsed = JSON.parse(raw);
          const unique = buildMarkersFromPayload(parsed);
          if (unique.length) {
            setMapMarkers(unique);
            const first = unique[0];
            if (first && first.lat && first.lng) {
              setMapCenter({ lat: first.lat, lng: first.lng });
              setMapZoom((z) => (z < 5 || z > 18 ? 13 : z));
              console.log("[Markers] Applied fallback markers:", unique.length);
              console.log("[Markers] Center map to first marker:", first);
              finalMarkers = unique;
              finalCenter = { lat: first.lat, lng: first.lng };
            }
          }
        }
      } catch (markerErr) {
        console.warn(
          "[ChatPage] Failed to update markers from payload:",
          markerErr
        );
      }

      // Save map state for this session
      const currentSessionId = data.sessionId || tempSessionId;
      if (finalMarkers.length > 0 && finalCenter) {
        // Save new markers from this response
        saveMapStateForSession(currentSessionId, finalMarkers, finalCenter);
        console.log(`🗺️ Saved NEW map state for session: ${currentSessionId}`, { 
          markers: finalMarkers.length, 
          center: finalCenter 
        });
      } else {
        // No new markers from this response - don't save old markers
        console.log(`🗺️ No new markers for session: ${currentSessionId}, not saving old state`);
      }
    } catch (err: any) {
      console.error("[ChatPage] send error", err);
      // Không chèn tin nhắn lỗi; giữ trạng thái UI sạch sẽ
    } finally {
      setIsBotTyping(false);
      sendingRef.current = false;
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    setSelectedSessionId(sessionId);

    if (!sessionId) {
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
      const session = await ChatService.getChatSession(sessionId);

      if (session && session.messages) {
        // Convert backend messages to frontend format
        const frontendMessages = session.messages.map(
          (msg: any, index: number) => ({
            id: `${sessionId}-${index}`,
            type: msg.role === "user" ? "user" : "bot",
            content: msg.content,
          })
        );
        setMessages(frontendMessages);
        setSessionId(sessionId);
        
        // Load map state for this session
        console.log(`🗺️ 🔄 Switching to session: ${sessionId}`);
        await loadMapStateForSession(sessionId);
        console.log(`🗺️ ✅ Completed loading session: ${sessionId}`);
        
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
          await loadMapStateForSession(sessionId);
          console.log(`🗺️ ✅ Loaded map state from localStorage despite session load failure`);
        } catch (mapError) {
          console.warn("[ChatPage] Could not load map state either:", mapError);
        }
        
        // Try to load messages from localStorage as fallback
        try {
          const localStorageKey = `chat:lastPayload:${sessionId}`;
          const savedPayload = localStorage.getItem(localStorageKey);
          if (savedPayload) {
            const payload = JSON.parse(savedPayload);
            console.log("[ChatPage] Found saved payload for session:", sessionId);
            
            // Create mock messages from payload if available
            const mockMessages = [
              { id: `${sessionId}-0`, type: "user", content: "User message" },
              { id: `${sessionId}-1`, type: "bot", content: "AI response with locations and itinerary" }
            ];
            setMessages(mockMessages);
            setSessionId(sessionId);
            console.log("[ChatPage] Loaded mock messages from localStorage");
          } else {
            // Try to find session info from chat history
            const chatHistoryKey = `chatSessions:${currentUserId}`;
            const savedHistory = localStorage.getItem(chatHistoryKey);
            if (savedHistory) {
              const history = JSON.parse(savedHistory);
              const sessionInfo = history.sessions?.find((s: any) => s.sessionId === sessionId);
              if (sessionInfo) {
                console.log("[ChatPage] Found session info in chat history:", sessionInfo);
                setSessionId(sessionId);
                // Create basic messages from session info
                const basicMessages = [
                  { id: `${sessionId}-0`, type: "user", content: "Previous conversation" },
                  { id: `${sessionId}-1`, type: "bot", content: "AI response with travel suggestions" }
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
          await loadMapStateForSession(sessionId);
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
  const handleMapMarkerClick = useCallback((marker: any) => {
    console.log("Marker clicked:", marker);
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
    const prefs = qpPreferences.join(", ");
    const hints = [
      qpTravelers ? `${qpTravelers} người` : "",
      qpBudget === "save"
        ? "ngân sách tiết kiệm"
        : qpBudget === "premium"
        ? "ngân sách cao cấp"
        : "",
    ]
      .filter(Boolean)
      .join(", ");

    const daysPart = qpDays ? ` trong ${qpDays} ngày` : "";
    const text = `Tôi muốn tạo lịch trình${daysPart} tại ${qpDestination}. Sở thích: ${prefs}.${
      hints ? " Gợi ý thêm: " + hints + "." : ""
    }`;

    if (!qpDestination || qpPreferences.length === 0) {
      // If not enough info, just focus input with template
      setInputValue(text);
      return;
    }

    setInputValue("");
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
    } catch (e) {
      console.warn("[ChatPage] quick plan send error", e);
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
                  <span>Where</span>
                  <button className="qp-close" onClick={() => setQpOpen(null)}>
                    ✕
                  </button>
                </div>
                <input
                  className="qp-modal-input"
                  placeholder="Location"
                  value={qpDestination}
                  onChange={(e) => setQpDestination(e.target.value)}
                />
                <div className="qp-modal-actions">
                  <button
                    className="qp-modal-btn"
                    onClick={() => setQpOpen(null)}
                  >
                    Save
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
                  <span>When</span>
                  <button className="qp-close" onClick={() => setQpOpen(null)}>
                    ✕
                  </button>
                </div>
                <div className="qp-row">
                  <label>Days</label>
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
                    Update
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
                  <span>Who</span>
                  <button className="qp-close" onClick={() => setQpOpen(null)}>
                    ✕
                  </button>
                </div>
                {[
                  { label: "Adults", val: qpAdults, set: setQpAdults },
                  { label: "Children", val: qpChildren, set: setQpChildren },
                  { label: "Infants", val: qpInfants, set: setQpInfants },
                  { label: "Pets", val: qpPets, set: setQpPets },
                ].map((row) => (
                  <div key={row.label} className="qp-counter-row">
                    <div className="qp-counter-label">{row.label}</div>
                    <div className="qp-counter">
                      <button onClick={() => row.set(Math.max(0, row.val - 1))}>
                        –
                      </button>
                      <span>{row.val}</span>
                      <button onClick={() => row.set(row.val + 1)}>+</button>
                    </div>
                  </div>
                ))}
                <div className="qp-modal-actions">
                  <button
                    className="qp-modal-btn"
                    onClick={() => setQpOpen(null)}
                  >
                    Update
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
                  <span>Budget</span>
                  <button className="qp-close" onClick={() => setQpOpen(null)}>
                    ✕
                  </button>
                </div>
                <div className="qp-radio">
                  {[
                    { k: "", l: "Any budget" },
                    { k: "save", l: "$ On a budget" },
                    { k: "balanced", l: "$$ Sensibly priced" },
                    { k: "premium", l: "$$$ Upscale" },
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
                    Update
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
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
