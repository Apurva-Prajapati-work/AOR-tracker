"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppealModal } from "./AppealModal";
import {
  CommunityUiProvider,
  type AppealContext,
  type CommunityUi,
  type ToastTone,
} from "./CommunityUiContext";
import { CommunityToaster, type ToastItem } from "./CommunityToaster";
import { generateDynamicPost } from "./data";
import type { CommunityPageData, Post } from "./data";
import { NewPostBar } from "./NewPostBar";
import { SubmitMilestoneModal } from "./SubmitMilestoneModal";

type Props = {
  data: CommunityPageData;
  /**
   * The server-rendered body of the page (CommunityNav + CommunityClient) is
   * passed in as children so the shell can sit between it and the page
   * wrapper, render the overlays alongside it, and provide the
   * `CommunityUiContext` to all descendants without forcing the whole tree
   * to become client components.
   */
  children: React.ReactNode;
};

/** ms between live-counter tick attempts (matches HTML sample). */
const LIVE_TICK_MS = 5000;
/** Probability a tick actually increments. */
const LIVE_TICK_PROB = 0.4;
/** First simulated "new posts" pulse after mount. */
const FIRST_PULSE_MS = 8000;
/** Steady-state interval for further simulated pulses. */
const STEADY_PULSE_MS = 22000;
/** Soft cap on pending count before we stop incrementing further. */
const MAX_PENDING = 5;
/** How long a toast stays on screen before auto-dismissing. */
const TOAST_MS = 3500;

/**
 * Client wrapper that owns all interactive state for the community page:
 *   - live online counter (auto-ticks)
 *   - simulated SSE pulses → drives the new-post notification bar
 *   - clicking the bar prepends a freshly-generated card to the feed
 *   - submit / appeal modals + toast queue
 *
 * The static body (sidebar / feed / right panel) is rendered server-side
 * and passed in as `children`. Only the cross-cutting controls (nav button,
 * sidebar quick-link, in-feed CTA, appeal CTA, dynamic posts list) reach
 * back into this state via `useCommunityUi()`.
 *
 * TODO(real-data): the simulated SSE block at the bottom of this file is
 *   the seam where real Socket.IO subscription should slot in. The existing
 *   `src/lib/community-broadcast.ts` already emits a `feed:refresh` event;
 *   call `incrementPending(1)` when it fires.
 */
export function CommunityShell({ data, children }: Props) {
  const [liveCount, setLiveCount] = useState(data.liveCount);
  const [dynamicPosts, setDynamicPosts] = useState<Post[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [appealOpen, setAppealOpen] = useState(false);
  const [appealContext, setAppealContext] = useState<AppealContext | null>(
    null,
  );
  const [toast, setToast] = useState<ToastItem | null>(null);
  const toastIdRef = useRef(0);
  const toastTimerRef = useRef<number | null>(null);

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

  const incrementPending = useCallback((by: number) => {
    setPendingCount((prev) => Math.min(prev + by, MAX_PENDING));
  }, []);

  const openSubmit = useCallback(() => setSubmitOpen(true), []);
  const closeSubmit = useCallback(() => setSubmitOpen(false), []);

  const openAppeal = useCallback((ctx?: AppealContext) => {
    setAppealContext(ctx ?? null);
    setAppealOpen(true);
  }, []);
  const closeAppeal = useCallback(() => setAppealOpen(false), []);

  const loadNewPosts = useCallback(() => {
    if (pendingCount === 0) return;
    const fresh: Post[] = [];
    for (let i = 0; i < pendingCount; i++) {
      fresh.push(generateDynamicPost());
    }
    setDynamicPosts((prev) => [...fresh, ...prev]);
    setLiveCount((n) => n + pendingCount);
    setPendingCount(0);
  }, [pendingCount]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (Math.random() < LIVE_TICK_PROB) {
        setLiveCount((n) => n + 1);
      }
    }, LIVE_TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const first = window.setTimeout(() => {
      incrementPending(Math.floor(Math.random() * 2) + 1);
    }, FIRST_PULSE_MS);
    const steady = window.setInterval(() => {
      incrementPending(1);
    }, STEADY_PULSE_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(steady);
    };
  }, [incrementPending]);

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
      dynamicPosts,
      openSubmit,
      openAppeal,
      toast: showToast,
    }),
    [liveCount, dynamicPosts, openSubmit, openAppeal, showToast],
  );

  return (
    <CommunityUiProvider value={ctxValue}>
      {children}

      <NewPostBar count={pendingCount} onLoad={loadNewPosts} />

      <SubmitMilestoneModal
        open={submitOpen}
        onClose={closeSubmit}
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

      <CommunityToaster toast={toast} />
    </CommunityUiProvider>
  );
}
