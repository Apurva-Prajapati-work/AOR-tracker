import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { runCohortStatsSyncJob } from "@/lib/cohort-sync-job";

/**
 * Rebuilds `cohort_stats` from `profiles` (and reconciles profile cohort keys).
 * Same access as dev seed: development or ALLOW_DEV_SEED=1.
 */
export async function POST() {
  const allowed =
    process.env.NODE_ENV === "development" ||
    process.env.ALLOW_DEV_SEED === "1";
  if (!allowed) {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }
  try {
    const db = await getDb();
    const result = await runCohortStatsSyncJob(db);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
