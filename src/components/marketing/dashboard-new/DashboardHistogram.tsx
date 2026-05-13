"use client";

import { useEffect, useState } from "react";
import { DN_HIST } from "./data";
import { IconInfo } from "./dashboard-icons";

const MAX = Math.max(...DN_HIST.map((b) => b.value));

function HistBar({
  bar,
  delaySec,
  animateOn,
}: {
  bar: { label: string; value: number; type: "n" | "h" | "y" };
  delaySec: number;
  animateOn: boolean;
}) {
  const target = Math.round((bar.value / MAX) * 85);
  return (
    <div className="hb-wrap">
      <div
        className={`hb ${bar.type}`}
        title={`${bar.label}: ${bar.value} applicants`}
        style={{
          height: animateOn ? `${target}%` : "0%",
          transition: `height .7s ease ${delaySec}s`,
        }}
      />
      <div className={`hb-lbl${bar.type === "y" ? " y" : ""}`}>
        {bar.label}
      </div>
    </div>
  );
}

/**
 * Days-to-PPR distribution mini-histogram.
 *
 * Sample reference: `.hist-card` block in `aortrack-dashboard.html`.
 */
export function DashboardHistogram() {
  const [animateOn, setAnimateOn] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setAnimateOn(true), 700);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="hist-card">
      <div className="sec-head" style={{ marginBottom: 0 }}>
        <div>
          <div className="sec-title" style={{ fontSize: ".92rem" }}>
            Days-to-PPR Distribution
          </div>
          <div className="sec-sub">
            482 verified PPR completions · your estimated window in red
          </div>
        </div>
      </div>
      <div className="hist-area">
        {DN_HIST.map((b, i) => (
          <HistBar
            key={b.label}
            bar={b}
            delaySec={i * 0.05}
            animateOn={animateOn}
          />
        ))}
      </div>
      <div className="hist-legend">
        <div className="hl-item">
          <div className="hl-dot" style={{ background: "var(--navy)" }} />
          Cohort
        </div>
        <div className="hl-item">
          <div className="hl-dot" style={{ background: "var(--red)" }} />
          Your window
        </div>
        <div className="hl-item">
          <div className="hl-dot" style={{ background: "var(--green)" }} />
          Your position
        </div>
      </div>
      <div className="data-note">
        <IconInfo aria-hidden />
        Gemini-verified only · Z-score filtered (±2.5σ)
      </div>
    </div>
  );
}
