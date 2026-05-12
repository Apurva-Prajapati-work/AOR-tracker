import { CommunityFeed } from "./CommunityFeed";
import { CommunityLeftSidebar } from "./CommunityLeftSidebar";
import { CommunityRightPanel } from "./CommunityRightPanel";
import type { CommunityPageData } from "./data";

type Props = {
  data: CommunityPageData;
};

/**
 * Body of the community page. Three columns on desktop, single column on
 * mobile (driven entirely by community.css). The page-level wrapper
 * (`.mkt-community-page`) and the community-specific top nav live in
 * `src/app/community/page.tsx` — this component only renders the
 * three-column grid.
 *
 * TODO(real-data): no client state yet. When we wire up filtering, sort,
 *   saved-state toggles, helpful-marks and the SSE "feed:refresh" event,
 *   the right ergonomic seam is here:
 *     - mark this file "use client",
 *     - hydrate from `data` (server-rendered) into useState,
 *     - subscribe to community-broadcast via Socket.IO,
 *     - prepend new approved posts at the top.
 */
export function CommunityClient({ data }: Props) {
  return (
    <div className="cm-layout">
      <CommunityLeftSidebar
        cohortMini={data.cohortMini}
        browseLinks={data.browseLinks}
        milestoneLinks={data.milestoneLinks}
        quickLinks={data.quickLinks}
      />

      <CommunityFeed
        filterChips={data.filterChips}
        sortOptions={data.sortOptions}
        defaultSort={data.defaultSort}
        submitCta={data.submitCta}
        posts={data.posts}
      />

      <CommunityRightPanel
        insights={data.insights}
        pulse={data.pulse}
        contributors={data.contributors}
        discord={data.discord}
      />
    </div>
  );
}
