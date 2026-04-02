import { useState } from "react";
import { ChevronUp, X } from "lucide-react";
import "./StudyTrackerWidget.css";

/**
 * Format seconds to HH:MM:SS
 */
function formatTimer(totalSeconds) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Format time for feed items (HH:MM:SS AM/PM)
 */
function formatFeedTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function StudyTrackerWidget({ tracker }) {
  const [expanded, setExpanded] = useState(false);

  if (!tracker) return null;

  const {
    elapsed = 0,
    activityCounts = {},
    activityLog = [],
    isTracking = true,
    calculateScore,
  } = tracker;

  const score = calculateScore ? calculateScore() : 0;
  const totalActivities =
    (activityCounts.messagesAsked || 0) +
    (activityCounts.sourcesOpened || 0) +
    (activityCounts.notesWritten || 0) +
    (activityCounts.summariesGenerated || 0) +
    (activityCounts.studyGuidesViewed || 0);

  return (
    <div className="tracker-widget" id="study-tracker-widget">
      {/* Expanded Panel */}
      {expanded && (
        <div className="tracker-panel">
          {/* Header */}
          <div className="tracker-panel-header">
            <div className="tracker-panel-title">
              <h3>📊 Study Tracker</h3>
              <span className={`tracker-status ${!isTracking ? "paused" : ""}`}>
                {isTracking ? "● LIVE" : "⏸ PAUSED"}
              </span>
            </div>
            <button
              className="tracker-close-btn"
              onClick={() => setExpanded(false)}
              title="Close panel"
            >
              <X size={16} />
            </button>
          </div>

          {/* Live Timer */}
          <div className="tracker-live-timer">
            <div className="tracker-timer-display">{formatTimer(elapsed)}</div>
            <div className="tracker-timer-label">Active Study Time</div>
          </div>

          {/* Activity Stats */}
          <div className="tracker-stats-row">
            <div className="tracker-stat-item">
              <span className="tracker-stat-icon">💬</span>
              <span className="tracker-stat-value">
                {activityCounts.messagesAsked || 0}
              </span>
              <span className="tracker-stat-label">Questions</span>
            </div>
            <div className="tracker-stat-item">
              <span className="tracker-stat-icon">📂</span>
              <span className="tracker-stat-value">
                {activityCounts.sourcesOpened || 0}
              </span>
              <span className="tracker-stat-label">Sources</span>
            </div>
            <div className="tracker-stat-item">
              <span className="tracker-stat-icon">📝</span>
              <span className="tracker-stat-value">
                {activityCounts.notesWritten || 0}
              </span>
              <span className="tracker-stat-label">Notes</span>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="tracker-feed">
            <div className="tracker-feed-title">Activity Feed</div>
            {activityLog.length === 0 ? (
              <div className="tracker-feed-empty">
                Start chatting, opening sources, or writing notes to see activity here...
              </div>
            ) : (
              [...activityLog].reverse().map((entry, i) => (
                <div className="tracker-feed-item" key={i}>
                  <span className="tracker-feed-icon">{entry.icon}</span>
                  <span className="tracker-feed-text">{entry.label}</span>
                  <span className="tracker-feed-time">
                    {formatFeedTime(entry.time)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Score Bar */}
          <div className="tracker-score-section">
            <div className="tracker-score-header">
              <span className="tracker-score-label">Productivity Score</span>
              <span className="tracker-score-value">{score}/100</span>
            </div>
            <div className="tracker-score-bar">
              <div
                className="tracker-score-fill"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Pill (always visible) */}
      <div
        className={`tracker-pill ${isTracking ? "active" : ""}`}
        onClick={() => setExpanded(!expanded)}
        title="Study Tracker — Click to expand"
      >
        <div className={`tracker-dot ${!isTracking ? "paused" : ""}`} />
        <span className="tracker-time">{formatTimer(elapsed)}</span>

        {totalActivities > 0 && (
          <div className="tracker-badge-row">
            {(activityCounts.messagesAsked || 0) > 0 && (
              <span className="tracker-mini-badge">
                <span>💬</span> {activityCounts.messagesAsked}
              </span>
            )}
            {(activityCounts.notesWritten || 0) > 0 && (
              <span className="tracker-mini-badge">
                <span>📝</span> {activityCounts.notesWritten}
              </span>
            )}
            {(activityCounts.sourcesOpened || 0) > 0 && (
              <span className="tracker-mini-badge">
                <span>📂</span> {activityCounts.sourcesOpened}
              </span>
            )}
          </div>
        )}

        <button
          className="tracker-expand-btn"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          title={expanded ? "Collapse" : "Expand"}
        >
          <ChevronUp
            size={14}
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.2s ease",
            }}
          />
        </button>
      </div>
    </div>
  );
}
