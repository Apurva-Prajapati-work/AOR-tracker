import type { Db } from "mongodb";
import type { CohortStats, CommunityPost } from "./types";

const DEFAULT_DIST = [
  { range: "< 120d", count: 11, pct: 12, you: false },
  { range: "120–150d", count: 26, pct: 28, you: false },
  { range: "150–180d", count: 61, pct: 65, you: false },
  { range: "180–210d", count: 94, pct: 100, you: true },
  { range: "210–240d", count: 45, pct: 48, you: false },
  { range: "> 240d", count: 19, pct: 20, you: false },
];

const DEFAULT_STREAM_MEDIANS = [
  { name: "CEC — General", median: 184 },
  { name: "CEC — STEM", median: 165 },
  { name: "CEC — Healthcare", median: 174 },
  { name: "CEC — French", median: 148 },
  { name: "FSW — General", median: 210 },
  { name: "PNP", median: 248 },
];

const SEED_POSTS: Omit<
  CommunityPost,
  "id" | "bodyIsHtml" | "viewerHasMarkedHelpful"
>[] = [
  {
    initials: "AK",
    name: "Applicant #4821",
    meta: "CEC · Feb 20 AOR · Inland",
    ms: "ppr",
    msl: "PPR Received",
    body: "Just got my <strong>PPR at day 172!</strong> Background check started around day 55, medical day 108.",
    tl: [
      { label: "AOR", done: true },
      { label: "BIL d13", done: true },
      { label: "Bio d25", done: true },
      { label: "BGC d55", done: true },
      { label: "Med d108", done: true },
      { label: "PPR d172", done: true },
    ],
    helpful: 84,
  },
  {
    initials: "PK",
    name: "Applicant #3302",
    meta: "CEC · Feb 25 AOR · Inland",
    ms: "bil",
    msl: "BIL Received",
    body: "Got my BIL <strong>15 days after AOR.</strong> Tracker shows pending even though biometrics done Apr 27. Anyone?",
    tl: [
      { label: "AOR", done: true },
      { label: "BIL d15", done: true },
      { label: "Bio d27", done: true },
      { label: "BGC", done: false },
      { label: "Med", done: false },
      { label: "PPR", done: false },
    ],
    helpful: 32,
  },
  {
    initials: "SS",
    name: "Applicant #5107",
    meta: "CEC · Feb 28 AOR · Outland",
    ms: "bg",
    msl: "BGC Started",
    body: "Background check appeared at <strong>day 61.</strong> WES regular issue resolved in 3 days by uploading scanned original.",
    tl: [
      { label: "AOR", done: true },
      { label: "BIL d14", done: true },
      { label: "Bio d28", done: true },
      { label: "BGC d61", done: true },
      { label: "Med", done: false },
      { label: "PPR", done: false },
    ],
    helpful: 47,
  },
  {
    initials: "NA",
    name: "Applicant #2890",
    meta: "CEC · Jan 31 AOR · Inland",
    ms: "ppr",
    msl: "PPR Received",
    body: "PPR at day 198! <strong>STEM NOC codes</strong> consistently 2–3 weeks faster. Confirmation email 4h after PPR.",
    tl: [
      { label: "AOR", done: true },
      { label: "BIL d12", done: true },
      { label: "Bio d22", done: true },
      { label: "BGC d52", done: true },
      { label: "Med d119", done: true },
      { label: "PPR d198", done: true },
    ],
    helpful: 61,
  },
  {
    initials: "MR",
    name: "Applicant #6014",
    meta: "CEC · Mar 10 AOR · Inland",
    ms: "med",
    msl: "Medical Done",
    body: "Medical completed today (day 34). Anyone get a <strong>second medical request?</strong> Mine from EE stage is from 2023.",
    tl: [
      { label: "AOR", done: true },
      { label: "BIL d16", done: true },
      { label: "Bio d30", done: true },
      { label: "Med d34", done: true },
      { label: "BGC", done: false },
      { label: "PPR", done: false },
    ],
    helpful: 29,
  },
];

/** Synthetic stats when Mongo has no `cohort_stats` row yet (e.g. before dev seed). */
export function cohortStatsFallback(cohortKey: string): CohortStats {
  return {
    ...baseCohort(cohortKey),
    last_updated: new Date().toISOString(),
  };
}

function baseCohort(key: string): CohortStats {
  return {
    cohortKey: key,
    median_days_to_ppr: 184,
    p25_days: 150,
    p75_days: 218,
    n_verified: 412,
    completion_rate: 0.23,
    weekly_delta: 0.04,
    per_milestone_n: {
      aor: 412,
      bil: 389,
      biometrics: 341,
      background: 204,
      medical: 89,
      ppr: 94,
    },
    dist: DEFAULT_DIST,
    pulseWeekly: [2, 3, 5, 4, 6, 8, 11, 14, 18, 16],
    stream_medians: DEFAULT_STREAM_MEDIANS,
    last_updated: new Date().toISOString(),
  };
}

/** Idempotent indexes — invoked from `getDb()` on first use. */
export async function ensureIndexes(db: Db): Promise<void> {
  const cohorts = db.collection("cohort_stats");
  const posts = db.collection("community_posts");
  await db.collection("profiles").createIndex({ emailNorm: 1 }, { unique: true });
  await db.collection("profiles").createIndex({ cohortKey: 1 });
  await db
    .collection("profiles")
    .createIndex({ shareToken: 1 }, { unique: true, sparse: true });
  await cohorts.createIndex({ cohortKey: 1 }, { unique: true });
  await posts.createIndex({ createdAt: -1 });
}

export type SeedDemoResult = {
  cohortsInserted: number;
  postsInserted: number;
};

/**
 * Inserts sample cohorts and community posts only when those collections are empty.
 * Call from the dev seed API — not from every server action.
 */
export async function seedDemoDataIfEmpty(db: Db): Promise<SeedDemoResult> {
  const cohorts = db.collection("cohort_stats");
  const posts = db.collection("community_posts");

  let cohortsInserted = 0;
  let postsInserted = 0;

  const cohortCount = await cohorts.estimatedDocumentCount();
  if (cohortCount === 0) {
    const keys = new Set<string>();
    const samples = [
      "CEC_GENERAL:2:2025:inland:ON",
      "CEC_GENERAL:0:2025:inland:ON",
      "CEC_STEM:2:2025:inland:BC",
      "FSW_GENERAL:1:2025:outland:ON",
    ];
    samples.forEach((k) => keys.add(k));
    const list = [...keys];
    await cohorts.insertMany(
      list.map((cohortKey) => ({
        ...baseCohort(cohortKey),
        last_updated: new Date(),
      })),
    );
    cohortsInserted = list.length;
  }

  const postCount = await posts.estimatedDocumentCount();
  if (postCount === 0) {
    await posts.insertMany(
      SEED_POSTS.map((p) => ({
        ...p,
        bodyIsHtml: true,
        helpfulVoters: [] as string[],
        approved: true,
        createdAt: new Date(),
      })),
    );
    postsInserted = SEED_POSTS.length;
  }

  return { cohortsInserted, postsInserted };
}

export function serializeCohort(
  doc: Record<string, unknown> | null | undefined,
  fallbackCohortKey = "CEC_GENERAL:2025",
): CohortStats {
  if (!doc) {
    return cohortStatsFallback(fallbackCohortKey);
  }
  const c = doc as CohortStats & { last_updated?: Date };
  return {
    ...c,
    last_updated:
      typeof c.last_updated === "string"
        ? c.last_updated
        : (c.last_updated as Date)?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function serializePost(
  doc: Record<string, unknown>,
  viewerEmailNorm?: string | null,
): CommunityPost {
  const voters = (doc.helpfulVoters as string[] | undefined) ?? [];
  const helpfulStored =
    typeof doc.helpful === "number" ? doc.helpful : voters.length;
  const helpful = Math.max(helpfulStored, voters.length);
  let replyTo: CommunityPost["replyTo"];
  const rtId = doc.replyToId;
  const rtPrev = doc.replyToPreview as
    | { initials?: string; name?: string; snippet?: string }
    | undefined;
  if (rtId && rtPrev && typeof rtPrev === "object") {
    replyTo = {
      id: String(rtId),
      initials: String(rtPrev.initials ?? "?"),
      name: String(rtPrev.name ?? ""),
      snippet: String(rtPrev.snippet ?? ""),
    };
  }

  return {
    id: String(doc._id),
    initials: doc.initials as string,
    name: doc.name as string,
    meta: doc.meta as string,
    ms: doc.ms as string,
    msl: doc.msl as string,
    body: doc.body as string,
    bodyIsHtml: doc.bodyIsHtml !== false,
    tl: doc.tl as CommunityPost["tl"],
    helpful,
    viewerHasMarkedHelpful: viewerEmailNorm
      ? voters.includes(viewerEmailNorm)
      : false,
    ...(replyTo ? { replyTo } : {}),
  };
}
