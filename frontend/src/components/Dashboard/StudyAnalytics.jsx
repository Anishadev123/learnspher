"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Flame,
  TrendingUp,
  BrainCircuit,
  BookOpen,
  ExternalLink,
  Loader2,
  BarChart3,
} from "lucide-react";
import { getAuth } from "firebase/auth";
import WeeklyChart from "./WeeklyChart";
import "./StudyAnalytics.css";

const TRACKING_API = "http://localhost:8080/api/tracking";

/**
 * Format seconds to human-readable time
 */
function formatTime(seconds) {
  if (!seconds || seconds < 60) return "0m";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  if (hrs > 0) return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  return `${mins}m`;
}

export default function StudyAnalytics() {
  const [todayStats, setTodayStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        const userId = user.uid;

        const [todayRes, weeklyRes, streakRes] = await Promise.allSettled([
          fetch(`${TRACKING_API}/today/${userId}`).then((r) => r.json()),
          fetch(`${TRACKING_API}/stats/${userId}`).then((r) => r.json()),
          fetch(`${TRACKING_API}/streak/${userId}`).then((r) => r.json()),
        ]);

        if (todayRes.status === "fulfilled" && todayRes.value.ok) {
          setTodayStats(todayRes.value);
        }
        if (weeklyRes.status === "fulfilled" && weeklyRes.value.ok) {
          setWeeklyStats(weeklyRes.value);
        }
        if (streakRes.status === "fulfilled" && streakRes.value.ok) {
          setStreak(streakRes.value);
        }
      } catch (err) {
        console.error("Failed to fetch study analytics:", err);
        setError("Could not load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Refresh every 30 seconds (matches auto-save interval)
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="analytics-container">
        <div className="analytics-header">
          <BarChart3 size={20} className="analytics-icon" />
          <h2 className="analytics-title">Your Study Insights</h2>
        </div>
        <div className="analytics-loading">
          <Loader2 size={20} className="spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  // Empty state — no data yet
  const hasAnyData =
    todayStats?.totalTime > 0 ||
    weeklyStats?.weekTotal?.totalTime > 0 ||
    streak?.streak > 0;

  if (!hasAnyData && !error) {
    return (
      <div className="analytics-container">
        <div className="analytics-header">
          <BarChart3 size={20} className="analytics-icon" />
          <h2 className="analytics-title">Your Study Insights</h2>
        </div>
        <div className="analytics-empty">
          <div className="empty-icon-wrapper">
            <BrainCircuit size={32} />
          </div>
          <p className="empty-title">No study data yet</p>
          <p className="empty-desc">
            Open a notebook in AI Studio and start chatting to track your study
            time automatically.
          </p>
        </div>
      </div>
    );
  }

  const todayTotal = todayStats?.totalTime || 0;
  const todayScore = todayStats?.avgScore || 0;
  const currentStreak = streak?.streak || 0;

  // Break down time by page type from weekly stats
  const weekTotal = weeklyStats?.weekTotal || {};

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <BarChart3 size={20} className="analytics-icon" />
        <h2 className="analytics-title">Your Study Insights</h2>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="stat-card stat-today">
          <div className="stat-card-icon-wrapper stat-icon-clock">
            <Clock size={18} />
          </div>
          <div className="stat-card-body">
            <p className="stat-card-label">Today</p>
            <p className="stat-card-value">{formatTime(todayTotal)}</p>
            {todayStats?.sessionCount > 0 && (
              <p className="stat-card-sub">
                {todayStats.sessionCount} session
                {todayStats.sessionCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        <div className="stat-card stat-streak">
          <div className="stat-card-icon-wrapper stat-icon-flame">
            <Flame size={18} />
          </div>
          <div className="stat-card-body">
            <p className="stat-card-label">Streak</p>
            <p className="stat-card-value">
              <span className="flame-emoji">🔥</span> {currentStreak} day
              {currentStreak !== 1 ? "s" : ""}
            </p>
            {streak?.totalDays > 0 && (
              <p className="stat-card-sub">
                {streak.totalDays} days total
              </p>
            )}
          </div>
        </div>

        <div className="stat-card stat-score">
          <div className="stat-card-icon-wrapper stat-icon-trend">
            <TrendingUp size={18} />
          </div>
          <div className="stat-card-body">
            <p className="stat-card-label">Score</p>
            <p className="stat-card-value">{todayScore}/100</p>
            <div className="score-bar-mini">
              <div
                className="score-bar-fill"
                style={{ width: `${todayScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      {weeklyStats?.daily && (
        <div className="analytics-section">
          <h3 className="section-title">Weekly Activity</h3>
          <WeeklyChart daily={weeklyStats.daily} />
        </div>
      )}

      {/* Time Breakdown */}
      <div className="analytics-section time-breakdown">
        <h3 className="section-title">Time Breakdown</h3>
        <div className="breakdown-items">
          <div className="breakdown-item">
            <div className="breakdown-icon-wrap">
              <BrainCircuit size={16} />
            </div>
            <span className="breakdown-label">AI Studio</span>
            <span className="breakdown-value">
              {formatTime(weekTotal.inAppTime || 0)}
            </span>
          </div>
          <div className="breakdown-item">
            <div className="breakdown-icon-wrap">
              <BookOpen size={16} />
            </div>
            <span className="breakdown-label">Study Materials</span>
            <span className="breakdown-value">
              {formatTime(todayStats?.inAppTime || 0)}
            </span>
          </div>
          <div className="breakdown-item">
            <div className="breakdown-icon-wrap">
              <ExternalLink size={16} />
            </div>
            <span className="breakdown-label">External (est.)</span>
            <span className="breakdown-value">
              {formatTime(weekTotal.externalTime || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Activity Highlights for today */}
      {todayStats && (todayStats.messagesAsked > 0 || todayStats.sourcesOpened > 0 || todayStats.notesWritten > 0) && (
        <div className="analytics-section activity-highlights">
          <h3 className="section-title">Today's Activity</h3>
          <div className="activity-badges">
            {todayStats.messagesAsked > 0 && (
              <div className="activity-badge">
                💬 {todayStats.messagesAsked} questions
              </div>
            )}
            {todayStats.sourcesOpened > 0 && (
              <div className="activity-badge">
                📂 {todayStats.sourcesOpened} sources
              </div>
            )}
            {todayStats.notesWritten > 0 && (
              <div className="activity-badge">
                📝 {todayStats.notesWritten} notes
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
