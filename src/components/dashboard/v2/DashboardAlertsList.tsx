"use client";

import { DN_ALERTS, type DnAlertCard } from "./data";
import { IconCheck, IconWarn } from "./dashboard-icons";

/**
 * Community-alerts cards (Section `alerts-sec`).
 *
 * Sample reference: <div id="alerts-sec"> in `aortrack-dashboard.html`.
 *
 * Pass `alerts` to render from live `cohortInsights` (filtered to alert-like
 * rows). Falls back to `DN_ALERTS` for the seed preview.
 */
export function DashboardAlertsList({
  alerts = DN_ALERTS,
}: {
  alerts?: DnAlertCard[];
} = {}) {
  return (
    <section id="alerts-sec" style={{ marginTop: 26 }}>
      <div className="sec-head">
        <div>
          <div className="sec-title">Community Alerts</div>
          <div className="sec-sub">
            Verified by 3+ community members · Your stream only
          </div>
        </div>
      </div>
      {alerts.map((a) => (
        <div
          key={a.title}
          className={`alert-card ${
            a.tone === "amber" ? "amber-c" : "green-c"
          }`}
        >
          <div className="ac-ic">
            {a.iconKind === "warn" ? (
              <IconWarn aria-hidden />
            ) : (
              <IconCheck aria-hidden />
            )}
          </div>
          <div className="ac-bd">
            <div className="ac-title">{a.title}</div>
            <div className="ac-desc">{a.desc}</div>
            <div className="ac-meta">
              {a.meta.map((m, i) => (
                <span key={i}>
                  {m}
                  {i < a.meta.length - 1 ? <span>·</span> : null}
                </span>
              ))}
              <span>·</span>
              <a href={a.href}>{a.linkLabel} →</a>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
