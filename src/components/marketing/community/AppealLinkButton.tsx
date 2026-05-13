"use client";

import { IconArrowRight } from "../landing-icons";
import { useCommunityUi, type AppealContext } from "./CommunityUiContext";

type Props = {
  daysRemaining: number;
  context: AppealContext;
};

/**
 * Client island used inside the otherwise-server-rendered `FeedCard` for the
 * own-removed variant. Triggers the page-level appeal modal via context and
 * forwards the post's removal details for the modal's pre-filled banner.
 */
export function AppealLinkButton({ daysRemaining, context }: Props) {
  const { openAppeal } = useCommunityUi();
  return (
    <button
      type="button"
      className="appeal-link"
      onClick={() => openAppeal(context)}
    >
      <span>Appeal this decision</span>
      <IconArrowRight size={12} />
      <span>({daysRemaining} days remaining)</span>
    </button>
  );
}
