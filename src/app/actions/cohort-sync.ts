"use server";

import { getDb } from "@/lib/db";
import { runCohortStatsSyncJob } from "@/lib/cohort-sync-job";
import { isValidEmail, normalizeEmail } from "@/lib/profile";

export async function syncCohortStatsFromProfilesAction(
  email: string,
): Promise<
  | { ok: true; profilesCohortKeyUpdates: number; cohortsUpserted: number }
  | { ok: false; error: string }
> {
  if (!isValidEmail(email)) return { ok: false, error: "Invalid email" };
  const db = await getDb();
  const norm = normalizeEmail(email);
  const exists = await db.collection("profiles").findOne({ emailNorm: norm });
  if (!exists) return { ok: false, error: "not_found" };
  const result = await runCohortStatsSyncJob(db);
  return { ok: true, ...result };
}
