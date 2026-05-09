import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { runCohortStatsSyncJob } from "@/lib/cohort-sync-job";

/**
 * Daily (or scheduled) cohort rebuild. Protect with CRON_SECRET:
 * Authorization: Bearer <CRON_SECRET>
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 },
    );
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
