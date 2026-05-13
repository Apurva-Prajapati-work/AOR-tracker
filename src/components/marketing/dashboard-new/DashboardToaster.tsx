"use client";

import { useDashboardNewUi } from "./DashboardNewContext";
import { IconCheck } from "./dashboard-icons";

/**
 * Bottom-right transient toast (driven by `useDashboardNewUi().showToast`).
 *
 * Sample reference: `.toast` element + `toast()` helper in
 * `aortrack-dashboard.html`.
 */
export function DashboardToaster() {
  const { toastMessage } = useDashboardNewUi();
  if (!toastMessage) return null;
  return (
    <div className="dn-toast" role="status" aria-live="polite">
      <IconCheck aria-hidden />
      {toastMessage}
    </div>
  );
}
