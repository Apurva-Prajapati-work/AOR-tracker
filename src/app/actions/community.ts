"use server";

import { getDb } from "@/lib/db";
import { ensureSeed, serializePost } from "@/lib/seed";
import type { CommunityPost } from "@/lib/types";

export async function getCommunityFeedAction(): Promise<CommunityPost[]> {
  const db = await getDb();
  await ensureSeed(db);
  const rows = await db
    .collection("community_posts")
    .find({ approved: true })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  return rows.map((r) => serializePost(r as Record<string, unknown>));
}
