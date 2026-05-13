"use client";

import { useEffect, useState } from "react";
import { DN_RINGS, type DnRing } from "./data";

const CIRCUMFERENCE = 2 * Math.PI * 28;

function Ring({ ring }: { ring: DnRing }) {
  const [animatedPct, setAnimatedPct] = useState(0);
  const offset = CIRCUMFERENCE * (1 - animatedPct);

  useEffect(() => {
    const id = window.setTimeout(() => setAnimatedPct(ring.pct), 300);
    return () => window.clearTimeout(id);
  }, [ring.pct]);

  return (
    <div className="ring-card">
      <div className="ring-svg-wrap">
        <svg width="68" height="68" viewBox="0 0 68 68">
          <defs>
            <linearGradient id={ring.gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={ring.gradientFrom} />
              <stop offset="100%" stopColor={ring.gradientTo} />
            </linearGradient>
          </defs>
          <circle className="r-bg" cx="34" cy="34" r="28" />
          <circle
            className="r-fill"
            cx="34"
            cy="34"
            r="28"
            stroke={`url(#${ring.gradientId})`}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <div
          className="ring-num"
          style={ring.numColor ? { color: ring.numColor } : undefined}
        >
          {ring.pctLabel}
        </div>
      </div>
      <div>
        <div className="ring-info-title">{ring.title}</div>
        <div className="ring-info-sub">{ring.sub}</div>
      </div>
    </div>
  );
}

/**
 * Two animated SVG progress rings: Journey Progress + Cohort PPR Rate.
 *
 * Sample reference: `.rings-row` in `aortrack-dashboard.html`.
 */
export function DashboardRings() {
  return (
    <div className="rings-row">
      {DN_RINGS.map((r) => (
        <Ring key={r.id} ring={r} />
      ))}
    </div>
  );
}
