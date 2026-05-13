import type { Metadata } from "next";
import "@/styles/dashboard-new.css";
import { DashboardNewClient } from "@/components/marketing/dashboard-new/DashboardNewClient";

/**
 * Parallel-implementation dashboard. Lives under the (marketing) route group
 * so it inherits MarketingNav + MarketingFooter while we iterate. Once the
 * design is approved this page will replace `/dashboard` (or fork into its
 * own non-marketing layout, depending on how we wire auth/session in).
 *
 * See `samples/aortrack-dashboard.html` for the source design and
 * `src/components/marketing/dashboard-new/` for the component tree.
 */
export const metadata: Metadata = {
  title: "Dashboard (preview) — AORTrack",
  description:
    "Preview of the redesigned AORTrack dashboard — timeline, cohort, alerts and share in one page.",
  robots: { index: false, follow: false },
};

export default function DashboardNewPage() {
  return <DashboardNewClient />;
}
