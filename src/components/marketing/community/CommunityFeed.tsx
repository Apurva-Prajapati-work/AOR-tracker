import { FaChevronDown } from "react-icons/fa";
import { CommunityFilterBar } from "./CommunityFilterBar";
import { DynamicPosts } from "./DynamicPosts";
import { FeedCard } from "./FeedCard";
import { SubmitCtaCard } from "./SubmitCtaCard";
import type { CommunityPageData } from "./data";

type Props = {
  filterChips: CommunityPageData["filterChips"];
  sortOptions: CommunityPageData["sortOptions"];
  defaultSort: string;
  submitCta: CommunityPageData["submitCta"];
  posts: CommunityPageData["posts"];
};

/**
 * Middle column: filter bar + submit CTA card + posts + load-more.
 *
 * TODO(real-data): the "Load more posts" button is currently visual only.
 *   Wire it to pagination via the existing community server action (it
 *   already returns `CommunityFeedPage` with `totalPages`, see
 *   @/lib/community-feed). At that point this component likely becomes a
 *   small client component with a `useTransition` cursor.
 */
export function CommunityFeed({
  filterChips,
  sortOptions,
  defaultSort,
  submitCta,
  posts,
}: Props) {
  return (
    <div className="feed-main">
      <CommunityFilterBar
        chips={filterChips}
        sortOptions={sortOptions}
        defaultSort={defaultSort}
      />

      <div className="feed-list" id="feed-list">
        <SubmitCtaCard cta={submitCta} />

        <DynamicPosts />

        {posts.map((post) => (
          <FeedCard post={post} key={post.id} />
        ))}

        <div className="load-more">
          <button type="button" className="load-more-btn">
            <FaChevronDown aria-hidden />
            Load more posts
          </button>
        </div>
      </div>
    </div>
  );
}
