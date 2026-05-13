"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
  getCommunityFeedAction,
  markCommunityHelpfulAction,
} from "@/app/actions/community";
import { getProfileAction } from "@/app/actions/profile";
import { COMMUNITY_FEED_PAGE_SIZE } from "@/lib/community-feed";
import { readSessionEmail } from "@/lib/session-client";
import { AppealModal } from "./AppealModal";
import { communityPostToApproved } from "./adapter";
import {
  CommunityUiProvider,
  type AppealContext,
  type CommunityMsFilter,
  type CommunityUi,
  type ToastTone,
} from "./CommunityUiContext";
import { CommunityToaster, type ToastItem } from "./CommunityToaster";
import type { ApprovedPost, CommunityPageData } from "./data";
import { NewPostBar } from "./NewPostBar";
import { ReplyModal } from "./ReplyModal";
import { SignInPromptModal } from "./SignInPromptModal";
import { SubmitMilestoneModal } from "./SubmitMilestoneModal";

/** Marketing chip → backend `ms`. `null` = no filter (all posts). */
const FILTER_TO_MS: Record<NonNullable<CommunityMsFilter>, string> = {
  ppr: "ppr",
  bil: "bil",
  bgc: "bg",
  medical: "med",
};

const MAX_PENDING = 50;
const TOAST_MS = 3500;

type Props = {
  data: CommunityPageData;
  initialMsFilter: CommunityMsFilter;
  initialPage: number;
  initialTotal: number;
  initialTotalPages: number;
  children: React.ReactNode;
};

type GatedAction = "post" | "mark helpful" | "reply";

/**
 * Top-level client wrapper for `/community`.
 *
 * Owns:
 *   - viewer-email hydration (from sessionStorage) + profile fetch
 *   - Socket.IO subscription → drives the new-post bar via `pendingCount`
 *   - live feed state (posts/page/total/msFilter/loading) + re-fetch on
 *     filter / page change
 *   - sign-in prompt overlay for gated actions
 *   - submit / reply modals (wired to real server actions)
 *   - toast queue + AppealModal (still simulated; moderation pipeline TODO)
 *
 * Only the live-only `ApprovedPost[]` flows through the new feed state; the
 * seeded `ownPending`/`ownRemoved` cards still live on `data.posts` and are
 * rendered by `CommunityFeed` from the initial server payload.
 */
export function CommunityShell({
  data,
  initialMsFilter,
  initialPage,
  initialTotal,
  initialTotalPages,
  children,
}: Props) {
  /* ─── auth ─── */
  const [viewerEmail, setViewerEmail] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  /* ─── feed state ─── */
  const initialApproved = useMemo<ApprovedPost[]>(
    () =>
      data.posts.filter(
        (p): p is ApprovedPost => p.kind === "approved",
      ),
    [data.posts],
  );
  const [posts, setPosts] = useState<ApprovedPost[]>(initialApproved);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [msFilter, setMsFilterState] =
    useState<CommunityMsFilter>(initialMsFilter);
  const [loading, setLoading] = useState(false);

  /* ─── socket / live signals ─── */
  const [liveCount, setLiveCount] = useState(data.liveCount);
  const [socketLive, setSocketLive] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  /* ─── overlays ─── */
  const [submitOpen, setSubmitOpen] = useState(false);
  const [appealOpen, setAppealOpen] = useState(false);
  const [appealContext, setAppealContext] = useState<AppealContext | null>(
    null,
  );
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ApprovedPost | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signInAction, setSignInAction] = useState<GatedAction>("post");
  const [toast, setToast] = useState<ToastItem | null>(null);
  const toastIdRef = useRef(0);
  const toastTimerRef = useRef<number | null>(null);

  /* ─── refs mirroring state for socket / event handlers ─── */
  const pageRef = useRef(page);
  const msFilterRef = useRef(msFilter);
  const viewerEmailRef = useRef(viewerEmail);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);
  useEffect(() => {
    msFilterRef.current = msFilter;
  }, [msFilter]);
  useEffect(() => {
    viewerEmailRef.current = viewerEmail;
  }, [viewerEmail]);

  /* ─── toast helper ─── */
  const showToast = useCallback(
    (message: string, tone: ToastTone = "default") => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
      toastIdRef.current += 1;
      setToast({ id: toastIdRef.current, message, tone });
      toastTimerRef.current = window.setTimeout(() => {
        setToast(null);
        toastTimerRef.current = null;
      }, TOAST_MS);
    },
    [],
  );

  /* ─── core re-fetch ─── */
  const fetchPage = useCallback(
    async (pageNum: number, filter: CommunityMsFilter) => {
      setLoading(true);
      try {
        const ms = filter ? FILTER_TO_MS[filter] : null;
        const result = await getCommunityFeedAction(
          viewerEmailRef.current,
          {
            page: pageNum,
            pageSize: COMMUNITY_FEED_PAGE_SIZE,
            msFilter: ms,
          },
        );
        setPosts(result.posts.map((p) => communityPostToApproved(p)));
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setPage(result.page);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /* ─── hydrate viewer email + profile on mount ─── */
  useEffect(() => {
    const em = readSessionEmail();
    if (!em) return;
    setViewerEmail(em);
    let cancelled = false;
    void (async () => {
      const r = await getProfileAction(em);
      if (cancelled) return;
      setIsSignedIn(r.ok);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* When the email becomes known, re-fetch with the viewer header so
     `viewerHasMarkedHelpful` is accurate. */
  useEffect(() => {
    if (!viewerEmail) return;
    void fetchPage(pageRef.current, msFilterRef.current);
  }, [viewerEmail, fetchPage]);

  /* ─── Socket.IO ─── */
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
      setPendingCount((n) => Math.min(n + 1, MAX_PENDING));
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  /* ─── action dispatchers ─── */
  const requireSignedIn = useCallback(
    (action: GatedAction): boolean => {
      if (viewerEmail && isSignedIn) return true;
      setSignInAction(action);
      setSignInOpen(true);
      return false;
    },
    [viewerEmail, isSignedIn],
  );

  const requestPost = useCallback(() => {
    if (!requireSignedIn("post")) return;
    setSubmitOpen(true);
  }, [requireSignedIn]);

  const requestReply = useCallback(
    (post: ApprovedPost) => {
      if (!requireSignedIn("reply")) return;
      setReplyTarget(post);
      setReplyOpen(true);
    },
    [requireSignedIn],
  );

  const requestHelpful = useCallback(
    (postId: string) => {
      if (!requireSignedIn("mark helpful")) return;
      const email = viewerEmail;
      if (!email) return;

      /* Optimistic update — flip the local state immediately so the count
         increments without a network roundtrip. Roll back on failure. */
      let prev: ApprovedPost | undefined;
      setPosts((all) =>
        all.map((p) => {
          if (p.id !== postId) return p;
          prev = p;
          if (p.helpfulActive) return p;
          return {
            ...p,
            helpfulCount: p.helpfulCount + 1,
            helpfulActive: true,
          };
        }),
      );
      void markCommunityHelpfulAction(email, postId).then((res) => {
        if (!res.ok) {
          setPosts((all) =>
            all.map((p) => (p.id === postId && prev ? prev : p)),
          );
          showToast(res.error, "amber");
          return;
        }
        /* Reconcile with the canonical server count. */
        setPosts((all) =>
          all.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  helpfulCount: res.helpful,
                  helpfulActive: res.viewerHasMarkedHelpful,
                }
              : p,
          ),
        );
      });
    },
    [requireSignedIn, viewerEmail, showToast],
  );

  const setMsFilter = useCallback(
    (ms: CommunityMsFilter) => {
      setMsFilterState(ms);
      void fetchPage(1, ms);
    },
    [fetchPage],
  );

  const loadPage = useCallback(
    (n: number) => {
      void fetchPage(n, msFilterRef.current);
    },
    [fetchPage],
  );

  const loadNewPosts = useCallback(() => {
    setPendingCount(0);
    void fetchPage(1, msFilterRef.current).then(() => {
      setLiveCount((c) => c + 1);
    });
  }, [fetchPage]);

  /* ─── overlay helpers ─── */
  const openSubmit = useCallback(() => requestPost(), [requestPost]);
  const closeSubmit = useCallback(() => setSubmitOpen(false), []);

  const openAppeal = useCallback((ctx?: AppealContext) => {
    setAppealContext(ctx ?? null);
    setAppealOpen(true);
  }, []);
  const closeAppeal = useCallback(() => setAppealOpen(false), []);
  const closeReply = useCallback(() => {
    setReplyOpen(false);
    setReplyTarget(null);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const ctxValue = useMemo<CommunityUi>(
    () => ({
      liveCount,
      socketLive,
      viewerEmail,
      isSignedIn,
      posts,
      page,
      totalPages,
      total,
      msFilter,
      loading,
      requestPost,
      requestHelpful,
      requestReply,
      loadPage,
      setMsFilter,
      openSubmit,
      openAppeal,
      toast: showToast,
    }),
    [
      liveCount,
      socketLive,
      viewerEmail,
      isSignedIn,
      posts,
      page,
      totalPages,
      total,
      msFilter,
      loading,
      requestPost,
      requestHelpful,
      requestReply,
      loadPage,
      setMsFilter,
      openSubmit,
      openAppeal,
      showToast,
    ],
  );

  return (
    <CommunityUiProvider value={ctxValue}>
      {children}

      <NewPostBar count={pendingCount} onLoad={loadNewPosts} />

      <SubmitMilestoneModal
        open={submitOpen}
        email={viewerEmail}
        onClose={closeSubmit}
        onSuccess={(msg) => showToast(msg, "green")}
        onValidationFail={(msg) => showToast(msg, "amber")}
      />
      <ReplyModal
        open={replyOpen}
        parent={replyTarget}
        email={viewerEmail}
        onClose={closeReply}
        onSuccess={(msg) => showToast(msg, "green")}
        onValidationFail={(msg) => showToast(msg, "amber")}
      />
      <AppealModal
        open={appealOpen}
        context={appealContext}
        onClose={closeAppeal}
        onSuccess={(msg) => showToast(msg, "green")}
        onValidationFail={(msg) => showToast(msg, "amber")}
      />
      <SignInPromptModal
        open={signInOpen}
        action={signInAction}
        onClose={() => setSignInOpen(false)}
      />

      <CommunityToaster toast={toast} />
    </CommunityUiProvider>
  );
}
