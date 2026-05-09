"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
  createCommunityPostAction,
  getCommunityFeedAction,
  markCommunityHelpfulAction,
  type CommunityMs,
} from "@/app/actions/community";
import { useToast } from "@/components/ToastContext";
import type { CommunityPost, UserProfile } from "@/lib/types";

const SAVED_KEY = "aortrack.community.savedIds";
const MS_CHOICES: { v: CommunityMs; label: string }[] = [
  { v: "ppr", label: "PPR 🎉" },
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

export function CommunityFeedPanel({
  email,
  profile,
}: {
  email: string;
  profile: UserProfile;
}) {
  const toast = useToast();
  const [feed, setFeed] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedFilter, setFeedFilter] = useState<string>("all");
  const [composer, setComposer] = useState("");
  const [ms, setMs] = useState<CommunityMs>("bil");
  const [posting, setPosting] = useState(false);
  const [socketLive, setSocketLive] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => loadSavedIds());

  const refresh = useCallback(async () => {
    const rows = await getCommunityFeedAction(email);
    setFeed(rows);
  }, [email]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        await refresh();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

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
      void refresh();
    });
    return () => {
      socket.disconnect();
    };
  }, [refresh]);

  const filteredFeed = useMemo(() => {
    if (feedFilter === "all") return feed;
    return feed.filter(
      (x) => x.ms === feedFilter || (feedFilter === "bg" && x.ms === "bg"),
    );
  }, [feed, feedFilter]);

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
      const res = await createCommunityPostAction(email, { body: composer, ms });
      if (!res.ok) {
        toast.show(res.error);
        return;
      }
      setComposer("");
      toast.show("Posted to community");
      await refresh();
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

  const replyPrefill = (post: CommunityPost) => {
    const who = post.name.replace(/^Applicant\s*·\s*/i, "").trim() || "member";
    setComposer((c) =>
      c.trim() ? `${c}\n\nRe @${who}: ` : `Re @${who}: `,
    );
    toast.show("Reply draft ready — add your message and post");
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
          {["all", "ppr", "bil", "bg", "med"].map((f) => (
            <button
              key={f}
              type="button"
              className={`fch ${feedFilter === f ? "on" : ""}`}
              onClick={() => setFeedFilter(f)}
            >
              {f === "all"
                ? "All"
                : f === "ppr"
                  ? "PPR 🎉"
                  : f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

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
              {c.label}
            </button>
          ))}
        </div>
        <div className="px-3 pb-3">
          <textarea
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

      {loading ? (
        <div className="py-8 text-center text-sm text-[var(--t3)]">
          Loading community…
        </div>
      ) : null}

      {filteredFeed.map((c) => (
        <div key={c.id} className="fitem" data-ms={c.ms}>
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
              👍 Helpful ({c.helpful})
            </button>
            <button
              type="button"
              className="fabtn"
              onClick={() => replyPrefill(c)}
            >
              💬 Reply
            </button>
            <button
              type="button"
              className={`fabtn ${savedIds.has(c.id) ? "ring-1 ring-[var(--red)]" : ""}`}
              onClick={() => toggleSaved(c.id)}
            >
              🔖 {savedIds.has(c.id) ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
