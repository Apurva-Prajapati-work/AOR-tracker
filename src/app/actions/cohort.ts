"use server";

import { getDb } from "@/lib/db";
import { buildCohortKey, streamFallbackKey } from "@/lib/cohort";
import { serializeCohort } from "@/lib/seed";
import type { CohortStats } from "@/lib/types";
import type { UserProfile } from "@/lib/types";

export async function getCohortStatsForProfileAction(
  profile: Pick<UserProfile, "aorDate" | "stream" | "type">,
): Promise<CohortStats> {
  const db = await getDb();
  const col = db.collection("cohort_stats");
  const primaryKey = profile.aorDate
    ? buildCohortKey({
        aorDate: profile.aorDate,
        stream: profile.stream,
        type: profile.type,
      })
    : streamFallbackKey(profile.stream);
  let doc = await col.findOne({ cohortKey: primaryKey });
  if (!doc) {
    const fb = streamFallbackKey(profile.stream);
    doc = await col.findOne({ cohortKey: fb });
  }
  if (!doc) {
    doc = await col.findOne({ cohortKey: "CEC_GENERAL:2025" });
  }
  return serializeCohort(doc as Record<string, unknown>);
}
