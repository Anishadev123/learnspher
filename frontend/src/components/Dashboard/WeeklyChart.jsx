"use client";

import "./WeeklyChart.css";

/**
 * WeeklyChart — Pure CSS bar chart showing 7-day study breakdown
 * Props:
 *   daily: [{ day, inAppTime, externalTime, idleTime, totalTime }]
 */
export default function WeeklyChart({ daily = [] }) {
  if (!daily.length) return null;

  // Find max totalTime across days for scaling
  const maxTime = Math.max(...daily.map(d => d.inAppTime + d.externalTime), 1);

  const formatTime = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
  };

  return (
    <div className="weekly-chart">
      <div className="chart-bars">
        {daily.map((d, i) => {
          const inAppH = maxTime > 0 ? (d.inAppTime / maxTime) * 100 : 0;
          const extH = maxTime > 0 ? (d.externalTime / maxTime) * 100 : 0;
          const total = d.inAppTime + d.externalTime;
          const isToday = i === daily.length - 1;

          return (
            <div key={d.date || i} className={`chart-bar-col ${isToday ? 'today' : ''}`}>
              <div className="bar-tooltip">{formatTime(total)}</div>
              <div className="bar-stack" style={{ height: '120px' }}>
                <div
                  className="bar-segment bar-idle"
                  style={{ height: `${Math.max(extH, 0)}%` }}
                />
                <div
                  className="bar-segment bar-inapp"
                  style={{ height: `${Math.max(inAppH, 0)}%` }}
                />
              </div>
              <span className="bar-label">{d.day}</span>
            </div>
          );
        })}
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-dot legend-inapp" />
          In-App
        </div>
        <div className="legend-item">
          <span className="legend-dot legend-external" />
          External
        </div>
      </div>
    </div>
  );
}
