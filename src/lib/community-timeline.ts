import type { MilestoneKey } from "@/lib/types";

/** Milestones shown on community post mini-timelines (AOR omitted). */
export const COMMUNITY_TIMELINE_ORDER: MilestoneKey[] = [
  "biometrics",
  "background",
  "medical",
  "p1",
  "p2",
  "ecopr",
];

const SHORT_LABEL: Record<MilestoneKey, string> = {
  aor: "AOR",
  biometrics: "Bio",
  background: "BGC",
  medical: "Med",
  p1: "P1",
  p2: "P2",
  ecopr: "eCOPR",
};

/** Community post `ms` field → dashboard milestone key. */
export const COMMUNITY_MS_TO_KEY: Record<string, MilestoneKey> = {
  ecopr: "ecopr",
  p1: "p1",
  p2: "p2",
  bil: "biometrics",
  bg: "background",
  med: "medical",
};

export type CommunityTimelineStep = { label: string; done: boolean };

/**
 * Build timeline steps for a post from the milestone tag the user selected.
 * All steps up to and including that milestone render as completed (green).
 */
export function communityTimelineFromMs(ms: string): CommunityTimelineStep[] {
  const target = COMMUNITY_MS_TO_KEY[ms];
  const targetIdx = target
    ? COMMUNITY_TIMELINE_ORDER.indexOf(target)
    : -1;
  return COMMUNITY_TIMELINE_ORDER.map((key, i) => ({
    label: SHORT_LABEL[key],
    done: targetIdx >= 0 && i <= targetIdx,
  }));
}
