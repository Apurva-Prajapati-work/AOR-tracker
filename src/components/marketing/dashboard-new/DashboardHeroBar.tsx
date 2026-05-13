"use client";

import { useEffect, useState } from "react";
import { DN_HERO_STATS } from "./data";

/**
 * Hero band at the top of <main>: animated days-since-AOR counter +
 * three KPI cards (stream median, cohort rank, estimated PPR window).
 *
 * Sample reference: `.hero-bar` block in `aortrack-dashboard.html`.
 *
 * TODO(dashboard-new): swap the static values for live data from
 * `useDashboard()` — specifically `days`, `cohortDisplay.median_days_to_ppr`,
 * the cohort-rank derivation and `ppr.windowLabel`.
 */
export function DashboardHeroBar() {
  const target = DN_HERO_STATS.daysSinceAor;
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
          <div className="days-since">{DN_HERO_STATS.daysSinceLabel}</div>
        </div>
      </div>
      <div className="stat-grid">
        <div className="s-card">
          <div className="s-lbl">Stream Median</div>
          <div className="s-val">{DN_HERO_STATS.streamMedian.value}</div>
          <div className="s-sub">
            <span
              className={
                DN_HERO_STATS.streamMedian.deltaDir === "up" ? "up" : "dn"
              }
            >
              {DN_HERO_STATS.streamMedian.deltaDir === "up" ? "↑" : "↓"}{" "}
              {DN_HERO_STATS.streamMedian.deltaLabel}
            </span>
            &nbsp;this week
          </div>
        </div>
        <div className="s-card">
          <div className="s-lbl">Cohort Rank</div>
          <div className="s-val amber">{DN_HERO_STATS.cohortRank.value}</div>
          <div className="s-sub">{DN_HERO_STATS.cohortRank.sub}</div>
        </div>
        <div className="s-card">
          <div className="s-lbl">Est. PPR Window</div>
          <div className="s-val green sm">{DN_HERO_STATS.pprWindow.value}</div>
          <div className="s-sub">{DN_HERO_STATS.pprWindow.sub}</div>
        </div>
      </div>
    </div>
  );
}
