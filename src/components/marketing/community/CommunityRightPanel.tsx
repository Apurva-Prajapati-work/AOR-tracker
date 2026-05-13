import { ContributorRow } from "./ContributorRow";
import { DiscordCard } from "./DiscordCard";
import { InsightCard } from "./InsightCard";
import { PulseChart } from "./PulseChart";
import type { CommunityPageData } from "./data";

type Props = {
  insights: CommunityPageData["insights"];
  pulse: CommunityPageData["pulse"];
  contributors: CommunityPageData["contributors"];
  discord: CommunityPageData["discord"];
};

/**
 * Sticky right rail: community insights, weekly pulse, top contributors,
 * Discord CTA.
 *
 * TODO(real-data): all four sections currently read from the static seed.
 *   - Insights: an "alerts" admin tool would publish these; until then we
 *     could derive simple ones (e.g. cohort-velocity diffs) automatically.
 *   - Pulse: aggregation over approved PPR posts, ISO-week buckets.
 *   - Contributors: count of `moderation_status = approved` posts per author
 *     in the last 30 days.
 *   - Discord card stays static, but the link could come from env so it's
 *     easy to swap.
 */
export function CommunityRightPanel({
  insights,
  pulse,
  contributors,
  discord,
}: Props) {
  return (
    <aside className="right-panel" aria-label="Community insights">
      <div className="rp-section">
        <div className="rp-label">Community Insights</div>
        {insights.map((insight) => (
          <InsightCard insight={insight} key={insight.id} />
        ))}
      </div>

      <PulseChart pulse={pulse} />

      <div className="rp-section">
        <div className="rp-label">Top Contributors</div>
        {contributors.map((c) => (
          <ContributorRow contributor={c} key={c.rank} />
        ))}
      </div>

      <div className="rp-section">
        <DiscordCard data={discord} />
      </div>
    </aside>
  );
}
