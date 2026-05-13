/**
 * Seed data and types for the "dashboard-new" preview page.
 *
 * This is a parallel implementation of `/dashboard`, scoped under
 * `(marketing)/dashboard-new` so the team can iterate on the new UI without
 * disturbing the production dashboard.
 *
 * NOTE: every field below is currently static / dummy data lifted from
 * `samples/aortrack-dashboard.html`. When this design is promoted, swap each
 * source for the real values exposed by `DashboardContext`:
 *
 *   - profile, days, median, pct                  → ctx.profile / ctx.days …
 *   - cohort bars, histogram, dot-map, compare    → ctx.cohort / ctx.cohortDisplay
 *   - PPR window                                  → ctx.ppr
 *   - shareUrl                                    → ctx.shareUrl
 *   - alerts                                      → ctx.cohortInsights (filtered to "alerts")
 *
 * Look for `TODO(dashboard-new):` markers throughout the components.
 */

import type { ReactNode } from "react";

/* ───────────────────────────── PROFILE / IDENTITY ────────────────────── */

export type DnProfile = {
  applicantId: string;
  stream: string;
  typeLabel: string;
  province: string;
  aorDateLabel: string;
  cohortLabel: string;
};

export const DN_PROFILE: DnProfile = {
  applicantId: "#4821",
  stream: "CEC General",
  typeLabel: "Inland",
  province: "Ontario",
  aorDateLabel: "Feb 20, 2026",
  cohortLabel: "CEC General · Feb 2026",
};

/* ───────────────────────────── HERO STATS ────────────────────────────── */

export type DnHeroStats = {
  /** Animated days-since-AOR counter target. */
  daysSinceAor: number;
  daysSinceLabel: string;
  streamMedian: { value: string; deltaLabel: string; deltaDir: "up" | "dn" };
  cohortRank: { value: string; sub: string };
  pprWindow: { value: string; sub: string };
};

export const DN_HERO_STATS: DnHeroStats = {
  daysSinceAor: 72,
  daysSinceLabel: "Feb 20, 2026",
  streamMedian: { value: "184d", deltaLabel: "+2d", deltaDir: "up" },
  cohortRank: { value: "Top 58%", sub: "482 of 1,240 ahead" },
  pprWindow: { value: "Aug – Oct '26", sub: "P25–P75 confidence" },
};

/* ───────────────────────────── RINGS ─────────────────────────────────── */

export type DnRing = {
  id: string;
  gradientId: string;
  gradientFrom: string;
  gradientTo: string;
  /** 0..1 — fraction of circle to fill once mounted. */
  pct: number;
  pctLabel: string;
  title: string;
  sub: string;
  /** Optional CSS color override for the centre number (e.g. var(--blue)). */
  numColor?: string;
};

export const DN_RINGS: DnRing[] = [
  {
    id: "journey",
    gradientId: "dn-rg1",
    gradientFrom: "#2D6A4F",
    gradientTo: "#4ade80",
    pct: 0.39,
    pctLabel: "39%",
    title: "Journey Progress",
    sub: "72 of ~184 median days elapsed. You're past the biometrics stage.",
  },
  {
    id: "cohort-ppr",
    gradientId: "dn-rg2",
    gradientFrom: "#1E5F8C",
    gradientTo: "#7dd3fc",
    pct: 0.39,
    pctLabel: "39%",
    title: "Cohort PPR Rate",
    sub: "482 of 1,240 applicants in your Feb 2026 cohort have received PPR.",
    numColor: "var(--blue)",
  },
];

/* ───────────────────────────── PPR WINDOW BAR ────────────────────────── */

export type DnPprWindow = {
  label: string;
  windowLabel: string;
  nVerifiedNote: string;
  confidenceLabel: string;
  /** Where the "you" marker sits along the bar, in %. */
  youPct: number;
  /** Animated progress fill width %. */
  progressPct: number;
  /** Window band left/width %. */
  bandLeftPct: number;
  bandWidthPct: number;
  axisLabels: [string, string, string, string];
};

export const DN_PPR_WINDOW: DnPprWindow = {
  label: "Estimated PPR Window",
  windowLabel: "August – October 2026",
  nVerifiedNote: "Based on 1,240 verified submissions",
  confidenceLabel: "P25–P75 Confidence",
  youPct: 39,
  progressPct: 39,
  bandLeftPct: 69,
  bandWidthPct: 17,
  axisLabels: ["Feb 20 (AOR)", "Today →", "Aug '26 (P25)", "Oct '26 (P75)"],
};

/* ───────────────────────────── TIMELINE ──────────────────────────────── */

export type DnTimelineState = "done" | "now" | "wait" | "final";

export type DnTimelineBadge =
  | { kind: "verified"; label: string }
  | { kind: "pending"; label: string }
  | { kind: "estimate"; label: string };

export type DnTimelineRow = {
  /** Stable key, also used to address the inline edit panel. */
  key: string;
  state: DnTimelineState;
  name: string;
  desc: string;
  badge?: DnTimelineBadge;
  /** Right column. Either a concrete date+day, or "Not yet". */
  date?: { date: string; day: string };
  pending?: boolean;
  /** Whether this row has an inline "Edit" / "+ Add date" affordance. */
  edit?:
    | {
        label: string;
        /** Field label shown above the date input. */
        fieldLabel: string;
        /** Initial date value (yyyy-mm-dd). */
        initial?: string;
        /** Override Save button text (e.g. "Save & contribute to community"). */
        saveLabel?: string;
        /** If true, the panel is opened from the right column (date column). */
        fromDate?: boolean;
      }
    | undefined;
};

export const DN_TIMELINE: DnTimelineRow[] = [
  {
    key: "aor",
    state: "done",
    name: "AOR — Acknowledgement of Receipt",
    desc: "Your application entered the IRCC processing queue.",
    badge: { kind: "verified", label: "Verified" },
    date: { date: "Feb 20, 2026", day: "Day 0" },
  },
  {
    key: "bil",
    state: "done",
    name: "BIL — Background Initiated Letter",
    desc: "IRCC has begun background processing on your file.",
    badge: { kind: "verified", label: "Verified · contributed to cohort stats" },
    date: { date: "Mar 8, 2026", day: "Day 16" },
    edit: {
      label: "Edit",
      fieldLabel: "BIL Date",
      initial: "2026-03-08",
      fromDate: true,
    },
  },
  {
    key: "bio",
    state: "done",
    name: "Biometrics Confirmed",
    desc: "Your biometrics verified in the IRCC system.",
    badge: { kind: "pending", label: "Pending Gemini review" },
    date: { date: "Mar 22, 2026", day: "Day 30" },
    edit: {
      label: "Edit",
      fieldLabel: "Biometrics Date",
      initial: "2026-03-22",
      fromDate: true,
    },
  },
  {
    key: "bgc",
    state: "now",
    name: "Background Check",
    desc: "Security and criminal background checks underway.",
    badge: {
      kind: "estimate",
      label: "Est. Day 58–90 · 341 cohort members at this stage",
    },
    pending: true,
    edit: {
      label: "+ Add date",
      fieldLabel: "Background Check Start Date",
      saveLabel: "Save & contribute to community",
    },
  },
  {
    key: "med",
    state: "wait",
    name: "Medical Results",
    desc: "IRCC reviewing your medical examination results.",
    badge: {
      kind: "estimate",
      label: "Est. Day 75–110 · 298 cohort members past this",
    },
    pending: true,
    edit: { label: "+ Add date", fieldLabel: "Medical Results Date" },
  },
  {
    key: "ppr",
    state: "final",
    name: "PPR — Passport Request",
    desc: "Final step before COPR. Your application has been approved.",
    badge: {
      kind: "estimate",
      label: "Est. Aug–Oct 2026 · P25–P75 · 482 of your cohort received",
    },
    pending: true,
  },
];

export const DN_TIMELINE_NOTE =
  "Estimates from 1,240 Gemini-verified submissions · CEC General · Feb 2026 · Updated May 3, 2026";

/* ───────────────────────────── COHORT BARS ───────────────────────────── */

export type DnCohortBarFill = "g" | "b" | "a" | "r";

export type DnCohortBar = {
  name: string;
  /** Renderable name (lets us add icons inline). */
  nameNode?: ReactNode;
  countLabel: string;
  pct: number;
  fill: DnCohortBarFill;
  note?: string;
};

export const DN_COHORT_BARS: DnCohortBar[] = [
  {
    name: "AOR Received",
    countLabel: "1,240 / 1,240 (100%)",
    pct: 100,
    fill: "g",
  },
  {
    name: "BIL Received",
    countLabel: "1,108 / 1,240 (89%)",
    pct: 89,
    fill: "b",
    note: "Median: Day 14 after AOR",
  },
  { name: "Biometrics", countLabel: "974 / 1,240 (79%)", pct: 79, fill: "b" },
  {
    name: "Background Check",
    countLabel: "681 / 1,240 (55%)",
    pct: 55,
    fill: "a",
  },
  {
    name: "Medical Passed",
    countLabel: "544 / 1,240 (44%)",
    pct: 44,
    fill: "a",
  },
  {
    name: "PPR Received",
    countLabel: "482 / 1,240 (39%)",
    pct: 39,
    fill: "r",
    note: "Median: Day 184 · Fastest: Day 142 · Slowest tracked: Day 231",
  },
];

/* ───────────────────────────── HISTOGRAM ─────────────────────────────── */

export type DnHistBar = {
  label: string;
  value: number;
  /** n=cohort, h=your-window, y=your-position. */
  type: "n" | "h" | "y";
};

export const DN_HIST: DnHistBar[] = [
  { label: "<150d", value: 18, type: "n" },
  { label: "155d", value: 34, type: "n" },
  { label: "162d", value: 52, type: "n" },
  { label: "170d", value: 88, type: "n" },
  { label: "178d", value: 96, type: "n" },
  { label: "186d", value: 80, type: "h" },
  { label: "194d", value: 62, type: "h" },
  { label: "202d", value: 42, type: "h" },
  { label: "210d", value: 28, type: "y" },
  { label: ">220d", value: 12, type: "n" },
];

/* ───────────────────────────── DOT MAP ───────────────────────────────── */

export type DnDotMap = {
  total: number;
  pprUpTo: number;
  midUpTo: number;
  /** Index (0-based) of the "you" dot inside the grid. */
  youIndex: number;
};

export const DN_DOT_MAP: DnDotMap = {
  total: 500,
  pprUpTo: 194,
  midUpTo: 339, // ppr (194) + mid (145)
  youIndex: 210,
};

/* ───────────────────────────── STREAM COMPARE ────────────────────────── */

export type DnStreamRow = {
  name: string;
  days: string;
  fillPct: number;
  /** Either the user's stream or a comparator. */
  variant: "neutral" | "you" | "fastest";
};

export const DN_STREAM_COMPARE: DnStreamRow[] = [
  { name: "CEC French", days: "134d", fillPct: 52, variant: "fastest" },
  { name: "CEC STEM", days: "162d", fillPct: 63, variant: "neutral" },
  { name: "CEC General", days: "184d", fillPct: 72, variant: "you" },
  { name: "FSW General", days: "198d", fillPct: 77, variant: "neutral" },
  { name: "PNP", days: "216d", fillPct: 84, variant: "neutral" },
];

/* ───────────────────────────── ALERTS ────────────────────────────────── */

export type DnAlertCard = {
  tone: "amber" | "green";
  iconKind: "warn" | "check";
  title: string;
  desc: string;
  meta: string[];
  linkLabel: string;
  href: string;
};

export const DN_ALERTS: DnAlertCard[] = [
  {
    tone: "amber",
    iconKind: "warn",
    title: "WES Verification Delay — CEC General",
    desc:
      "12 applicants report WES credential results not updating in the IRCC online tracker. IRCC confirmation pending. May delay biometrics confirmation for some applicants.",
    meta: ["12 members", "3 days ago"],
    linkLabel: "View full details",
    href: "#",
  },
  {
    tone: "green",
    iconKind: "check",
    title: "Processing Velocity Up This Week — CEC General",
    desc:
      "18 PPR approvals reported in the Feb 2026 cohort this week — highest weekly count since launch. Processing appears to be accelerating.",
    meta: ["18 members", "1 day ago"],
    linkLabel: "View community feed",
    href: "#",
  },
];

export const DN_ALERT_STRIP = {
  title: "WES Delay Alert:",
  body:
    "12 CEC General applicants report WES results not updating in IRCC tracker.",
  linkLabel: "View details",
};

/* ───────────────────────────── SHARE ─────────────────────────────────── */

export type DnShare = {
  shareUrl: string;
  shareUrlDisplay: string;
  githubUrl: string;
};

export const DN_SHARE: DnShare = {
  shareUrl: "https://track.getnorthpath.com/t/hopeful-maple-cec-general-feb2026",
  shareUrlDisplay: "track.getnorthpath.com/t/hopeful-maple-cec-general-feb2026",
  githubUrl: "https://github.com/Get-North-Path/AOR-tracker",
};

/* ───────────────────────────── CONSULTING CTA ────────────────────────── */

export const DN_CONSULTING_CTA = {
  heading: "Need more than tracking?",
  sub:
    "GetNorthPath consultants manage your full PR application — ITA strategy through PPR submission. $299 CAD, AI-powered forms, expert review.",
  ctaLabel: "Book Free Consultation",
  href: "https://www.getnorthpath.com/contact?utm_source=dashboard",
};

/* ───────────────────────────── SIDEBAR ───────────────────────────────── */

/** Section labels + items in the new sidebar. */
export const DN_SIDEBAR = {
  dashboard: [
    {
      key: "overview",
      label: "Overview",
      icon: "overview" as const,
      href: "#top",
      active: true,
    },
    {
      key: "timeline",
      label: "My Timeline",
      icon: "timeline" as const,
      href: "#tl-sec",
    },
    {
      key: "cohort",
      label: "My Cohort",
      icon: "cohort" as const,
      href: "#cohort-sec",
      badge: "1,240",
    },
    {
      key: "alerts",
      label: "Alerts",
      icon: "alerts" as const,
      href: "#alerts-sec",
      badge: "1",
      badgeTone: "red" as const,
    },
  ],
  community: [
    {
      key: "feed",
      label: "Community Feed",
      icon: "feed" as const,
      href: "/community",
    },
    {
      key: "feedback",
      label: "Give Feedback",
      icon: "plus" as const,
      href: "#",
    },
  ],
  /**
   * Share section mirrors the pair of links present in the current
   * `/dashboard` sidebar (`Processing Stats` immediately followed by
   * `Share Timeline`). The order matches the production sidebar so users
   * upgrading from the old design see the same grouping.
   *
   * `Processing Stats` keeps living at `/dashboard/stats` for now — the new
   * page-level Share section is reached via the `#share-sec` anchor.
   */
  share: [
    {
      key: "share-stats",
      label: "Processing Stats",
      icon: "stats" as const,
      href: "/dashboard/stats",
    },
    {
      key: "share-link",
      label: "Share Timeline",
      icon: "share" as const,
      /** Anchors to the on-page Share section. */
      href: "#share-sec",
    },
  ],
  profile: [
    {
      key: "add-email",
      label: "Add Email",
      icon: "email" as const,
      href: "/profile/add-email",
    },
    {
      key: "delete",
      label: "Delete My Data",
      icon: "trash" as const,
      kind: "danger" as const,
    },
  ],
};

/* ─────────────────────── NO-EMAIL WARNING (sidebar) ──────────────────── */

export const DN_NO_EMAIL_WARN = {
  body: "No email on file.",
  linkLabel: "Add email",
  linkHref: "/profile/add-email",
  trailing: "to resume from any device.",
};
