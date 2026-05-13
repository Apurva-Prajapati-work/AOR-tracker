"use client";

import { DashboardAlertStrip } from "./DashboardAlertStrip";
import { DashboardAlertsList } from "./DashboardAlertsList";
import { DashboardAppBar } from "./DashboardAppBar";
import { DashboardCohortSection } from "./DashboardCohortSection";
import { DashboardConsultingCTA } from "./DashboardConsultingCTA";
import { DashboardHeroBar } from "./DashboardHeroBar";
import { DashboardNewUiProvider } from "./DashboardNewContext";
import { DashboardPprBar } from "./DashboardPprBar";
import { DashboardRings } from "./DashboardRings";
import { DashboardShareSection } from "./DashboardShareSection";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTimeline } from "./DashboardTimeline";
import { DashboardToaster } from "./DashboardToaster";

/**
 * Top-level client for the parallel-implementation dashboard page.
 *
 * The page tree is roughly:
 *
 *   ┌───────────────────────────────── DashboardAppBar ───────────────┐
 *   │                       dnb (sticky, h: 60)                       │
 *   ├──────────────────── DashboardAlertStrip (dismissible) ──────────┤
 *   │  DashboardSidebar  │             <main> dmain                   │
 *   │  (sticky, 248px)   │   HeroBar · Rings · PprBar                 │
 *   │                    │   Timeline (#tl-sec)                       │
 *   │                    │   Cohort (#cohort-sec)                     │
 *   │                    │   Alerts (#alerts-sec)                     │
 *   │                    │   Share  (#share-sec)                      │
 *   │                    │   Consulting CTA                           │
 *   └────────────────────┴────────────────────────────────────────────┘
 *   DashboardToaster (fixed bottom-right)
 *
 * Lives at `src/app/(marketing)/dashboard-new/page.tsx`.
 */
export function DashboardNewClient() {
  return (
    <DashboardNewUiProvider>
      <div className="mkt-dashnew-page flex min-h-0 flex-1 flex-col">
        <DashboardAppBar />
        <DashboardAlertStrip />
        <div className="dlay">
          <DashboardSidebar />
          <main className="dmain" id="top">
            <DashboardHeroBar />
            <DashboardRings />
            <DashboardPprBar />
            <DashboardTimeline />
            <DashboardCohortSection />
            <DashboardAlertsList />
            <DashboardShareSection />
            <DashboardConsultingCTA />
            <div style={{ height: 36 }} />
          </main>
        </div>
        <DashboardToaster />
      </div>
    </DashboardNewUiProvider>
  );
}
