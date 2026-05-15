"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaBookmark,
  FaRegBookmark,
  FaRegCommentDots,
  FaThumbsUp,
  FaTrophy,
} from "react-icons/fa";
import { io, type Socket } from "socket.io-client";
import {
  createCommunityPostAction,
  getCommunityFeedAction,
  markCommunityHelpfulAction,
  type CommunityMs,
} from "@/app/actions/community";
import { COMMUNITY_FEED_PAGE_SIZE } from "@/lib/community-feed";
import { useToast } from "@/components/ToastContext";
import type { CommunityPost, CommunityReplyRef, UserProfile } from "@/lib/types";

const SAVED_KEY = "aortrack.community.savedIds";
const MS_CHOICES: { v: CommunityMs; label: string }[] = [
  { v: "ecopr", label: "eCOPR" },
  { v: "p1", label: "P1" },
  { v: "p2", label: "P2" },
  { v: "bil", label: "BIL" },
  { v: "bg", label: "BG" },
  { v: "med", label: "Med" },
];

function loadSavedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function persistSavedIds(ids: Set<string>) {
  window.localStorage.setItem(SAVED_KEY, JSON.stringify([...ids]));
}

function communityPostElId(id: string): string {
  return `community-post-${id}`;
}

export function CommunityFeedPanel({
  email,
  profile,
}: {
  email: string;
  profile: UserProfile;
}) {
  const toast = useToast();
  const [feed, setFeed] = useState<CommunityPost[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [feedFilter, setFeedFilter] = useState<string>("all");
  const [composer, setComposer] = useState("");
  const [ms, setMs] = useState<CommunityMs>("bil");
  const [posting, setPosting] = useState(false);
  const [socketLive, setSocketLive] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => loadSavedIds());
  const [replyTarget, setReplyTarget] = useState<CommunityPost | null>(null);
  const [flashPostId, setFlashPostId] = useState<string | null>(null);
  const flashTimerRef = useRef<number | null>(null);
  const composerAnchorRef = useRef<HTMLDivElement | null>(null);
  const composerTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pageRef = useRef(page);
  const feedFilterRef = useRef(feedFilter);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);
  useEffect(() => {
    feedFilterRef.current = feedFilter;
  }, [feedFilter]);

  const fetchFeed = useCallback(
    async (pageNum: number) => {
      const data = await getCommunityFeedAction(email, {
        page: pageNum,
        pageSize: COMMUNITY_FEED_PAGE_SIZE,
        msFilter: feedFilter === "all" ? null : feedFilter,
      });
      setFeed(data.posts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(data.page);
      return data;
    },
    [email, feedFilter],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        await fetchFeed(page);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, fetchFeed]);

  useEffect(() => {
    const socket: Socket = io({
      path: "/socket.io",
      addTrailingSlash: false,
      transports: ["websocket", "polling"],
    });
    socket.on("connect", () => setSocketLive(true));
    socket.on("disconnect", () => setSocketLive(false));
    socket.on("connect_error", () => setSocketLive(false));
    socket.on("feed:refresh", () => {
      const p = pageRef.current;
      const f = feedFilterRef.current;
      void (async () => {
        const data = await getCommunityFeedAction(email, {
          page: p,
          pageSize: COMMUNITY_FEED_PAGE_SIZE,
          msFilter: f === "all" ? null : f,
        });
        setFeed(data.posts);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setPage(data.page);
      })();
    });
    return () => {
      socket.disconnect();
    };
  }, [email]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    };
  }, []);

  const jumpToPost = useCallback(
    (id: string) => {
      const el = document.getElementById(communityPostElId(id));
      if (!el) {
        toast.show(
          "That post isn’t visible with the current filter — try “All”.",
        );
        return;
      }
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlashPostId(id);
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
      flashTimerRef.current = window.setTimeout(() => {
        setFlashPostId(null);
        flashTimerRef.current = null;
      }, 1400);
    },
    [toast],
  );

  const rangeLabel = useMemo(() => {
    if (total === 0) return null;
    const start = (page - 1) * COMMUNITY_FEED_PAGE_SIZE + 1;
    const end = Math.min(page * COMMUNITY_FEED_PAGE_SIZE, total);
    return `${start}–${end} of ${total}`;
  }, [page, total]);

  const toggleSaved = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persistSavedIds(next);
      return next;
    });
  };

  const onPost = async () => {
    if (posting) return;
    setPosting(true);
    try {
      const res = await createCommunityPostAction(email, {
        body: composer,
        ms,
        replyToId: replyTarget?.id ?? null,
      });
      if (!res.ok) {
        toast.show(res.error);
        return;
      }
      setComposer("");
      setReplyTarget(null);
      toast.show("Posted to community");
      if (page !== 1) {
        setPage(1);
      } else {
        await fetchFeed(1);
      }
    } finally {
      setPosting(false);
    }
  };

  const onHelpful = async (post: CommunityPost) => {
    if (post.viewerHasMarkedHelpful) {
      toast.show("You already marked this as helpful");
      return;
    }
    const res = await markCommunityHelpfulAction(email, post.id);
    if (!res.ok) {
      toast.show(res.error);
      return;
    }
    setFeed((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              helpful: res.helpful,
              viewerHasMarkedHelpful: res.viewerHasMarkedHelpful,
            }
          : p,
      ),
    );
  };

  const startReply = (post: CommunityPost) => {
    setReplyTarget(post);
    toast.show("Replying — type below, then post");
    requestAnimationFrame(() => {
      composerAnchorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      window.setTimeout(() => {
        composerTextareaRef.current?.focus({ preventScroll: true });
      }, 400);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <div className="text-lg font-bold text-[var(--w)]">
            Community reports
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[var(--t2)]">
            <span>Share updates with others on similar timelines</span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                socketLive
                  ? "bg-[rgba(93,228,148,0.12)] text-[#5de494]"
                  : "bg-[var(--navy4)] text-[var(--t3)]"
              }`}
              title={
                socketLive
                  ? "Socket connected — new posts sync automatically"
                  : "Socket offline — use the custom dev server (npm run dev) for live sync, or refresh the page"
              }
            >
              {socketLive ? "● Live" : "○ Polling / offline"}
            </span>
          </div>
        </div>
        <div className="ffs">
          {["all", "ecopr", "p1", "p2", "bil", "bg", "med"].map((f) => (
            <button
              key={f}
              type="button"
              className={`fch ${feedFilter === f ? "on" : ""}`}
              onClick={() => {
                setFeedFilter(f);
                setPage(1);
              }}
            >
              {f === "all"
                ? "All"
                : f === "ecopr"
                  ? (
                      <span className="inline-flex items-center gap-1">
                        <FaTrophy aria-hidden />
                        eCOPR
                      </span>
                    )
                  : f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={composerAnchorRef}
        id="community-composer"
        className="scroll-mt-[88px]"
      >
        <div className="card">
        <div className="chd">
          <span className="ctit">New report</span>
          <span className="ctag">
            {profile.stream} · {profile.type}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 px-3 pb-2 pt-1">
          {MS_CHOICES.map((c) => (
            <button
              key={c.v}
              type="button"
              className={`fch ${ms === c.v ? "on" : ""}`}
              onClick={() => setMs(c.v)}
            >
              {c.v === "ecopr" ? (
                <span className="inline-flex items-center gap-1">
                  <FaTrophy aria-hidden />
                  {c.label}
                </span>
              ) : (
                c.label
              )}
            </button>
          ))}
        </div>
        <div className="px-3 pb-3">
          {replyTarget ? (
            <div className="freply-banner">
              <span>
                Replying to <strong>{replyTarget.name}</strong>
              </span>
              <button
                type="button"
                className="freply-banner-x"
                onClick={() => setReplyTarget(null)}
              >
                Cancel
              </button>
            </div>
          ) : null}
          <textarea
            ref={composerTextareaRef}
            className="mb-2 min-h-[88px] w-full resize-y rounded-md border border-[var(--navy4)] bg-[var(--navy2)] px-3 py-2 text-[13px] text-[var(--t1)] placeholder:text-[var(--t3)]"
            placeholder="What changed on your application? (plain text — no HTML)"
            value={composer}
            maxLength={2000}
            onChange={(e) => setComposer(e.target.value)}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] text-[var(--t3)]">
              {composer.length}/2000 · Visible to other signed-in users viewing
              this feed
            </span>
            <button
              type="button"
              className="bg rounded-md px-4 py-2 text-[12px] font-semibold"
              disabled={posting || composer.trim().length < 3}
              onClick={() => void onPost()}
            >
              {posting ? "Posting…" : "Post report"}
            </button>
          </div>
        </div>
      </div>
      </div>

      {loading && feed.length === 0 ? (
        <div className="py-8 text-center text-sm text-[var(--t3)]">
          Loading community…
        </div>
      ) : null}

      {loading && feed.length > 0 ? (
        <div className="py-2 text-center text-[11px] text-[var(--t3)]">
          Updating feed…
        </div>
      ) : null}

      {feed.map((c) => (
        <div
          key={c.id}
          id={communityPostElId(c.id)}
          className={`fitem ${flashPostId === c.id ? "fitem--flash" : ""}`}
          data-ms={c.ms}
        >
          {c.replyTo ? (
            <ReplyReferenceBar refData={c.replyTo} onJump={jumpToPost} />
          ) : null}
          <div className="ftop">
            <div className="fav">{c.initials}</div>
            <div>
              <div className="fname">{c.name}</div>
              <div className="fmeta">{c.meta}</div>
            </div>
            <span className={`fms ${c.ms}`}>{c.msl}</span>
          </div>
          {c.bodyIsHtml ? (
            <div
              className="fbody"
              dangerouslySetInnerHTML={{ __html: c.body }}
            />
          ) : (
            <div className="fbody whitespace-pre-wrap">{c.body}</div>
          )}
          <div className="ftl">
            {c.tl.map((t) => (
              <div key={t.label} className="ftli">
                <div className={`ftld ${t.done ? "d" : "p"}`} />
                {t.label}
              </div>
            ))}
          </div>
          <div className="facts">
            <button
              type="button"
              className={`fabtn ${c.viewerHasMarkedHelpful ? "opacity-70" : ""}`}
              onClick={() => void onHelpful(c)}
            >
              <FaThumbsUp aria-hidden /> Helpful ({c.helpful})
            </button>
            <button
              type="button"
              className="fabtn"
              onClick={() => startReply(c)}
            >
              <FaRegCommentDots aria-hidden /> Reply
            </button>
            <button
              type="button"
              className={`fabtn ${savedIds.has(c.id) ? "ring-1 ring-[var(--red)]" : ""}`}
              onClick={() => toggleSaved(c.id)}
            >
              {savedIds.has(c.id) ? <FaBookmark aria-hidden /> : <FaRegBookmark aria-hidden />}
              {savedIds.has(c.id) ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      ))}

      {!loading && total === 0 ? (
        <div className="py-8 text-center text-sm text-[var(--t3)]">
          No posts match this filter yet.
        </div>
      ) : null}

      {total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
          <span className="text-[12px] text-[var(--t2)]">
            Showing {rangeLabel}
            <span className="text-[var(--t3)]">
              {" "}
              · {COMMUNITY_FEED_PAGE_SIZE} per page
            </span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="fch"
              disabled={loading || page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="px-1 text-[11px] text-[var(--t3)]">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              className="fch"
              disabled={loading || page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ReplyReferenceBar({
  refData,
  onJump,
}: {
  refData: CommunityReplyRef;
  onJump: (postId: string) => void;
}) {
  const shortName =
    refData.name.replace(/^Applicant\s*·\s*/i, "").trim() || refData.name;
  const label = shortName.startsWith("@") ? shortName : `@${shortName}`;
  return (
    <button
      type="button"
      className="freply-bar"
      onClick={() => onJump(refData.id)}
      aria-label={`Jump to original message from ${refData.name}`}
    >
      <span className="freply-l" aria-hidden />
      <div className="fav freply-mini">{refData.initials}</div>
      <div className="freply-main">
        <span className="freply-name">{label}</span>
        <span className="freply-snippet">{refData.snippet}</span>
      </div>
    </button>
  );
}
