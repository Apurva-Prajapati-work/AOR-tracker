"use client";

import { FaChevronDown } from "react-icons/fa";
import { CommunityFilterBar } from "./CommunityFilterBar";
import { useCommunityUi } from "./CommunityUiContext";
import { FeedCard } from "./FeedCard";
import { SubmitCtaCard } from "./SubmitCtaCard";
import type { CommunityPageData } from "./data";

type Props = {
  filterChips: CommunityPageData["filterChips"];
  sortOptions: CommunityPageData["sortOptions"];
  defaultSort: string;
  submitCta: CommunityPageData["submitCta"];
};

/**
 * Middle column: filter bar + submit CTA card + posts + load-more.
 *
 * Posts and pagination state come from `useCommunityUi()` — the shell owns
 * the canonical list, refetches on filter/page change, and broadcasts
 * Socket.IO `feed:refresh` events via the NewPostBar.
 *
 * TODO(real-data): the "Load more posts" button currently jumps to the
 *   next page (replacing the visible list). An infinite-scroll mode (append
 *   instead of replace) lives behind the same `loadPage` dispatcher — just
 *   accumulate into a `pages` array in the shell.
 */
export function CommunityFeed({
  filterChips,
  sortOptions,
  defaultSort,
  submitCta,
}: Props) {
  const { posts, page, totalPages, loading, loadPage } = useCommunityUi();
  const canLoadMore = page < totalPages;

  return (
    <div className="feed-main">
      <CommunityFilterBar
        chips={filterChips}
        sortOptions={sortOptions}
        defaultSort={defaultSort}
      />

      <div className="feed-list" id="feed-list">
        <SubmitCtaCard cta={submitCta} />

        {posts.length === 0 && !loading ? (
          <div
            className="feed-empty"
            style={{
              padding: "32px 16px",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "0.9rem",
            }}
          >
            No posts match this filter yet — be the first to share!
          </div>
        ) : null}

        {posts.map((post) => (
          <FeedCard post={post} key={post.id} />
        ))}

        <div className="load-more">
          <button
            type="button"
            className="load-more-btn"
            onClick={() => loadPage(page + 1)}
            disabled={!canLoadMore || loading}
          >
            <FaChevronDown aria-hidden />
            {loading
              ? "Loading…"
              : canLoadMore
                ? "Load more posts"
                : "All caught up"}
          </button>
        </div>
      </div>
    </div>
  );
}
