"use client";

import { useEffect, useState } from "react";
import { DN_PPR_WINDOW, type DnPprWindow } from "./data";

/**
 * Navy "Estimated PPR Window" band with progress fill, window-band overlay
 * and a "you" marker.
 *
 * Sample reference: `.ppr-bar` in `aortrack-dashboard.html`.
 *
 * Pass `window` to render from live `ppr` estimate values; otherwise falls
 * back to `DN_PPR_WINDOW` for the seed preview.
 */
export function DashboardPprBar({
  window: w = DN_PPR_WINDOW,
}: {
  window?: DnPprWindow;
} = {}) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const id = globalThis.setTimeout(() => setProgress(w.progressPct), 400);
    return () => globalThis.clearTimeout(id);
  }, [w.progressPct]);

  return (
    <div className="ppr-bar">
      <div className="ppr-top">
        <div>
          <div className="ppr-lbl">{w.label}</div>
          <div className="ppr-win">{w.windowLabel}</div>
        </div>
        <div className="ppr-right">
          <div className="ppr-n">{w.nVerifiedNote}</div>
          <span className="ppr-conf">{w.confidenceLabel}</span>
        </div>
      </div>
      <div className="ppr-track">
        <div className="ppr-progress" style={{ width: `${progress}%` }} />
        <div
          className="ppr-window-band"
          style={{ left: `${w.bandLeftPct}%`, width: `${w.bandWidthPct}%` }}
        />
        <div
          className="ppr-you-marker"
          style={{ left: `${w.youPct}%` }}
          aria-label="Your current position"
        />
      </div>
      <div className="ppr-axis">
        {w.axisLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
