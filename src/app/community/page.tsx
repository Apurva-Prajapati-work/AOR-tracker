import type { Metadata } from "next";
import "@/styles/marketing-core.css";
import "@/styles/community.css";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { CommunityClient } from "@/components/marketing/community/CommunityClient";
import { CommunityNav } from "@/components/marketing/community/CommunityNav";
import { CommunityShell } from "@/components/marketing/community/CommunityShell";
import {
  COMMUNITY_NAV,
  getCommunity,
} from "@/components/marketing/community/data";

const CANONICAL = "https://track.getnorthpath.com/community";

export const metadata: Metadata = {
  title: "Community Feed — AORTrack",
  description:
    "Live feed of crowd-sourced Canadian PR processing milestones — replies, cohort insights, and community moderation flows.",
  alternates: { canonical: CANONICAL },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Community Feed — AORTrack",
    description:
      "Timelines, replies, and weekly PPR pulse from the AORTrack community.",
    url: CANONICAL,
    type: "website",
  },
};

/**
 * /community
 *
 * This route lives OUTSIDE the (marketing) route group on purpose: the
 * community page has its own top nav (CommunityNav), distinct from the
 * shared MarketingNav used on /, /changelog, /track, etc.
 *
 * It still reuses the shared `MarketingFooter`. To keep the footer styled
 * we wrap the page in `.marketing-site` and pull in `marketing-core.css`,
 * which is where the footer's CSS variables and rules live.
 *
 * `CommunityShell` is the client wrapper that owns:
 *   - the auto-ticking live counter,
 *   - the simulated "X new posts — click to load" SSE bar,
 *   - the submit-milestone modal,
 *   - the appeal modal,
 *   - the toast queue.
 * The static body (nav + 3-column grid) is rendered server-side and passed
 * in as children so we keep SSR for everything except the interactive bits.
 *
 * TODO(real-data): the page is currently fed by static seed data (see
 * `src/components/marketing/community/data.ts`). When we wire it to the
 * real community feed:
 *   - make `getCommunity()` async,
 *   - convert this component to `export default async function CommunityPage()`,
 *   - add `export const dynamic = "force-dynamic"` (or revalidate via a
 *     `revalidatePath('/community')` call from the community-broadcast handler).
 */
export default function CommunityPage() {
  const data = getCommunity();

  return (
    <div className="marketing-site flex min-h-screen flex-col">
      <div className="mkt-community-page flex min-h-0 flex-1 flex-col">
        <CommunityShell data={data}>
          <CommunityNav dashboardHref={COMMUNITY_NAV.dashboardHref} />
          <CommunityClient data={data} />
        </CommunityShell>
      </div>
      <MarketingFooter />
    </div>
  );
}
