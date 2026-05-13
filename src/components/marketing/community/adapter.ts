/**
 * Adapter: backend `CommunityPost` (from MongoDB, defined in @/lib/types) →
 * marketing `ApprovedPost` (defined in ./data.ts, consumed by FeedCard).
 *
 * The marketing UI uses a much richer shape than the DB (discriminated union
 * with `approved | ownPending | ownRemoved`, plus structured `cohort`,
 * `timeline`, `replies`, etc.). This file is the single seam where the two
 * shapes are reconciled — keep all the mapping logic here so the components
 * downstream just consume one well-typed type.
 *
 * Security note: posts created by users are stored with `bodyIsHtml: false`.
 * `bodyHtml` is only ever set for trusted seed posts. For user posts we
 * escape and wrap in a `<p>` so FeedCard's `dangerouslySetInnerHTML` always
 * receives safe markup. Never relax this without adding HTML sanitisation.
 */

import type { CommunityPost, CommunityReplyRef } from "@/lib/types";
import type {
  ApprovedPost,
  CohortItem,
  MilestoneAccent,
  MilestoneChipColor,
  TimelineDot,
} from "./data";

/* ─── ms → marketing tokens ─────────────────────────────────────────── */

/** Backend stores `bg`/`med`; the marketing tokens use `bgc`/`med`. */
const MS_TO_ACCENT: Record<string, MilestoneAccent> = {
  ppr: "ppr",
  bil: "bil",
  bg: "bgc",
  med: "med",
};

/** Same mapping for the chip color token. */
const MS_TO_CHIP_COLOR: Record<string, MilestoneChipColor> = {
  ppr: "ppr",
  bil: "bil",
  bg: "bgc",
  med: "med",
};

/* ─── helpers ───────────────────────────────────────────────────────── */

/** "Applicant · <local>" → "#<local>". Keeps the leading "#" so it lines up
 *  with the seeded "#3847"-style ids in `data.ts`. */
function displayIdFromName(name: string): string {
  const tail = name.replace(/^Applicant\s*·\s*/i, "").trim();
  if (!tail) return "#anon";
  return tail.startsWith("#") ? tail : `#${tail}`;
}

/** Pull the first " · "-separated segment of `meta` to use as `stream`.
 *  `meta` is built by `metaFromProfile` in @/app/actions/community.ts as
 *  `<stream> · <aorDate> AOR · <type>`. */
function streamFromMeta(meta: string): string | undefined {
  const first = meta.split("·")[0]?.trim();
  return first || undefined;
}

/** Build the structured `cohort` rows from the loose `meta` string.
 *  Best-effort — anything we can't classify becomes a generic "Detail" row. */
function cohortFromMeta(meta: string): CohortItem[] {
  const items: CohortItem[] = [];
  const segments = meta
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (i === 0) {
      items.push({ label: "Stream", value: seg });
      continue;
    }
    const aorMatch = seg.match(/^(\d{4}-\d{2}-\d{2})\s*AOR$/i);
    if (aorMatch) {
      const d = new Date(`${aorMatch[1]}T12:00:00`);
      const label = Number.isNaN(d.getTime())
        ? aorMatch[1]
        : d.toLocaleDateString("en-CA", { month: "short", year: "numeric" });
      items.push({ label: "AOR Month", value: label });
      continue;
    }
    if (/inland|outland/i.test(seg)) {
      items.push({ label: "Type", value: seg });
      continue;
    }
    items.push({ label: "Detail", value: seg });
  }
  return items;
}

/** Map the simple `tl: [{label, done}]` shape into the marketing's
 *  `TimelineDot[]`. The last dot of a fully-completed timeline gets the
 *  PPR-style outer ring (`highlight`) so it matches the seed cards. */
function timelineFromTl(tl: CommunityPost["tl"]): TimelineDot[] {
  return tl.map((t, idx) => {
    const isLast = idx === tl.length - 1;
    const allDoneSoFar = tl.slice(0, idx + 1).every((x) => x.done);
    const state: TimelineDot["state"] = t.done ? "done" : "wait";
    return {
      state,
      label: t.label,
      highlight: isLast && t.done && allDoneSoFar,
    };
  });
}

/** Escape user-supplied text so it can be handed to dangerouslySetInnerHTML
 *  safely. Preserves newlines via `<br>` so the marketing card body keeps
 *  its line breaks (the dashboard panel achieves the same via
 *  `whitespace-pre-wrap`; for parity with the seed cards which expect HTML,
 *  we render `<br>` here). */
function escapeAndWrap(plain: string): string {
  const escaped = plain
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  return `<p>${escaped.replace(/\n/g, "<br/>")}</p>`;
}

/**
 * Best-effort relative time. Matches the seed timestamps ("4 min ago",
 * "1 hr ago"). Anything older than a week falls back to a short date.
 */
export function timeAgo(input: string | Date | undefined | null): string {
  if (!input) return "";
  const ts = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(ts.getTime())) return "";
  const diff = Date.now() - ts.getTime();
  if (diff < 45_000) return "Just now";
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return ts.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

/* ─── main converter ───────────────────────────────────────────────── */

/**
 * Convert one DB post into a marketing `ApprovedPost`. The DB shape doesn't
 * currently encode `ownPending` / `ownRemoved` (no moderation pipeline yet),
 * so every live row maps to `kind: "approved"`. Seeded ownPending/ownRemoved
 * still come from `data.ts` and are merged in `buildCommunityPageData`.
 */
export function communityPostToApproved(
  src: CommunityPost,
  /** Falls back to "med" if the backend ever stores an unknown ms. */
  options?: { fallbackAccent?: MilestoneAccent },
): ApprovedPost {
  const accent =
    MS_TO_ACCENT[src.ms] ?? options?.fallbackAccent ?? "med";
  const chipColor = MS_TO_CHIP_COLOR[src.ms] ?? "med";
  const cohortRows = cohortFromMeta(src.meta);

  return {
    kind: "approved",
    id: src.id,
    displayId: displayIdFromName(src.name),
    accent,
    milestoneChip: { label: src.msl, color: chipColor },
    stream: streamFromMeta(src.meta),
    timestamp: timeAgo(src.createdAt),
    geminiVerified: false,
    cohort: cohortRows,
    timeline: timelineFromTl(src.tl),
    bodyHtml: src.bodyIsHtml ? src.body : escapeAndWrap(src.body),
    helpfulCount: src.helpful ?? 0,
    helpfulActive: src.viewerHasMarkedHelpful ?? false,
    /* Per-parent reply count needs a `$lookup` over `replyToId`. Not wired
       yet — top-level cards just don't surface a reply count. */
    replyCount: 0,
    replies: [],
    replyTo: src.replyTo ?? undefined,
  };
}

export type { CommunityPost, CommunityReplyRef };
