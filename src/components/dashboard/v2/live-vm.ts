"use client";

/**
 * Adapters that derive the v2 dashboard view-models from the live
 * `DashboardContext` shape. Each function returns the prop value expected by
 * a single v2 section component (HeroBar, Rings, PprBar, Timeline, etc.).
 *
 * Keeping these here (vs inside the section components) means:
 *   - The section components stay framework-agnostic and props-driven, so
 *     the seed preview and live dashboard share one implementation.
 *   - All cohort-stats → UI math lives in one place — easy to audit when
 *     swapping the data pipeline (e.g. once histogram bucket sizes change).
 *
 * Naming follows the seed structure (`Dn*`) so the v2 components don't need
 * to learn anything new.
 */

import type { DashboardContextValue } from "@/components/dashboard/DashboardContext";
import { fmtDate } from "@/lib/format";
import { humanizeCohortKey } from "@/lib/cohort";
import type { MilestoneDefRow } from "@/lib/cohort-dynamic";
import type { MilestoneKey, UserProfile } from "@/lib/types";
import type {
  DnAlertCard,
  DnCohortBar,
  DnDotMap,
  DnHeroStats,
  DnHistBar,
  DnPprWindow,
  DnProfile,
  DnRing,
  DnStreamRow,
  DnTimelineRow,
  DnTimelineState,
  SidebarItem,
  SidebarSections,
} from "./data";

/* ─── PROFILE / IDENTITY ────────────────────────────────────────────── */

/**
 * Stable short id we can use to label the user in the dashboard chrome
 * ("Applicant #4821"). Production stores the user by email — we hash it
 * lightly so the id is short, deterministic and non-PII-leaking.
 */
function applicantIdFromEmail(email: string): string {
  let h = 0;
  for (let i = 0; i < email.length; i++) {
    h = (h * 31 + email.charCodeAt(i)) | 0;
  }
  const n = Math.abs(h) % 9000 + 1000;
  return `#${n}`;
}

export function profileVM(email: string, profile: UserProfile): DnProfile {
  return {
    applicantId: applicantIdFromEmail(email),
    stream: profile.stream || "—",
    typeLabel: profile.type || "—",
    province: profile.province || "—",
    aorDateLabel: fmtDate(profile.aorDate) || "Not set",
    cohortLabel: humanizeCohortKey(
      `${profile.stream}:${profile.aorDate}:${profile.type}:${profile.province}`,
    ),
  };
}

/* ─── HERO STATS ────────────────────────────────────────────────────── */

export function heroStatsVM(
  ctx: Pick<
    DashboardContextValue,
    "days" | "median" | "cohort" | "cohortDisplay" | "ppr" | "profile"
  >,
): DnHeroStats {
  const { days, median, cohort, cohortDisplay, ppr, profile } = ctx;
  const completionPct = Math.round((cohort.completion_rate ?? 0) * 100);
  const weeklyPct = Math.round((cohort.weekly_delta ?? 0) * 100);
  const aheadCount = cohortDisplay.per_milestone_n?.ppr ?? 0;
  const totalCount = cohortDisplay.n_verified || 1;
  const rankPct = Math.max(
    0,
    Math.round(100 - (aheadCount / totalCount) * 100),
  );

  return {
    daysSinceAor: days,
    daysSinceLabel: fmtDate(profile.aorDate) || "AOR pending",
    streamMedian: {
      value: `${median}d`,
      deltaLabel: weeklyPct >= 0 ? `+${weeklyPct}%` : `${weeklyPct}%`,
      deltaDir: weeklyPct >= 0 ? "up" : "dn",
    },
    cohortRank: {
      value: `Top ${rankPct}%`,
      sub: `${aheadCount} of ${totalCount} ahead`,
    },
    pprWindow: {
      value: ppr?.windowLabel ?? "—",
      sub: ppr?.limitedData
        ? `Limited data (n < 30) · ${completionPct}% complete`
        : `P25–P75 confidence · ${completionPct}% complete`,
    },
  };
}

/* ─── RINGS ─────────────────────────────────────────────────────────── */

export function ringsVM(
  ctx: Pick<DashboardContextValue, "pct" | "cohort">,
): DnRing[] {
  const cohortPct = Math.round((ctx.cohort.completion_rate ?? 0) * 100);
  return [
    {
      id: "journey",
      gradientId: "dn-rg1",
      gradientFrom: "#2D6A4F",
      gradientTo: "#4ade80",
      pct: Math.min(0.99, ctx.pct / 100),
      pctLabel: `${ctx.pct}%`,
      title: "Journey Progress",
      sub: "Days elapsed vs cohort median.",
    },
    {
      id: "cohort-ppr",
      gradientId: "dn-rg2",
      gradientFrom: "#1E5F8C",
      gradientTo: "#7dd3fc",
      pct: Math.min(0.99, cohortPct / 100),
      pctLabel: `${cohortPct}%`,
      title: "Cohort PPR Rate",
      sub: "Share of your cohort that has received PPR.",
      numColor: "var(--blue)",
    },
  ];
}

/* ─── PPR WINDOW ────────────────────────────────────────────────────── */

export function pprWindowVM(
  ctx: Pick<
    DashboardContextValue,
    "ppr" | "days" | "median" | "cohort" | "cohortDisplay"
  >,
): DnPprWindow {
  const { ppr, days, median, cohort, cohortDisplay } = ctx;
  // Project the P25 marker as a % along the [0..median] x-axis.
  const youPct = Math.min(100, Math.round((days / Math.max(median, 1)) * 100));
  const p25Pct = Math.min(
    100,
    Math.round((cohort.p25_days / Math.max(median, 1)) * 100),
  );
  const p75Pct = Math.min(
    100,
    Math.round((cohort.p75_days / Math.max(median, 1)) * 100),
  );

  return {
    label: "Estimated PPR Window",
    windowLabel: ppr?.windowLabel ?? "Pending more data",
    nVerifiedNote: `Based on ${cohortDisplay.n_verified} verified submissions`,
    confidenceLabel: ppr?.limitedData ? "Limited Data" : "P25–P75 Confidence",
    youPct,
    progressPct: youPct,
    bandLeftPct: Math.min(95, p25Pct),
    bandWidthPct: Math.max(4, p75Pct - p25Pct),
    axisLabels: [
      `Day 0 (AOR)`,
      `Today →`,
      `P25 · ${cohort.p25_days}d`,
      `P75 · ${cohort.p75_days}d`,
    ],
  };
}

/* ─── TIMELINE ──────────────────────────────────────────────────────── */

const ROW_BADGES: Record<DnTimelineState, "verified" | "pending" | "estimate"> =
  {
    done: "verified",
    now: "pending",
    wait: "estimate",
    final: "estimate",
  };

function rowStateFor(
  defs: MilestoneDefRow[],
  idx: number,
  profile: UserProfile,
): DnTimelineState {
  const hasDate = !!profile.milestones[defs[idx].key]?.date;
  if (hasDate) {
    // The "now" indicator goes on the latest completed milestone.
    let lastDone = -1;
    defs.forEach((d, i) => {
      if (profile.milestones[d.key]?.date) lastDone = i;
    });
    return idx === lastDone ? "done" : "done";
  }
  // First not-yet-done milestone after the last completed one is "now".
  for (let i = 0; i < idx; i++) {
    if (!profile.milestones[defs[i].key]?.date) return "wait";
  }
  return defs[idx].key === "ppr" ? "final" : "now";
}

export function timelineRowsVM(
  defs: MilestoneDefRow[],
  profile: UserProfile,
): DnTimelineRow[] {
  return defs.map((def, idx) => {
    const m = profile.milestones[def.key];
    const hasDate = !!m?.date;
    const state = rowStateFor(defs, idx, profile);
    const badgeKind = ROW_BADGES[state];

    const baseDate = hasDate
      ? { date: fmtDate(m.date) || "Set", day: dayLabel(profile.aorDate, m.date!) }
      : undefined;

    return {
      key: def.key,
      state,
      name: def.label,
      desc: def.desc,
      badge:
        hasDate
          ? { kind: "verified", label: "Verified" }
          : state === "now"
            ? { kind: "pending", label: "In progress · contribute your date" }
            : { kind: "estimate", label: `Est. ${def.est}` },
      date: baseDate,
      pending: !hasDate,
      edit:
        def.key === "ppr"
          ? undefined
          : {
              label: hasDate ? "Edit" : "+ Add date",
              fieldLabel: `${def.label} Date`,
              initial: m?.date ?? undefined,
              saveLabel: hasDate
                ? "Save"
                : "Save & contribute to community",
              fromDate: hasDate,
            },
    };
  });
}

function dayLabel(aorDate: string, milestoneDate: string): string {
  const aor = new Date(`${aorDate}T12:00:00`);
  const m = new Date(`${milestoneDate}T12:00:00`);
  if (Number.isNaN(aor.getTime()) || Number.isNaN(m.getTime())) return "—";
  const d = Math.round((m.getTime() - aor.getTime()) / 86_400_000);
  return `Day ${d}`;
}

/* ─── COHORT BARS ───────────────────────────────────────────────────── */

const BAR_FILL_BY_KEY: Record<MilestoneKey, "g" | "b" | "a" | "r"> = {
  aor: "g",
  bil: "b",
  biometrics: "b",
  background: "a",
  medical: "a",
  ppr: "r",
};

export function cohortBarsVM(
  ctx: Pick<DashboardContextValue, "cohortDisplay" | "cohortTotal">,
  defs: MilestoneDefRow[],
): DnCohortBar[] {
  const total = ctx.cohortTotal || 1;
  return defs.map((d) => {
    const n = ctx.cohortDisplay.per_milestone_n?.[d.key] ?? 0;
    const pct = Math.round((n / total) * 100);
    return {
      name: d.label,
      countLabel: `${n} / ${total} (${pct}%)`,
      pct,
      fill: BAR_FILL_BY_KEY[d.key],
    };
  });
}

/* ─── HISTOGRAM ─────────────────────────────────────────────────────── */

export function histVM(
  ctx: Pick<DashboardContextValue, "cohort">,
): DnHistBar[] {
  return ctx.cohort.dist.map((r) => ({
    label: r.range,
    value: r.count,
    type: r.you ? "y" : "n",
  }));
}

/* ─── DOT MAP ───────────────────────────────────────────────────────── */

export function dotMapVM(
  ctx: Pick<
    DashboardContextValue,
    "cohortTotal" | "days" | "median" | "cohortDataSparse" | "cohort"
  >,
): DnDotMap {
  // We render at most 500 dots to keep the SVG cheap. When the cohort is
  // smaller we render the actual count so the legend remains accurate.
  const total = Math.min(Math.max(ctx.cohortTotal, 1), 500);
  const completionPct = ctx.cohort.completion_rate ?? 0;
  const pprUpTo = Math.round(total * completionPct);
  const midUpTo = Math.min(total, pprUpTo + Math.round(total * 0.3));
  const youIndex = Math.min(
    total - 1,
    Math.max(0, Math.round((ctx.days / Math.max(ctx.median, 1)) * total)),
  );
  return { total, pprUpTo, midUpTo, youIndex };
}

/* ─── STREAM COMPARE ────────────────────────────────────────────────── */

export function streamCompareVM(
  ctx: Pick<DashboardContextValue, "cohort" | "profile">,
): DnStreamRow[] {
  const medians = ctx.cohort.stream_medians;
  if (medians.length === 0) return [];
  const max = Math.max(...medians.map((s) => s.median), 1);
  const fastest = medians.reduce(
    (acc, cur) => (cur.median < acc.median ? cur : acc),
    medians[0],
  );
  const userTokens = ctx.profile.stream
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  return medians.map((s) => {
    const nameL = s.name.toLowerCase().replace(/—/g, " ");
    const isYou = userTokens.every((tok) => nameL.includes(tok));
    const variant: DnStreamRow["variant"] = isYou
      ? "you"
      : s.name === fastest.name
        ? "fastest"
        : "neutral";
    return {
      name: s.name,
      days: `${s.median}d`,
      fillPct: Math.round((s.median / max) * 95),
      variant,
    };
  });
}

/* ─── ALERTS ────────────────────────────────────────────────────────── */

export function alertsVM(
  ctx: Pick<DashboardContextValue, "cohortInsights">,
): DnAlertCard[] {
  return ctx.cohortInsights.slice(0, 4).map((ins) => ({
    tone: ins.t === "r" || ins.t === "a" ? "amber" : "green",
    iconKind: ins.t === "r" || ins.t === "a" ? "warn" : "check",
    title: stripHtml(ins.txt).split(" — ")[0] ?? "Community update",
    desc: stripHtml(ins.txt),
    meta: ["Community"],
    linkLabel: "View details",
    href: "/community",
  }));
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/* ─── SIDEBAR SECTIONS ──────────────────────────────────────────────── */

/**
 * Produce the four sidebar sections for the live dashboard.
 *
 * The Dashboard section uses in-page anchor links (`#tl-sec`, `#cohort-sec`,
 * `#alerts-sec`) — when the user is on `/dashboard` these scroll smoothly;
 * on sub-routes (`/dashboard/share`, `/dashboard/stats`) they navigate to
 * `/dashboard#…`. The Share section links to the two real sub-routes
 * (`/dashboard/stats`, `/dashboard/share`).
 *
 * `pathname` is used to flag the active item for `/dashboard/stats` and
 * `/dashboard/share` in the Share section. On `/dashboard`, the "Dashboard"
 * row highlights are driven by scroll-spy in `DashboardShellV2`, not here.
 */
export function sidebarSectionsVM({
  pathname,
  cohortTotal,
  hasEmail,
}: {
  pathname: string | null;
  cohortTotal: number;
  hasEmail: boolean;
}): SidebarSections {
  const onDashboard = pathname === "/dashboard";
  const onStats = pathname === "/dashboard/stats";
  const onShare = pathname === "/dashboard/share";

  const anchor = (frag: string) =>
    onDashboard ? frag : `/dashboard${frag}`;

  const dashboard: SidebarItem[] = [
    {
      key: "overview",
      label: "Overview",
      icon: "overview",
      href: anchor("#top"),
      /* `active` for dashboard items on `/dashboard` is driven by scroll-spy
         in `DashboardShellV2` so the highlight follows the visible section. */
    },
    {
      key: "timeline",
      label: "My Timeline",
      icon: "timeline",
      href: anchor("#tl-sec"),
    },
    {
      key: "cohort",
      label: "My Cohort",
      icon: "cohort",
      href: anchor("#cohort-sec"),
      badge: cohortTotal > 0 ? cohortTotal.toLocaleString() : undefined,
    },
    {
      key: "alerts",
      label: "Alerts",
      icon: "alerts",
      href: anchor("#alerts-sec"),
    },
  ];

  const community: SidebarItem[] = [
    {
      key: "feed",
      label: "Community Feed",
      icon: "feed",
      href: "/community",
    },
    {
      key: "feedback",
      label: "Give Feedback",
      icon: "plus",
      href: "https://github.com/Get-North-Path/AOR-tracker/issues/new",
    },
  ];

  const share: SidebarItem[] = [
    {
      key: "share-stats",
      label: "Processing Stats",
      icon: "stats",
      href: "/dashboard/stats",
      active: onStats,
    },
    {
      key: "share-link",
      label: "Share Timeline",
      icon: "share",
      href: "/dashboard/share",
      active: onShare,
    },
  ];

  const profile: SidebarItem[] = [
    ...(hasEmail
      ? []
      : [
          {
            key: "add-email",
            label: "Add Email",
            icon: "email" as const,
            href: "/profile/add-email",
          },
        ]),
    {
      key: "delete",
      label: "Delete My Data",
      icon: "trash" as const,
      kind: "danger" as const,
    },
  ];

  return { dashboard, community, share, profile };
}
