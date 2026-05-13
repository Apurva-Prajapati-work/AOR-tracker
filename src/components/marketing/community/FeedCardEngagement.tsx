"use client";

import { useEffect, useState } from "react";
import { FaRegBookmark, FaRegCommentDots, FaRegThumbsUp } from "react-icons/fa";
import { useCommunityUi } from "./CommunityUiContext";
import type { ApprovedPost } from "./data";

const SAVED_KEY = "aortrack.community.savedIds";

type Props = {
  /** Full parent post — needed so `requestReply` can pass it to ReplyModal. */
  post: ApprovedPost;
  helpfulCount: number;
  helpfulActive?: boolean;
  replyCount: number;
  dataSource?: string;
};

/* Save list lives in `localStorage` for now; "saved" isn't on the backend
   yet. Centralised here so the read/write is consistent across cards. */
function readSavedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeSavedIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify([...ids]));
  } catch {
    /* quota / private mode — silently ignore */
  }
}

/**
 * Engagement row. Helpful + Reply go through `useCommunityUi()` so the
 * shell can apply auth gating (SignInPromptModal) before invoking the
 * server actions. Save stays local until the backend has a `/me/saved`
 * surface — TODO(real-data) on the action surface.
 */
export function FeedCardEngagement({
  post,
  helpfulCount,
  helpfulActive,
  replyCount,
  dataSource,
}: Props) {
  const { requestHelpful, requestReply, toast } = useCommunityUi();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readSavedIds().has(post.id));
  }, [post.id]);

  function toggleSave() {
    const ids = readSavedIds();
    if (ids.has(post.id)) {
      ids.delete(post.id);
      writeSavedIds(ids);
      setSaved(false);
      toast("Removed from saved", "default");
    } else {
      ids.add(post.id);
      writeSavedIds(ids);
      setSaved(true);
      toast("Saved to your reading list", "green");
    }
  }

  return (
    <div className="fc-footer">
      <button
        type="button"
        className={`eng-btn${helpfulActive ? " active" : ""}`}
        aria-pressed={helpfulActive ?? false}
        aria-label={`Mark helpful — ${helpfulCount} so far`}
        onClick={() => requestHelpful(post.id)}
      >
        <FaRegThumbsUp aria-hidden />
        Helpful <span>{helpfulCount}</span>
      </button>
      <div className="eng-sep" />
      <button
        type="button"
        className="eng-btn"
        aria-label={`Reply — ${replyCount} so far`}
        onClick={() => requestReply(post)}
      >
        <FaRegCommentDots aria-hidden />
        Reply <span>{replyCount}</span>
      </button>
      <div className="eng-sep" />
      <button
        type="button"
        className={`eng-btn eng-save${saved ? " saved" : ""}`}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved" : "Save post"}
        onClick={toggleSave}
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
