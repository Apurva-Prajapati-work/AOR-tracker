"use client";

import { useEffect, useState } from "react";
import { DN_COHORT_BARS, type DnCohortBar } from "./data";

function Bar({ row, index }: { row: DnCohortBar; index: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const id = window.setTimeout(() => setWidth(row.pct), 500 + index * 60);
    return () => window.clearTimeout(id);
  }, [row.pct, index]);

  return (
    <div className="cb-row">
      <div className="cb-hd">
        <div className="cb-name">{row.nameNode ?? row.name}</div>
        <div className="cb-stat">
          <strong>{row.countLabel.split(" / ")[0]}</strong>
          {" / "}
          {row.countLabel.split(" / ")[1]}
        </div>
      </div>
      <div className="cb-track">
        <div
          className={`cb-fill fill-${row.fill}`}
          style={{ width: `${width}%` }}
        />
      </div>
      {row.note ? <div className="cb-note">{row.note}</div> : null}
    </div>
  );
}

/**
 * Cohort milestone progress bars (top of Section `cohort-sec`).
 *
 * Sample reference: `.cohort-card` block in `aortrack-dashboard.html`.
 */
export function DashboardCohortBars({
  bars = DN_COHORT_BARS,
}: {
  bars?: DnCohortBar[];
} = {}) {
  return (
    <div className="cohort-card">
      {bars.map((row, i) => (
        <Bar key={row.name} row={row} index={i} />
      ))}
    </div>
  );
}
