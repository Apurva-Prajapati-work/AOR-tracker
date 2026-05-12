"use client";

import { useCommunityUi } from "./CommunityUiContext";
import { FeedCard } from "./FeedCard";

/**
 * Renders the queue of dynamically-prepended feed cards (driven by the
 * new-post bar's "click to load" action). Placed inside `CommunityFeed`,
 * directly under the SubmitCtaCard so fresh posts land at the very top of
 * the feed list and get the slide-down entry animation.
 *
 * TODO(real-data): once SSE/Socket.IO is wired, this component is also the
 *   natural home for an optimistic "Your post" entry the moment a user
 *   submits — currently the modal just shows a toast and lets the existing
 *   `ownPending` static card represent that state.
 */
export function DynamicPosts() {
  const { dynamicPosts } = useCommunityUi();
  if (dynamicPosts.length === 0) return null;
  return (
    <>
      {dynamicPosts.map((post) => (
        <FeedCard key={post.id} post={post} newEntry />
      ))}
    </>
  );
}
