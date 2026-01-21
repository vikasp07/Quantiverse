import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { UserAuth } from "../Auth/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Activity Tracker Component
 * Tracks user activity including:
 * - Session start/end times
 * - Page/screen visit durations
 * - Total time on website
 * - Active vs idle time
 * - Tab visibility changes
 * - Works for both logged-in users
 */
const ActivityTracker = () => {
  const { session } = UserAuth();
  const location = useLocation();
  const user = session?.user;

  // Refs to track timing
  const sessionStartRef = useRef(null);
  const pageStartRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const isActiveRef = useRef(true);
  const currentPageRef = useRef(location.pathname);
  const heartbeatIntervalRef = useRef(null);
  const sessionInitializedRef = useRef(false);
  const sessionIdRef = useRef(null);
  const totalActiveTimeRef = useRef(0);
  const lastHeartbeatTimeRef = useRef(Date.now());

  // Idle timeout (5 minutes)
  const IDLE_TIMEOUT = 5 * 60 * 1000;
  // Heartbeat interval (15 seconds for more accurate tracking)
  const HEARTBEAT_INTERVAL = 15 * 1000;

  // Generate unique session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  };

  // Send activity update to backend
  const sendActivityUpdate = useCallback(
    async (eventType, data = {}) => {
      if (!user?.id) return;

      try {
        const payload = {
          user_id: user.id,
          user_email: user.email,
          user_name:
            user.user_metadata?.display_name || user.email?.split("@")[0],
          event_type: eventType,
          timestamp: new Date().toISOString(),
          page_path: location.pathname,
          session_id: sessionIdRef.current,
          ...data,
        };

        await axios.post(`${API_BASE}/activity/track`, payload);
      } catch (error) {
        console.error("Failed to track activity:", error);
      }
    },
    [user, location.pathname]
  );

  // Track page duration when leaving a page
  const trackPageDuration = useCallback(
    async (pagePath) => {
      if (!user?.id || !pageStartRef.current) return;

      const duration = Math.floor((Date.now() - pageStartRef.current) / 1000); // in seconds

      try {
        await axios.post(`${API_BASE}/activity/page-duration`, {
          user_id: user.id,
          page_path: pagePath,
          duration_seconds: duration,
          started_at: new Date(pageStartRef.current).toISOString(),
          ended_at: new Date().toISOString(),
          session_id: sessionIdRef.current,
        });
      } catch (error) {
        console.error("Failed to track page duration:", error);
      }
    },
    [user]
  );

  // Calculate active time since last heartbeat
  const calculateActiveTime = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;

    // If user has been active (activity within idle timeout)
    if (timeSinceLastActivity < IDLE_TIMEOUT && isActiveRef.current) {
      const timeSinceLastHeartbeat = now - lastHeartbeatTimeRef.current;
      totalActiveTimeRef.current += Math.floor(timeSinceLastHeartbeat / 1000);
    }

    lastHeartbeatTimeRef.current = now;
    return totalActiveTimeRef.current;
  }, []);

  // Initialize session tracking
  useEffect(() => {
    if (!user?.id || sessionInitializedRef.current) return;

    sessionInitializedRef.current = true;

    // Generate new session ID
    sessionIdRef.current = generateSessionId();

    // Start session
    sessionStartRef.current = Date.now();
    pageStartRef.current = Date.now();
    lastHeartbeatTimeRef.current = Date.now();
    totalActiveTimeRef.current = 0;

    sendActivityUpdate("session_start", {
      session_started_at: new Date().toISOString(),
      session_id: sessionIdRef.current,
      user_agent: navigator.userAgent,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    // Setup heartbeat to track active time
    heartbeatIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      const sessionDuration = Math.floor(
        (now - sessionStartRef.current) / 1000
      );
      const activeTime = calculateActiveTime();

      if (timeSinceLastActivity < IDLE_TIMEOUT && isActiveRef.current) {
        sendActivityUpdate("heartbeat", {
          is_active: true,
          session_duration: sessionDuration,
          active_time: activeTime,
          current_page: currentPageRef.current,
          session_id: sessionIdRef.current,
        });
      } else {
        // User is idle
        if (isActiveRef.current) {
          isActiveRef.current = false;
          sendActivityUpdate("user_idle", {
            session_duration: sessionDuration,
            active_time: activeTime,
            idle_started_at: new Date().toISOString(),
            session_id: sessionIdRef.current,
          });
        }
      }
    }, HEARTBEAT_INTERVAL);

    // Handle visibility change (tab switch, minimize)
    const handleVisibilityChange = () => {
      const sessionDuration = Math.floor(
        (Date.now() - sessionStartRef.current) / 1000
      );

      sendActivityUpdate("visibility_change", {
        visibility_state: document.visibilityState,
        timestamp: new Date().toISOString(),
        session_duration: sessionDuration,
        session_id: sessionIdRef.current,
      });

      if (document.visibilityState === "visible") {
        // User came back, resume tracking
        lastActivityRef.current = Date.now();
        lastHeartbeatTimeRef.current = Date.now();
        isActiveRef.current = true;

        sendActivityUpdate("user_returned", {
          session_duration: sessionDuration,
          session_id: sessionIdRef.current,
        });
      } else {
        // User switched away - record current page duration
        if (currentPageRef.current && pageStartRef.current) {
          trackPageDuration(currentPageRef.current);
          pageStartRef.current = Date.now(); // Reset for when they return
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Handle beforeunload - session end
    const handleBeforeUnload = () => {
      // Track final page duration
      if (currentPageRef.current && sessionStartRef.current) {
        const duration = Math.floor((Date.now() - pageStartRef.current) / 1000);
        const sessionDuration = Math.floor(
          (Date.now() - sessionStartRef.current) / 1000
        );
        const activeTime = calculateActiveTime();

        // Use sendBeacon for reliable delivery on page unload
        const data = JSON.stringify({
          user_id: user.id,
          user_email: user.email,
          user_name:
            user.user_metadata?.display_name || user.email?.split("@")[0],
          event_type: "session_end",
          timestamp: new Date().toISOString(),
          session_duration: sessionDuration,
          active_time: activeTime,
          last_page: currentPageRef.current,
          last_page_duration: duration,
          session_id: sessionIdRef.current,
          ended_reason: "page_unload",
        });
        navigator.sendBeacon(`${API_BASE}/activity/session-end`, data);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Also handle pagehide for mobile browsers
    window.addEventListener("pagehide", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);

      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      // Send session end on component unmount (logout, navigation away from protected routes)
      if (sessionStartRef.current && user?.id) {
        const sessionDuration = Math.floor(
          (Date.now() - sessionStartRef.current) / 1000
        );
        const activeTime = calculateActiveTime();

        sendActivityUpdate("session_end", {
          session_duration: sessionDuration,
          active_time: activeTime,
          session_id: sessionIdRef.current,
          ended_reason: "component_unmount",
        });
      }

      sessionInitializedRef.current = false;
      sessionIdRef.current = null;
    };
  }, [user?.id, sendActivityUpdate, calculateActiveTime, trackPageDuration]);

  // Track page changes
  useEffect(() => {
    if (!user?.id) return;

    const previousPage = currentPageRef.current;

    // Track duration of previous page
    if (
      previousPage &&
      previousPage !== location.pathname &&
      pageStartRef.current
    ) {
      trackPageDuration(previousPage);
    }

    // Start tracking new page
    currentPageRef.current = location.pathname;
    pageStartRef.current = Date.now();

    sendActivityUpdate("page_view", {
      page_path: location.pathname,
      previous_page: previousPage,
      session_id: sessionIdRef.current,
      page_title: document.title,
    });
  }, [location.pathname, user?.id, sendActivityUpdate, trackPageDuration]);

  // Track user activity (mouse, keyboard, scroll)
  useEffect(() => {
    if (!user?.id) return;

    const updateActivity = () => {
      const wasIdle = !isActiveRef.current;
      lastActivityRef.current = Date.now();

      if (wasIdle) {
        isActiveRef.current = true;
        sendActivityUpdate("activity_resume", {
          session_id: sessionIdRef.current,
          resumed_at: new Date().toISOString(),
        });
      }
    };

    const events = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "mousemove",
      "click",
    ];

    // Throttle the activity updates
    let throttleTimer = null;
    const throttledUpdate = () => {
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          updateActivity();
          throttleTimer = null;
        }, 1000);
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, throttledUpdate, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, throttledUpdate);
      });
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [user?.id, sendActivityUpdate]);

  // This component doesn't render anything
  return null;
};

export default ActivityTracker;
