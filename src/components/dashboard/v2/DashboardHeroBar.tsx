"use client";

import { useEffect, useState } from "react";
import { DN_HERO_STATS, type DnHeroStats } from "./data";

/**
 * Hero band at the top of <main>: animated days-since-AOR counter +
 * three KPI cards (stream median, cohort rank, estimated PPR window).
 *
 * Sample reference: `.hero-bar` block in `aortrack-dashboard.html`.
 *
 * Pass `stats` to override the seed values — `/dashboard` derives this from
 * `useDashboard()` (days, cohortDisplay.median_days_to_ppr, cohort-rank
 * derivation and `ppr.windowLabel`); the `/dashboard-new` preview route
 * falls back to `DN_HERO_STATS`.
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
    <div className="hero-bar">
      <div className="days-box">
        <div>
          <div className="days-n">{days}</div>
          <div className="days-lbl">Days Since AOR</div>
          <div className="days-since">{stats.daysSinceLabel}</div>
        </div>
      </div>
      <div className="stat-grid">
        <div className="s-card">
          <div className="s-lbl">Stream Median</div>
          <div className="s-val">{stats.streamMedian.value}</div>
          <div className="s-sub">
            <span
              className={stats.streamMedian.deltaDir === "up" ? "up" : "dn"}
            >
              {stats.streamMedian.deltaDir === "up" ? "↑" : "↓"}{" "}
              {stats.streamMedian.deltaLabel}
            </span>
            &nbsp;this week
          </div>
        </div>
        <div className="s-card">
          <div className="s-lbl">Cohort Rank</div>
          <div className="s-val amber">{stats.cohortRank.value}</div>
          <div className="s-sub">{stats.cohortRank.sub}</div>
        </div>
        <div className="s-card">
          <div className="s-lbl">Est. PPR Window</div>
          <div className="s-val green sm">{stats.pprWindow.value}</div>
          <div className="s-sub">{stats.pprWindow.sub}</div>
        </div>
      </div>
    </div>
  );
}
