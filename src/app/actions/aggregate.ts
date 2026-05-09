"use server";

import { getDb } from "@/lib/db";
import { ensureSeed } from "@/lib/seed";
import { humanizeCohortKey, streamSlugFromLabel } from "@/lib/cohort";
import type { MilestoneKey } from "@/lib/types";

export type LiveCohortAggregate = {
  cohortKey: string;
  profileCount: number;
  /** Count of profiles with a non-empty date for each milestone */
  perMilestoneFilled: Record<MilestoneKey, number>;
};

const MILESTONE_KEYS: MilestoneKey[] = [
  "aor",
  "bil",
  "biometrics",
  "background",
  "medical",
  "ppr",
];

function filledCond(path: string): Record<string, unknown> {
  return {
    $cond: [
      {
        $gt: [
          {
            $strLenCP: {
              $ifNull: [`$milestones.${path}.date`, ""],
            },
          },
          0,
        ],
      },
      1,
      0,
    ],
  };
}

export async function getLiveCohortAggregateAction(
  cohortKey: string,
): Promise<LiveCohortAggregate> {
  const db = await getDb();
  await ensureSeed(db);

  const groupStage: Record<string, unknown> = {
    _id: null,
    profileCount: { $sum: 1 },
  };
  for (const k of MILESTONE_KEYS) {
    groupStage[k] = { $sum: filledCond(k) };
  }

  const [row] = await db
    .collection("profiles")
    .aggregate<Record<string, unknown>>([
      { $match: { cohortKey } },
      { $group: groupStage },
    ])
    .toArray();

  const profileCount =
    typeof row?.profileCount === "number" ? row.profileCount : 0;
  const perMilestoneFilled = {} as Record<MilestoneKey, number>;
  for (const k of MILESTONE_KEYS) {
    const n = row?.[k];
    perMilestoneFilled[k] = typeof n === "number" ? n : 0;
  }

  return { cohortKey, profileCount, perMilestoneFilled };
}

export type CohortSummaryRow = {
  cohortKey: string;
  label: string;
  nVerified: number;
  medianDays: number;
  isCurrent: boolean;
};

/** Other cohort rows from `cohort_stats` (excludes `currentCohortKey`); client prepends the active cohort. */
export async function listRelatedCohortSummariesAction(
  currentCohortKey: string,
  streamLabel: string,
  limit = 4,
): Promise<Omit<CohortSummaryRow, "isCurrent">[]> {
  const db = await getDb();
  await ensureSeed(db);
  const col = db.collection("cohort_stats");
  const slug = streamSlugFromLabel(streamLabel);
  const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const prefer = await col
    .find({
      cohortKey: { $ne: currentCohortKey, $regex: new RegExp(`^${escaped}:`) },
    })
    .limit(limit)
    .toArray();

  const rows: Omit<CohortSummaryRow, "isCurrent">[] = prefer.map((doc) => {
    const key = doc.cohortKey as string;
    return {
      cohortKey: key,
      label: humanizeCohortKey(key),
      nVerified: (doc.n_verified as number) ?? 0,
      medianDays: (doc.median_days_to_ppr as number) ?? 0,
    };
  });

  const seen = new Set(rows.map((r) => r.cohortKey));
  if (rows.length < limit) {
    const filler = await col
      .find({ cohortKey: { $ne: currentCohortKey } })
      .limit(limit * 3)
      .toArray();
    for (const doc of filler) {
      if (rows.length >= limit) break;
      const key = doc.cohortKey as string;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({
        cohortKey: key,
        label: humanizeCohortKey(key),
        nVerified: (doc.n_verified as number) ?? 0,
        medianDays: (doc.median_days_to_ppr as number) ?? 0,
      });
    }
  }

  return rows;
}
