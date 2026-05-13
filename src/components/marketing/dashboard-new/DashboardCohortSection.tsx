"use client";

import { DashboardCohortBars } from "./DashboardCohortBars";
import { DashboardDotMap } from "./DashboardDotMap";
import { DashboardHistogram } from "./DashboardHistogram";
import { DashboardStreamCompare } from "./DashboardStreamCompare";

/**
 * "Your Cohort" section (`cohort-sec`) — wraps the four sub-cards:
 *   1. Cohort milestone bars
 *   2. Histogram of days-to-PPR
 *   3. Dot-map of 500 sampled applicants
 *   4. Stream comparison
 *
 * Sample reference: <div id="cohort-sec"> in `aortrack-dashboard.html`.
 */
export function DashboardCohortSection() {
  return (
    <section id="cohort-sec" style={{ marginTop: 26 }}>
      <div className="sec-head">
        <div>
          <div className="sec-title">
            Your Cohort — Feb 2026 · CEC General
          </div>
          <div className="sec-sub">
            1,240 verified applicants · All provinces
          </div>
        </div>
      </div>
      <DashboardCohortBars />
      <DashboardHistogram />
      <DashboardDotMap />
      <DashboardStreamCompare />
    </section>
  );
}
