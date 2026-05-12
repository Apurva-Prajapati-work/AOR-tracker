import { FaRegBookmark, FaRegCommentDots, FaRegThumbsUp } from "react-icons/fa";

type Props = {
  helpfulCount: number;
  helpfulActive?: boolean;
  replyCount: number;
  saved?: boolean;
  dataSource?: string;
};

/**
 * Engagement row at the bottom of an approved feed card.
 *
 * Rendered as semantic buttons but they're no-ops in the marketing preview —
 * the visual state comes straight from `data.ts`.
 *
 * TODO(real-data): wire these up via the existing community server actions.
 *   - "Helpful" -> @/app/actions/community markHelpful() (already exists in
 *     the dashboard panel).
 *   - "Reply"   -> open a small client-side reply panel that POSTs via the
 *     same action used by the dashboard's CommunityFeedPanel.
 *   - "Save"    -> needs a new server action (TODO) — save list lives on
 *     the user's profile.
 */
export function FeedCardEngagement({
  helpfulCount,
  helpfulActive,
  replyCount,
  saved,
  dataSource,
}: Props) {
  return (
    <div className="fc-footer">
      <button
        type="button"
        className={`eng-btn${helpfulActive ? " active" : ""}`}
        aria-pressed={helpfulActive ?? false}
        aria-label={`Mark helpful — ${helpfulCount} so far`}
      >
        <FaRegThumbsUp aria-hidden />
        Helpful <span>{helpfulCount}</span>
      </button>
      <div className="eng-sep" />
      <button
        type="button"
        className="eng-btn"
        aria-label={`Reply — ${replyCount} so far`}
      >
        <FaRegCommentDots aria-hidden />
        Reply <span>{replyCount}</span>
      </button>
      <div className="eng-sep" />
      <button
        type="button"
        className={`eng-btn eng-save${saved ? " saved" : ""}`}
        aria-pressed={saved ?? false}
        aria-label={saved ? "Remove from saved" : "Save post"}
      >
        <FaRegBookmark aria-hidden />
        {saved ? "Saved" : "Save"}
      </button>
      {dataSource ? (
        <div className="fc-footer-right">
          <div className="data-src">{dataSource}</div>
        </div>
      ) : null}
    </div>
  );
}
