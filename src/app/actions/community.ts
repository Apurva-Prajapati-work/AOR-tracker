"use server";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { broadcastCommunityFeedRefresh } from "@/lib/community-broadcast";
import { ensureSeed, serializePost } from "@/lib/seed";
import { normalizeEmail, isValidEmail } from "@/lib/profile";
import type { CommunityPost, MilestoneKey, UserProfile } from "@/lib/types";
import { getProfileAction } from "@/app/actions/profile";

const MS_OPTIONS = ["ppr", "bil", "bg", "med"] as const;
export type CommunityMs = (typeof MS_OPTIONS)[number];

const MS_LABEL: Record<CommunityMs, string> = {
  ppr: "PPR Received",
  bil: "BIL Received",
  bg: "BGC Started",
  med: "Medical Done",
};

function initialsFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "?";
  const clean = local.replace(/[^a-zA-Z0-9]/g, "");
  if (clean.length >= 2) return clean.slice(0, 2).toUpperCase();
  return (local.slice(0, 2) || "??").toUpperCase();
}

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "applicant";
  return `Applicant · ${local}`;
}

function timelineFromProfile(p: UserProfile): { label: string; done: boolean }[] {
  const order: MilestoneKey[] = [
    "aor",
    "bil",
    "biometrics",
    "background",
    "medical",
    "ppr",
  ];
  const short: Record<MilestoneKey, string> = {
    aor: "AOR",
    bil: "BIL",
    biometrics: "Bio",
    background: "BGC",
    medical: "Med",
    ppr: "PPR",
  };
  return order.map((k) => ({
    label: short[k],
    done: !!p.milestones[k]?.date,
  }));
}

function metaFromProfile(p: UserProfile): string {
  const parts = [p.stream, p.aorDate ? `${p.aorDate} AOR` : null, p.type].filter(
    Boolean,
  );
  return parts.join(" · ");
}

export async function getCommunityFeedAction(
  viewerEmail?: string | null,
): Promise<CommunityPost[]> {
  const db = await getDb();
  await ensureSeed(db);
  const viewerNorm = viewerEmail && isValidEmail(viewerEmail)
    ? normalizeEmail(viewerEmail)
    : null;
  const rows = await db
    .collection("community_posts")
    .find({ approved: true })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  return rows.map((r) =>
    serializePost(r as Record<string, unknown>, viewerNorm),
  );
}

export async function createCommunityPostAction(
  email: string,
  input: { body: string; ms: CommunityMs },
): Promise<
  { ok: true } | { ok: false; error: string }
> {
  if (!isValidEmail(email)) return { ok: false, error: "Invalid email" };
  const body = input.body.trim();
  if (body.length < 3) return { ok: false, error: "Message is too short" };
  if (body.length > 2000) return { ok: false, error: "Message is too long" };
  if (!MS_OPTIONS.includes(input.ms)) return { ok: false, error: "Invalid tag" };

  const prof = await getProfileAction(email);
  if (!prof.ok) return { ok: false, error: "Profile not found" };

  const norm = normalizeEmail(email);
  const db = await getDb();
  await ensureSeed(db);
  const p = prof.profile;

  await db.collection("community_posts").insertOne({
    initials: initialsFromEmail(email),
    name: displayNameFromEmail(email),
    meta: metaFromProfile(p),
    ms: input.ms,
    msl: MS_LABEL[input.ms],
    body,
    bodyIsHtml: false,
    tl: timelineFromProfile(p),
    helpful: 0,
    helpfulVoters: [] as string[],
    approved: true,
    authorEmailNorm: norm,
    createdAt: new Date(),
  });

  broadcastCommunityFeedRefresh();
  return { ok: true };
}

export async function markCommunityHelpfulAction(
  email: string,
  postId: string,
): Promise<
  | { ok: true; helpful: number; viewerHasMarkedHelpful: boolean }
  | { ok: false; error: string }
> {
  if (!isValidEmail(email)) return { ok: false, error: "Invalid email" };
  let oid: ObjectId;
  try {
    oid = new ObjectId(postId);
  } catch {
    return { ok: false, error: "Invalid post" };
  }

  const norm = normalizeEmail(email);
  const db = await getDb();
  await ensureSeed(db);
  const col = db.collection("community_posts");

  const res = await col.updateOne(
    { _id: oid, approved: true, helpfulVoters: { $ne: norm } },
    {
      $addToSet: { helpfulVoters: norm },
      $inc: { helpful: 1 },
    },
  );

  if (res.matchedCount === 0) {
    const doc = await col.findOne({ _id: oid, approved: true });
    if (!doc) return { ok: false, error: "Post not found" };
    const voters = (doc.helpfulVoters as string[]) ?? [];
    return {
      ok: true,
      helpful:
        typeof doc.helpful === "number"
          ? Math.max(doc.helpful, voters.length)
          : voters.length,
      viewerHasMarkedHelpful: voters.includes(norm),
    };
  }

  const updated = await col.findOne({ _id: oid });
  const voters = (updated?.helpfulVoters as string[]) ?? [];
  const helpful =
    typeof updated?.helpful === "number"
      ? Math.max(updated.helpful, voters.length)
      : voters.length;

  broadcastCommunityFeedRefresh();
  return {
    ok: true,
    helpful,
    viewerHasMarkedHelpful: true,
  };
}
