"use client";

import { useMemo } from "react";
import type { RoadmapData } from "./data";
import { RoadmapToaster } from "./RoadmapToaster";
import { RoadmapUiProvider } from "./RoadmapUiContext";

type Props = {
  data: RoadmapData;
  children: React.ReactNode;
};

/**
 * Client wrapper that holds all interactive UI state for the roadmap page:
 *
 *   - active filter chip,
 *   - voted issue set,
 *   - toast queue.
 *
 * The static body (nav + hero + stats + kanban grid + milestones) is passed
 * in via `children` so we keep SSR for everything except what genuinely needs
 * interactivity.
 */
export function RoadmapShell({ data, children }: Props) {
  const initialVoted = useMemo<ReadonlySet<number>>(
    () =>
      new Set(
        data.cards.filter((c) => c.voted).map((c) => c.issue),
      ),
    [data.cards],
  );

  return (
    <RoadmapUiProvider initialVoted={initialVoted}>
      {children}
      <RoadmapToaster />
    </RoadmapUiProvider>
  );
}
