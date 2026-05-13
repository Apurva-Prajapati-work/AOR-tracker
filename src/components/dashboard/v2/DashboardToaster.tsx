"use client";

import { useDashboardV2Ui } from "./DashboardV2Context";
import { IconCheck } from "./dashboard-icons";

/**
 * Bottom-right transient toast (driven by `useDashboardV2Ui().showToast`).
 *
 * Sample reference: `.toast` element + `toast()` helper in
 * `aortrack-dashboard.html`.
 */
export function DashboardToaster() {
  const { toastMessage } = useDashboardV2Ui();
  if (!toastMessage) return null;
  return (
    <div className="dn-toast" role="status" aria-live="polite">
      <IconCheck aria-hidden />
      {toastMessage}
    </div>
  );
}
