"use client";

import { useEffect, useState } from "react";
import { FaCalendarAlt, FaHourglassHalf, FaMapMarkerAlt } from "react-icons/fa";
import { DN_JOURNEY_PROGRESS, type DnJourneyProgress } from "./data";

/**
 * Journey progress card with animated bar, axis labels, and waited/remaining stats.
 *
 * Sample reference: `.progress-section` in `samples/pr-tracker-redesign.html`.
 */
export function DashboardPprBar({
  journey = DN_JOURNEY_PROGRESS,
}: {
  journey?: DnJourneyProgress;
} = {}) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const id = globalThis.setTimeout(() => setProgress(journey.progressPct), 400);
    return () => globalThis.clearTimeout(id);
  }, [journey.progressPct]);

  return (
    <div className="progress-section">
      <div className="section-title">
        <FaMapMarkerAlt className="section-title-icon" aria-hidden />
        {journey.title}
      </div>
      <div className="section-note">{journey.subtitle}</div>
      <div className="progress-bar-wrap">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress-labels">
        {journey.axisLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="pbar-stats">
        <div className="pbar-stat">
          <div className="pbar-stat-icon teal">
            <FaCalendarAlt aria-hidden />
          </div>
          <div>
            <div className="pbar-stat-label">{journey.daysWaited.label}</div>
            <div className="pbar-stat-val">{journey.daysWaited.value}</div>
          </div>
        </div>
        <div className="pbar-stat">
          <div className="pbar-stat-icon amber">
            <FaHourglassHalf aria-hidden />
          </div>
          <div>
            <div className="pbar-stat-label">{journey.daysRemaining.label}</div>
            <div className="pbar-stat-val">{journey.daysRemaining.value}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
