"use client";

import { DN_ALERT_STRIP } from "./data";
import { useDashboardNewUi } from "./DashboardNewContext";
import { IconArrowRight, IconClose, IconWarn } from "./dashboard-icons";

/**
 * Dismissible amber alert ribbon under the app-bar.
 *
 * Sample reference: <div class="alert-strip">.
 *
 * Visibility is owned by `DashboardNewUiProvider`; clicking the × hides it
 * for the rest of the session (state lives on the page, not persisted —
 * TODO(dashboard-new): persist via localStorage if we ship this for real).
 */
export function DashboardAlertStrip() {
  const { alertStripVisible, dismissAlertStrip } = useDashboardNewUi();
  if (!alertStripVisible) return null;

  const scrollToAlerts = () => {
    document
      .getElementById("alerts-sec")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="das" role="status">
      <span className="das-i" aria-hidden>
        <IconWarn />
      </span>
      <div className="das-t">
        <strong>{DN_ALERT_STRIP.title}</strong> {DN_ALERT_STRIP.body}{" "}
        <button
          type="button"
          className="das-link"
          onClick={scrollToAlerts}
        >
          {DN_ALERT_STRIP.linkLabel}
          <IconArrowRight aria-hidden />
        </button>
      </div>
      <button
        type="button"
        className="das-x"
        aria-label="Dismiss alert"
        onClick={dismissAlertStrip}
      >
        <IconClose aria-hidden />
      </button>
    </div>
  );
}
