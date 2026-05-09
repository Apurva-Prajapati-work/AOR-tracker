import type { CommunityPost } from "@/lib/types";

export const COMMUNITY_FEED_PAGE_SIZE = 25;

export type CommunityFeedPage = {
  posts: CommunityPost[];
  total: number;
  /** Effective page (may be clamped if the requested page was past the end). */
  page: number;
  pageSize: number;
  totalPages: number;
};
