/**
 * Community feed data — static seed.
 *
 * TODO(real-data): today this file is the single source of truth for the
 *   marketing /community page. In production we want it backed by the live
 *   community database (the same data the dashboard's `getCommunityFeedPageAction`
 *   already reads). Target migration:
 *
 *     async function loadCommunity(): Promise<CommunityPageData> {
 *       // 1. Reuse the existing server action:
 *       //    @/app/actions/community.ts → fetch the latest page of approved posts.
 *       //    Map `CommunityPost` from @/lib/types into `Post` (this file) — they
 *       //    are intentionally close in shape so the mapping is straightforward.
 *       // 2. For the "own pending / own removed" cards, look up the viewer's
 *       //    most recent submission via @/app/actions/profile.
 *       // 3. Insights, contributors and the pulse chart can come from
 *       //    aggregation queries (see also @/lib/cohort-data.ts patterns).
 *       // 4. The Socket.IO "feed:refresh" event from `community-broadcast` is
 *       //    the signal to revalidate this route (`revalidatePath('/community')`).
 *     }
 *
 *   When that lands:
 *     - delete `seedCommunity` below,
 *     - replace `getCommunity()` with the async loader,
 *     - on the page, switch to `export default async function CommunityPage()`,
 *     - add `export const dynamic = "force-dynamic"` (or revalidate via webhook).
 *   The UI components stay the same — they all consume the typed shape declared
 *   in this file.
 */

const SUBMIT_HREF = "/track";
const DASHBOARD_HREF = "/dashboard";
const FEEDBACK_HREF = "/feedback";
const DISCORD_HREF = "https://discord.gg/aortrack";

// ─── Types ──────────────────────────────────────────────────────────────────

export type MilestoneKey = "aor" | "bil" | "bgc" | "med" | "ppr" | "copr";

/** Accent stripe color on the left edge of each card. */
export type MilestoneAccent = "ppr" | "bil" | "bgc" | "med" | "aor";

/** Milestone chip styling token (matches the `.ms-*` CSS classes). */
export type MilestoneChipColor = "ppr" | "bil" | "bgc" | "med" | "aor";

export type CohortItem = {
  label: string;
  value: string;
  /** Optional accent for the value (matches `.fcc-val.green` / `.fcc-val.blue`). */
  emphasis?: "green" | "blue";
};

export type TimelineDot = {
  state: "done" | "now" | "wait";
  /** Hover label for accessibility (`title` attr). */
  label: string;
  /** Render the dot with an extra ring (used for the final PPR dot). */
  highlight?: boolean;
};

export type Reply = {
  id: string;
  authorId: string;
  /** Two-digit shorthand or first initials shown inside the avatar circle. */
  avatarLabel: string;
  /** CSS color (var or hex) for the avatar circle. */
  avatarColor: string;
  text: string;
};

export type PostBase = {
  id: string;
  /** Human-readable id shown in the header, e.g. "#3847" or "You (#4821)". */
  displayId: string;
  /** Card accent stripe key. */
  accent: MilestoneAccent;
  milestoneChip: { label: string; color: MilestoneChipColor };
  stream: string;
  timestamp: string;
  /** Show "Gemini Verified" mod-soft badge in the meta row. */
  geminiVerified?: boolean;
  cohort: CohortItem[];
  /** Optional mini progress timeline (shown on rich PPR cards). */
  timeline?: TimelineDot[];
  /** Body copy. Authored HTML allowed for inline `<strong>` etc. */
  bodyHtml: string;
  helpfulCount: number;
  helpfulActive?: boolean;
  replyCount: number;
  saved?: boolean;
  /** Right-side info string like "Gemini-verified · Feb 2026 cohort". */
  dataSource?: string;
  /** Existing approved replies (shown if non-empty). */
  replies?: Reply[];
};

export type ApprovedPost = PostBase & {
  kind: "approved";
};

export type OwnPendingPost = PostBase & {
  kind: "ownPending";
  /** Amber banner copy shown above the card body. */
  pendingMessage: string;
};

export type OwnRemovedPost = Omit<
  PostBase,
  "helpfulCount" | "replyCount" | "replies" | "timeline"
> & {
  kind: "ownRemoved";
  /** Banner heading (bold). */
  removedTitle: string;
  /** Banner long-form explanation. */
  removedReason: string;
  /** Days remaining in the appeal window. */
  appealDaysRemaining: number;
};

export type Post = ApprovedPost | OwnPendingPost | OwnRemovedPost;

export type FilterChip = {
  id: string;
  label: string;
  count?: number;
  /** CSS color of the chip dot, e.g. "var(--green)". Omitted for "All". */
  dotColor?: string;
  active?: boolean;
};

export type SidebarLink = {
  id: string;
  label: string;
  badge?: string;
  active?: boolean;
  href?: string;
};

export type CohortMini = {
  /** Header label, e.g. "Active Session". */
  label: string;
  rows: { key: string; value: string; emphasis?: "green" }[];
};

export type Insight = {
  id: string;
  tone: "amber" | "green" | "red" | "blue";
  title: string;
  body: string;
  reporters: string;
  age: string;
  /** Optional "View all …" link displayed under the body. */
  link?: { label: string; href: string };
};

export type PulseWeek = {
  label: string;
  value: number;
  isPeak?: boolean;
  isThisWeek?: boolean;
};

export type Pulse = {
  /** Headline e.g. "Weekly PPR Pulse — CEC General". */
  label: string;
  weeks: PulseWeek[];
  thisWeekValue: number;
  lastWeekValue: number;
  /** Pre-computed percentage delta vs last week. */
  deltaPct: number;
};

export type Contributor = {
  rank: number;
  avatarLabel: string;
  avatarColor: string;
  name: string;
  verifiedCount: number;
};

export type SortOption = { value: string; label: string };

export type CommunityPageData = {
  /** Live counter shown in the sub-banner (e.g., live online sessions). */
  liveCount: number;
  cohortMini: CohortMini;
  browseLinks: SidebarLink[];
  milestoneLinks: SidebarLink[];
  quickLinks: SidebarLink[];
  filterChips: FilterChip[];
  sortOptions: SortOption[];
  defaultSort: string;
  submitCta: {
    heading: string;
    sub: string;
    buttonLabel: string;
    href: string;
  };
  posts: Post[];
  insights: Insight[];
  pulse: Pulse;
  contributors: Contributor[];
  discord: {
    title: string;
    sub: string;
    buttonLabel: string;
    href: string;
  };
};

// ─── Static seed ────────────────────────────────────────────────────────────

const seedCommunity: CommunityPageData = {
  liveCount: 14831,

  cohortMini: {
    label: "Active Session",
    rows: [
      { key: "Stream", value: "CEC General", emphasis: "green" },
      { key: "AOR Month", value: "Feb 2026" },
      { key: "Day", value: "72", emphasis: "green" },
      { key: "Submissions", value: "3" },
    ],
  },

  browseLinks: [
    {
      id: "all",
      label: "All Posts",
      badge: "1,240",
      active: true,
    },
    { id: "my-cohort", label: "My Cohort Only", badge: "87" },
    { id: "saved", label: "Saved Posts", badge: "4" },
  ],

  milestoneLinks: [
    { id: "ppr", label: "PPR Received", badge: "482" },
    { id: "bil", label: "BIL Received", badge: "318" },
    { id: "bgc", label: "Background Check", badge: "241" },
    { id: "medical", label: "Medical Passed", badge: "199" },
  ],

  quickLinks: [
    { id: "submit", label: "Submit Milestone", href: SUBMIT_HREF },
    { id: "feedback", label: "Give Feedback", href: FEEDBACK_HREF },
  ],

  filterChips: [
    { id: "all", label: "All", count: 1240, active: true },
    { id: "ppr", label: "PPR", count: 482, dotColor: "var(--green)" },
    { id: "bil", label: "BIL", count: 318, dotColor: "var(--blue)" },
    { id: "bgc", label: "BGC", count: 241, dotColor: "var(--amber)" },
    { id: "medical", label: "Medical", dotColor: "var(--purple)" },
  ],

  sortOptions: [
    { value: "recent", label: "Most Recent" },
    { value: "helpful", label: "Most Helpful" },
    { value: "cohort", label: "My Cohort First" },
  ],
  defaultSort: "recent",

  submitCta: {
    heading: "Got a milestone? Share it.",
    sub: "Your BIL, BGC, PPR — every date you log helps 1,240 applicants in your cohort predict their timeline.",
    buttonLabel: "Submit Milestone",
    href: SUBMIT_HREF,
  },

  posts: [
    // ── Own pending (only visible to author in real life) ──
    {
      kind: "ownPending",
      id: "own-pending-1",
      displayId: "You (#4821)",
      accent: "bil",
      milestoneChip: { label: "BIL Received", color: "bil" },
      stream: "CEC General",
      timestamp: "Just now",
      cohort: [
        { label: "AOR Month", value: "Feb 2026" },
        { label: "BIL Day", value: "Day 16", emphasis: "blue" },
        { label: "Type", value: "Inland" },
      ],
      bodyHtml:
        "Got my BIL today! Slightly faster than I expected based on the cohort averages. Fingers crossed for the rest of the process.",
      helpfulCount: 0,
      replyCount: 0,
      pendingMessage:
        "Your post is under Gemini review — visible only to you until approved. Usually takes under 30 seconds.",
    },

    // ── Card 1: PPR (full timeline + replies) ──
    {
      kind: "approved",
      id: "card-1",
      displayId: "#3847",
      accent: "ppr",
      milestoneChip: { label: "PPR Received", color: "ppr" },
      stream: "CEC General",
      geminiVerified: true,
      timestamp: "4 min ago",
      cohort: [
        { label: "AOR Month", value: "Feb 2026" },
        { label: "PPR Day", value: "Day 172", emphasis: "green" },
        { label: "Type", value: "Inland" },
        { label: "Province", value: "Ontario" },
      ],
      timeline: [
        { state: "done", label: "AOR" },
        { state: "done", label: "BIL" },
        { state: "done", label: "Biometrics" },
        { state: "done", label: "BGC" },
        { state: "done", label: "Medical" },
        { state: "done", label: "PPR", highlight: true },
      ],
      bodyHtml:
        "Finally got PPR today after <strong>172 days</strong>! Inland CEC General, Ontario. My timeline: AOR Feb 20 → BIL Mar 7 → Biometrics Mar 18 → BGC Apr 2 → Medical Apr 14 → PPR today. It moved way faster than I expected in the last 3 weeks. Good luck everyone 🍁",
      helpfulCount: 47,
      replyCount: 8,
      dataSource: "Gemini-verified · Feb 2026 cohort",
      replies: [
        {
          id: "r1a",
          authorId: "#5214",
          avatarLabel: "52",
          avatarColor: "var(--navy2)",
          text: "Congratulations!! 🎉 I'm Feb 22 AOR so fingers crossed I'm next.",
        },
        {
          id: "r1b",
          authorId: "#6108",
          avatarLabel: "61",
          avatarColor: "var(--navy2)",
          text: "What stream exactly — CEC General or STEM? And was WES involved?",
        },
      ],
    },

    // ── Card 2: BIL ──
    {
      kind: "approved",
      id: "card-2",
      displayId: "#5502",
      accent: "bil",
      milestoneChip: { label: "BIL Received", color: "bil" },
      stream: "CEC STEM",
      timestamp: "18 min ago",
      cohort: [
        { label: "AOR Month", value: "Mar 2026" },
        { label: "BIL Day", value: "Day 11", emphasis: "blue" },
        { label: "Type", value: "Inland" },
      ],
      bodyHtml:
        "BIL arrived on Day 11 for CEC STEM, March AOR. Faster than the cohort median of 14 days. For anyone wondering — yes, upfront biometrics still worked fine. No issues with the IRCC tracker showing it.",
      helpfulCount: 12,
      replyCount: 2,
    },

    // ── Card 3: BGC (saved) ──
    {
      kind: "approved",
      id: "card-3",
      displayId: "#4102",
      accent: "bgc",
      milestoneChip: { label: "BGC Started", color: "bgc" },
      stream: "FSW General",
      timestamp: "42 min ago",
      cohort: [
        { label: "AOR Month", value: "Jan 2026" },
        { label: "BGC Day", value: "Day 61" },
        { label: "Type", value: "Outland" },
      ],
      bodyHtml:
        "Background check started on Day 61 for FSW General January AOR. WES verification was the slow part for us — took about 3 weeks to show in the IRCC tracker. Once it cleared, BGC initiated pretty quickly. Outland applicant from India, in case that context helps anyone.",
      helpfulCount: 28,
      replyCount: 5,
      saved: true,
      replies: [
        {
          id: "r3a",
          authorId: "#7731",
          avatarLabel: "77",
          avatarColor: "var(--teal)",
          text: "Same experience — WES was the bottleneck for us too. FSW outland from Philippines, BGC started Day 58.",
        },
      ],
    },

    // ── Card 4: Medical ──
    {
      kind: "approved",
      id: "card-4",
      displayId: "#6841",
      accent: "med",
      milestoneChip: { label: "Medical Passed", color: "med" },
      stream: "CEC General",
      timestamp: "1 hr ago",
      cohort: [
        { label: "AOR Month", value: "Feb 2026" },
        { label: "Medical Day", value: "Day 84" },
        { label: "Type", value: "Inland" },
      ],
      bodyHtml:
        "Medical results passed! Did upfront medicals before AOR and they finally showed as valid in the system on Day 84. My cohort data should help other Feb AOR CEC General applicants — feel free to ask questions.",
      helpfulCount: 19,
      replyCount: 3,
    },

    // ── Card 5: PPR (French) ──
    {
      kind: "approved",
      id: "card-5",
      displayId: "#2291",
      accent: "ppr",
      milestoneChip: { label: "PPR Received", color: "ppr" },
      stream: "CEC French",
      timestamp: "2 hr ago",
      cohort: [
        { label: "AOR Month", value: "Jan 2026" },
        { label: "PPR Day", value: "Day 98", emphasis: "green" },
        { label: "Type", value: "Outland" },
      ],
      bodyHtml:
        "PPR received in just 98 days via CEC French! The francophone pathway is genuinely fast. Applied outland from France. Full timeline: AOR Jan 14 → BIL Jan 25 (Day 11) → Biometrics waived (done previously) → BGC Feb 8 (Day 25) → Medical Feb 19 (Day 36) → PPR today (Day 98). Merci AORTrack for helping me track this! 🇫🇷🍁",
      helpfulCount: 83,
      replyCount: 14,
      replies: [
        {
          id: "r5a",
          authorId: "#3309",
          avatarLabel: "33",
          avatarColor: "var(--green2)",
          text: "Félicitations!! 🎉 This is amazing. CEC French is incredible. Can you share if the IRCC tracker updated before or after the PPR email?",
        },
      ],
    },

    // ── Own removed (only visible to author in real life) ──
    {
      kind: "ownRemoved",
      id: "own-removed-1",
      displayId: "You (#4821)",
      accent: "ppr",
      milestoneChip: { label: "PPR Received", color: "ppr" },
      stream: "CEC General",
      timestamp: "3 days ago",
      cohort: [{ label: "Claimed PPR Day", value: "Day 28" }],
      bodyHtml: "[Content hidden — post removed by moderation]",
      saved: false,
      removedTitle: "Your post was removed",
      removedReason:
        "Our system detected that the processing time you reported (PPR at Day 28) is 3.8 standard deviations from the Feb 2026 CEC General cohort average (184 days). This is outside the range we can verify. If you believe this is correct, please appeal with supporting documentation.",
      appealDaysRemaining: 6,
    },
  ],

  insights: [
    {
      id: "ins-1",
      tone: "amber",
      title: "WES Tracker Lag — CEC General",
      body: "12 applicants report WES results showing up 7–14 days after the IRCC tracker reflects them. May delay your BGC initiation.",
      reporters: "12 reporters",
      age: "3 days ago",
      link: { label: "View all community reports", href: "#alerts" },
    },
    {
      id: "ins-2",
      tone: "green",
      title: "PPR Velocity Up This Week",
      body: "18 PPR approvals logged in the Feb 2026 CEC General cohort this week — highest since tracking began.",
      reporters: "18 reporters",
      age: "1 day ago",
    },
    {
      id: "ins-3",
      tone: "blue",
      title: "IRCC Tracker Maintenance",
      body: "IRCC online tracker had a 4-hour outage on Apr 30. Status updates may be delayed by 1 day.",
      reporters: "System report",
      age: "2 days ago",
    },
  ],

  pulse: {
    label: "Weekly PPR Pulse — CEC General",
    weeks: [
      { label: "Apr 7", value: 8 },
      { label: "Apr 14", value: 11 },
      { label: "Apr 21", value: 13 },
      { label: "Apr 28", value: 13 },
      { label: "May 3", value: 18, isThisWeek: true, isPeak: true },
    ],
    thisWeekValue: 18,
    lastWeekValue: 13,
    deltaPct: 38,
  },

  contributors: [
    {
      rank: 1,
      avatarLabel: "#38",
      avatarColor: "var(--amber)",
      name: "#3847",
      verifiedCount: 14,
    },
    {
      rank: 2,
      avatarLabel: "#55",
      avatarColor: "var(--blue)",
      name: "#5502",
      verifiedCount: 11,
    },
    {
      rank: 3,
      avatarLabel: "#22",
      avatarColor: "var(--green)",
      name: "#2291",
      verifiedCount: 9,
    },
    {
      rank: 4,
      avatarLabel: "#41",
      avatarColor: "var(--teal)",
      name: "#4102",
      verifiedCount: 8,
    },
    {
      rank: 5,
      avatarLabel: "#68",
      avatarColor: "var(--purple)",
      name: "#6841",
      verifiedCount: 6,
    },
  ],

  discord: {
    title: "Join our Discord",
    sub: "Real-time alerts, IRCC tracker updates, and direct discussion with your cohort.",
    buttonLabel: "Join #aortrack-general",
    href: DISCORD_HREF,
  },
};

// Re-export the dashboard URL so the small links inside components don't need
// to redeclare it.
export const COMMUNITY_NAV = {
  submitHref: SUBMIT_HREF,
  dashboardHref: DASHBOARD_HREF,
  feedbackHref: FEEDBACK_HREF,
};

// ─── Loader ────────────────────────────────────────────────────────────────

/**
 * Returns the data the marketing /community page should render.
 *
 * TODO(real-data): swap this for an async loader backed by the real
 *   community feed (see file header). The function is intentionally sync
 *   today so a plain server component can call it without awaiting.
 */
export function getCommunity(): CommunityPageData {
  return seedCommunity;
}

// ─── Dynamic dummy-post generator (used by the new-post bar) ───────────────

/**
 * Builds a brand-new approved PPR card. Used by `CommunityShell` to prepend
 * dynamic cards when the user clicks the "X new posts — click to load"
 * banner.
 *
 * TODO(real-data): drop this once the new-post bar is wired to live SSE —
 *   the prepended card should be the actual approved post from the
 *   community-broadcast event.
 */
export function generateDynamicPost(): ApprovedPost {
  const userNumber = Math.floor(Math.random() * 9000) + 1000;
  const pprDay = 160 + Math.floor(Math.random() * 30);
  return {
    kind: "approved",
    id: `dyn-${Date.now()}-${userNumber}`,
    displayId: `#${userNumber}`,
    accent: "ppr",
    milestoneChip: { label: "PPR Received", color: "ppr" },
    stream: "CEC General",
    timestamp: "Just now",
    cohort: [
      { label: "AOR Month", value: "Feb 2026" },
      { label: "PPR Day", value: `Day ${pprDay}`, emphasis: "green" },
      { label: "Type", value: "Inland" },
    ],
    bodyHtml:
      "Just received PPR! Feb 2026 CEC General inland. Feeling very relieved. Thank you all for sharing your timelines — it really helped me stay calm during the wait. 🍁",
    helpfulCount: 0,
    replyCount: 0,
  };
}
