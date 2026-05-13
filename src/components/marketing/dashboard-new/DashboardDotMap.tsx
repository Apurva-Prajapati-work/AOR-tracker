"use client";

import { useMemo } from "react";
import { DN_DOT_MAP, DN_PROFILE } from "./data";

/**
 * 500-applicant dot grid. Each dot represents one applicant in the cohort
 * sample, colored by their current stage. The "you" dot is highlighted.
 *
 * Sample reference: `.dotmap-card` block in `aortrack-dashboard.html`.
 *
 * Note: rendering 500 nodes once on mount is negligible (<1ms in dev). We
 * memoise just to avoid the work on re-render.
 */
export function DashboardDotMap() {
  const dots = useMemo(() => {
    const { total, pprUpTo, midUpTo, youIndex } = DN_DOT_MAP;
    return Array.from({ length: total }, (_, i) => {
      if (i === youIndex) {
        return { cls: "dm you", title: `You — Applicant ${DN_PROFILE.applicantId}` };
      }
      if (i < pprUpTo) return { cls: "dm ppr", title: "PPR received" };
      if (i < midUpTo) return { cls: "dm mid", title: "BGC / Medical" };
      return { cls: "dm early", title: "AOR – Biometrics" };
    });
  }, []);

  return (
    <div className="dotmap-card">
      <div className="sec-head" style={{ marginBottom: 0 }}>
        <div>
          <div className="sec-title" style={{ fontSize: ".92rem" }}>
            Cohort Dot Map — 500 sampled
          </div>
          <div className="sec-sub">
            <span style={{ color: "var(--red)", fontWeight: 700 }}>
              Red dot = You
            </span>{" "}
            · Each dot = one applicant
          </div>
        </div>
      </div>
      <div className="dm-grid">
        {dots.map((d, i) => (
          <div key={i} className={d.cls} title={d.title} />
        ))}
      </div>
      <div className="dm-legend">
        <div className="dl">
          <div className="dl-d" style={{ background: "var(--green)" }} />
          PPR received (482)
        </div>
        <div className="dl">
          <div
            className="dl-d"
            style={{ background: "var(--blue)", opacity: 0.8 }}
          />
          BGC / Medical (362)
        </div>
        <div className="dl">
          <div
            className="dl-d"
            style={{ background: "var(--navy2)", opacity: 0.5 }}
          />
          AOR – Biometrics (395)
        </div>
        <div className="dl">
          <div className="dl-d you" />
          You
        </div>
      </div>
    </div>
  );
}
