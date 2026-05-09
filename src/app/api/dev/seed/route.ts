import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDemoDataIfEmpty } from "@/lib/seed";

/**
 * One-shot demo data: sample cohort_stats + community_posts (only if collections are empty).
 * Allowed when NODE_ENV is development, or when ALLOW_DEV_SEED=1 (e.g. staging).
 *
 * Example: curl -X GET http://localhost:3000/api/dev/seed
 */
export async function GET() {
  try {
    const db = await getDb();
    const result = await seedDemoDataIfEmpty(db);
    return NextResponse.json({
      ok: true,
      ...result,
      message:
        result.cohortsInserted === 0 && result.postsInserted === 0
          ? "Nothing inserted — collections already had data."
          : "Demo seed applied where collections were empty.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Seed failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
