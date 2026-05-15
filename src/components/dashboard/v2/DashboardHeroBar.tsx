"use client";

import { useEffect, useState } from "react";
import { DN_HERO_STATS, type DnHeroStats } from "./data";

/**
 * Navy hero band: animated days-since-AOR counter + three inline KPI stats
 * (typical wait, queue position, expected approval window).
 *
 * Sample reference: `.day-hero` in `samples/pr-tracker-redesign.html`.
 */
export function DashboardHeroBar({
  stats = DN_HERO_STATS,
}: {
  stats?: DnHeroStats;
} = {}) {
  const target = stats.daysSinceAor;
  const [days, setDays] = useState(0);

  useEffect(() => {
    let frame = 0;
    let n = 0;
    let cancelled = false;
    const step = () => {
      if (cancelled) return;
      n = Math.min(n + 3, target);
      setDays(n);
      if (n < target) frame = requestAnimationFrame(step);
    };
    const id = window.setTimeout(() => {
      frame = requestAnimationFrame(step);
    }, 150);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target]);

  return (
    <div className="day-hero">
      <div className="day-big">
        <div className="day-num">{days}</div>
        <div className="day-sub">
          Days since
          <br />
          you applied
        </div>
      </div>
      <div className="hero-stat">
        <div className="hs-label">Typical wait in your group</div>
        <div className="hs-val warn">{stats.typicalWait.value}</div>
        <div className="hs-note">{stats.typicalWait.note}</div>
      </div>
      <div className="hero-stat">
        <div className="hs-label">Your position in the queue</div>
        <div className={`hs-val ${stats.queuePosition.tone}`}>
          {stats.queuePosition.value}
        </div>
        <div className="hs-note">{stats.queuePosition.note}</div>
      </div>
      <div className="hero-stat">
        <div className="hs-label">Expected approval around</div>
        <div className="hs-val approval">{stats.expectedApproval.value}</div>
        <div className="hs-note">{stats.expectedApproval.note}</div>
      </div>
    </div>
  );
}
