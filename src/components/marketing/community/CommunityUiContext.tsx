"use client";

import { createContext, useContext } from "react";
import type { Post } from "./data";

export type ToastTone = "default" | "green" | "amber";

export type AppealContext = {
  milestoneLabel: string;
  day: string;
  cohortLabel: string;
  reason: string;
  daysRemaining: number;
};

/**
 * Shared UI surface for the community page's interactive bits.
 *
 * Owned by `CommunityShell` and consumed by:
 *   - `CommunityNav` (live counter display, "+ Submit Milestone" button)
 *   - `SubmitCtaCard` (in-feed "+ Submit Milestone" button)
 *   - `CommunityLeftSidebar` (sidebar quick-action "Submit Milestone")
 *   - `AppealLinkButton` (own-removed card's "Appeal this decision" CTA)
 *   - `DynamicPosts` (renders feed cards prepended via the new-post bar)
 *
 * TODO(real-data): when we wire this to live data, this context is also the
 *   natural place to hang a `helpfulToggle(postId)` / `saveToggle(postId)` /
 *   `replyTo(postId, text)` action surface that fan-out to the existing
 *   community server actions.
 */
export type CommunityUi = {
  /** Current live-online count shown in the nav pill. Auto-increments. */
  liveCount: number;
  /** Dynamically prepended posts (from "click to load new posts"). */
  dynamicPosts: Post[];

  openSubmit: () => void;
  openAppeal: (ctx?: AppealContext) => void;
  toast: (message: string, tone?: ToastTone) => void;
};

const CommunityUiCtx = createContext<CommunityUi | null>(null);
CommunityUiCtx.displayName = "CommunityUiContext";

export const CommunityUiProvider = CommunityUiCtx.Provider;

export function useCommunityUi(): CommunityUi {
  const value = useContext(CommunityUiCtx);
  if (!value) {
    throw new Error(
      "useCommunityUi must be used inside <CommunityShell> (which provides CommunityUiContext)",
    );
  }
  return value;
}
