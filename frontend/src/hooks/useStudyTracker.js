import { useEffect, useRef, useCallback, useState } from 'react';
import { getAuth } from 'firebase/auth';

const TRACKING_API = 'http://localhost:8080/api/tracking';

/**
 * useStudyTracker — Passive study time tracking hook
 * 
 * Tracks:
 * - In-app active time (pauses when tab hidden)
 * - External resource time (YouTube/website click → return signal)
 * - Idle time (tab hidden without external click)
 * - Activity signals (messages, notes, sources, summaries)
 * 
 * Usage:
 *   const tracker = useStudyTracker({ page: 'ai_studio', notebookId: '...' });
 *   tracker.logActivity('message');
 *   tracker.logExternalClick('youtube', 'https://youtube.com/...');
 *   // tracker.elapsed — reactive seconds counter
 *   // tracker.activityCounts — reactive activity counts
 *   // tracker.activityLog — reactive log of recent events
 */
export default function useStudyTracker({ page = 'ai_studio', notebookId = null, materialId = null } = {}) {
  const startedAt = useRef(new Date());
  const inAppTime = useRef(0);
  const externalTime = useRef(0);
  const idleTime = useRef(0);
  const lastTick = useRef(Date.now());
  const isVisible = useRef(true);
  const timerRef = useRef(null);

  // External click tracking
  const externalClickPending = useRef(false);
  const externalClickData = useRef(null);
  const externalLeftAt = useRef(null);

  // Activity counters
  const activities = useRef({
    messagesAsked: 0,
    sourcesOpened: 0,
    notesWritten: 0,
    summariesGenerated: 0,
    studyGuidesViewed: 0,
    externalClicks: []
  });

  // Has session been flushed?
  const flushed = useRef(false);

  // ─── Reactive state for UI display ───
  const [elapsed, setElapsed] = useState(0);
  const [activityCounts, setActivityCounts] = useState({
    messagesAsked: 0,
    sourcesOpened: 0,
    notesWritten: 0,
    summariesGenerated: 0,
    studyGuidesViewed: 0
  });
  const [activityLog, setActivityLog] = useState([]);
  const [isTracking, setIsTracking] = useState(true);

  // ─── Calculate productivity score ───
  const calculateScore = useCallback(() => {
    const totalInApp = inAppTime.current;
    const act = activities.current;

    // Base score from time
    let base = 0;
    if (totalInApp >= 3600) base = 45;
    else if (totalInApp >= 1800) base = 35;
    else if (totalInApp >= 900) base = 20;
    else if (totalInApp >= 300) base = 10;

    // Engagement bonus
    const messageBonus = Math.min(act.messagesAsked * 3, 15);
    const sourceBonus = Math.min(act.sourcesOpened * 2, 10);
    const noteBonus = Math.min(act.notesWritten * 5, 15);
    const summaryBonus = Math.min((act.summariesGenerated + act.studyGuidesViewed) * 5, 10);
    const externalBonus = Math.min(act.externalClicks.length * 2, 6);

    // Idle penalty
    const totalSession = inAppTime.current + externalTime.current + idleTime.current;
    const idlePenalty = totalSession > 0 && (idleTime.current / totalSession) > 0.5 ? 10 : 0;

    return Math.max(0, Math.min(100, base + messageBonus + sourceBonus + noteBonus + summaryBonus + externalBonus - idlePenalty));
  }, []);

  // ─── Flush session to backend ───
  const flushSession = useCallback(async () => {
    if (flushed.current) return;
    flushed.current = true;

    const totalTime = inAppTime.current + externalTime.current;
    if (totalTime < 30) return; // Skip very short sessions

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const payload = {
      userId: user.uid,
      notebookId,
      materialId,
      startedAt: startedAt.current.toISOString(),
      endedAt: new Date().toISOString(),
      inAppTime: inAppTime.current,
      externalTime: externalTime.current,
      idleTime: idleTime.current,
      totalTime,
      activities: activities.current,
      productivityScore: calculateScore(),
      page
    };

    try {
      // Use sendBeacon for reliability on page close
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      const sent = navigator.sendBeacon(`${TRACKING_API}/session`, blob);
      if (!sent) {
        // Fallback to fetch
        await fetch(`${TRACKING_API}/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        });
      }
      console.log(`📊 Study session flushed: ${Math.round(totalTime)}s`);
    } catch (err) {
      console.error('📊 Failed to flush study session:', err);
    }
  }, [notebookId, materialId, page, calculateScore]);

  // ─── Timer tick (every second) ───
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTick.current) / 1000;
      lastTick.current = now;

      if (isVisible.current) {
        inAppTime.current += delta;
        setElapsed(Math.floor(inAppTime.current));
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ─── Visibility change handler ───
  useEffect(() => {
    const handleVisibility = () => {
      const now = Date.now();

      if (document.hidden) {
        // Tab became hidden
        isVisible.current = false;
        setIsTracking(false);

        if (externalClickPending.current) {
          // User clicked an external link → record when they left
          externalLeftAt.current = now;
        }
      } else {
        // Tab became visible again
        const hiddenDuration = externalLeftAt.current ? (now - externalLeftAt.current) / 1000 : 0;

        if (externalClickPending.current && externalLeftAt.current) {
          // User returned from external resource
          const duration = Math.round(hiddenDuration);
          externalTime.current += duration;

          // Record the external click
          if (externalClickData.current) {
            activities.current.externalClicks.push({
              ...externalClickData.current,
              leftAt: new Date(externalLeftAt.current).toISOString(),
              returnedAt: new Date(now).toISOString(),
              duration
            });
          }

          setActivityLog(prev => [...prev.slice(-19), {
            type: 'external_return',
            label: `Returned from ${externalClickData.current?.type || 'external'} (${duration}s)`,
            icon: '🔗',
            time: new Date()
          }]);

          console.log(`📊 External resource time: ${duration}s (${externalClickData.current?.type})`);

          // Reset
          externalClickPending.current = false;
          externalClickData.current = null;
          externalLeftAt.current = null;
        } else if (hiddenDuration > 0) {
          // Tab was hidden but no external click → idle time
          idleTime.current += hiddenDuration;
        }

        isVisible.current = true;
        setIsTracking(true);
        lastTick.current = now;
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // ─── Flush on unmount / page close ───
  useEffect(() => {
    const handleBeforeUnload = () => flushSession();
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      flushSession();
    };
  }, [flushSession]);

  // ─── Public API ───
  const logActivity = useCallback((type) => {
    const iconMap = {
      message: '💬',
      source: '📂',
      note: '📝',
      summary: '📄',
      guide: '📚'
    };
    const labelMap = {
      message: 'Question asked',
      source: 'Source opened',
      note: 'Note saved',
      summary: 'Summary generated',
      guide: 'Study guide viewed'
    };

    switch (type) {
      case 'message':
        activities.current.messagesAsked += 1;
        break;
      case 'source':
        activities.current.sourcesOpened += 1;
        break;
      case 'note':
        activities.current.notesWritten += 1;
        break;
      case 'summary':
        activities.current.summariesGenerated += 1;
        break;
      case 'guide':
        activities.current.studyGuidesViewed += 1;
        break;
    }

    // Update reactive state
    setActivityCounts({ ...activities.current });
    setActivityLog(prev => [...prev.slice(-19), {
      type,
      label: labelMap[type] || type,
      icon: iconMap[type] || '📊',
      time: new Date()
    }]);

    console.log(`📊 Activity logged: ${type}`);
  }, []);

  const logExternalClick = useCallback((type, url) => {
    externalClickPending.current = true;
    externalClickData.current = { type, url };

    setActivityLog(prev => [...prev.slice(-19), {
      type: 'external_click',
      label: `Opened ${type}: ${url?.substring(0, 40) || ''}...`,
      icon: '🔗',
      time: new Date()
    }]);

    console.log(`📊 External click pending: ${type} → ${url}`);
  }, []);

  return {
    logActivity,
    logExternalClick,
    // Reactive state for UI
    elapsed,
    activityCounts,
    activityLog,
    isTracking,
    calculateScore
  };
}
