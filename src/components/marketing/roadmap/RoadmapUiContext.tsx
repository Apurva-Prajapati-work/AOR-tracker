"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { RoadmapCategory } from "./data";

/**
 * UI state shared across the roadmap page's interactive bits:
 *   - the active filter chip (`all` or one of the categories),
 *   - a single auto-dismissing toast,
 *   - the per-card voted set + vote/unvote handler.
 *
 * RoadmapShell owns the state; RoadmapFilterBar, RoadmapKanban, RoadmapCard,
 * and RoadmapToaster all read/write through this context.
 */

export type RoadmapFilter = "all" | RoadmapCategory;

export type RoadmapToast = {
  id: number;
  message: string;
};

type Ctx = {
  filter: RoadmapFilter;
  setFilter: (f: RoadmapFilter) => void;
  toast: RoadmapToast | null;
  showToast: (message: string) => void;
  dismissToast: () => void;
  votedSet: ReadonlySet<number>;
  toggleVote: (issue: number) => void;
};

const RoadmapUiContext = createContext<Ctx | null>(null);

type ProviderProps = {
  initialVoted: ReadonlySet<number>;
  children: React.ReactNode;
};

export function RoadmapUiProvider({ initialVoted, children }: ProviderProps) {
  const [filter, setFilterState] = useState<RoadmapFilter>("all");
  const [toast, setToast] = useState<RoadmapToast | null>(null);
  const [voted, setVoted] = useState<Set<number>>(() => new Set(initialVoted));

  const showToast = useCallback((message: string) => {
    setToast({ id: Date.now(), message });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const setFilter = useCallback(
    (next: RoadmapFilter) => {
      setFilterState(next);
      showToast(`Filtering: ${next}`);
    },
    [showToast],
  );

  const toggleVote = useCallback(
    (issue: number) => {
      setVoted((prev) => {
        const next = new Set(prev);
        if (next.has(issue)) {
          next.delete(issue);
        } else {
          next.add(issue);
          showToast("Upvoted");
        }
        return next;
      });
    },
    [showToast],
  );

  const value = useMemo<Ctx>(
    () => ({
      filter,
      setFilter,
      toast,
      showToast,
      dismissToast,
      votedSet: voted,
      toggleVote,
    }),
    [filter, setFilter, toast, showToast, dismissToast, voted, toggleVote],
  );

  return (
    <RoadmapUiContext.Provider value={value}>
      {children}
    </RoadmapUiContext.Provider>
  );
}

export function useRoadmapUi(): Ctx {
  const ctx = useContext(RoadmapUiContext);
  if (!ctx) {
    throw new Error("useRoadmapUi must be used inside <RoadmapUiProvider>");
  }
  return ctx;
}
