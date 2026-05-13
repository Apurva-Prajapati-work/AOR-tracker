"use client";

import { useEffect, useState } from "react";
import { DN_PPR_WINDOW } from "./data";

/**
 * Navy "Estimated PPR Window" band with progress fill, window-band overlay
 * and a "you" marker.
 *
 * Sample reference: `.ppr-bar` in `aortrack-dashboard.html`.
 */
export function DashboardPprBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const id = window.setTimeout(
      () => setProgress(DN_PPR_WINDOW.progressPct),
      400,
    );
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="ppr-bar">
      <div className="ppr-top">
        <div>
          <div className="ppr-lbl">{DN_PPR_WINDOW.label}</div>
          <div className="ppr-win">{DN_PPR_WINDOW.windowLabel}</div>
        </div>
        <div className="ppr-right">
          <div className="ppr-n">{DN_PPR_WINDOW.nVerifiedNote}</div>
          <span className="ppr-conf">{DN_PPR_WINDOW.confidenceLabel}</span>
        </div>
      </div>
      <div className="ppr-track">
        <div className="ppr-progress" style={{ width: `${progress}%` }} />
        <div
          className="ppr-window-band"
          style={{
            left: `${DN_PPR_WINDOW.bandLeftPct}%`,
            width: `${DN_PPR_WINDOW.bandWidthPct}%`,
          }}
        />
        <div
          className="ppr-you-marker"
          style={{ left: `${DN_PPR_WINDOW.youPct}%` }}
          aria-label="Your current position"
        />
      </div>
      <div className="ppr-axis">
        {DN_PPR_WINDOW.axisLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
