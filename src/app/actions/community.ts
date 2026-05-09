"use server";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { broadcastCommunityFeedRefresh } from "@/lib/community-broadcast";
import {
  COMMUNITY_FEED_PAGE_SIZE,
  type CommunityFeedPage,
} from "@/lib/community-feed";
import { ensureSeed, serializePost } from "@/lib/seed";
import { normalizeEmail, isValidEmail } from "@/lib/profile";
import type { MilestoneKey, UserProfile } from "@/lib/types";
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

function postPlainSnippet(
  body: string,
  bodyIsHtml: boolean,
  max = 100,
): string {
  const raw = bodyIsHtml
    ? body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    : body.replace(/\s+/g, " ").trim();
  if (raw.length <= max) return raw;
  return `${raw.slice(0, max - 1)}…`;
}

export async function getCommunityFeedAction(
  viewerEmail?: string | null,
  opts?: {
    page?: number;
    pageSize?: number;
    /** When set (not `all`), only posts with this `ms` value. */
    msFilter?: string | null;
  },
): Promise<CommunityFeedPage> {
  const db = await getDb();
  await ensureSeed(db);
  const viewerNorm = viewerEmail && isValidEmail(viewerEmail)
    ? normalizeEmail(viewerEmail)
    : null;

  const pageSize = Math.min(
    100,
    Math.max(1, opts?.pageSize ?? COMMUNITY_FEED_PAGE_SIZE),
  );
  const requestedPage = Math.max(1, Math.floor(opts?.page ?? 1));

  const filter: Record<string, unknown> = { approved: true };
  const mf = opts?.msFilter?.trim();
  if (mf && mf !== "all" && MS_OPTIONS.includes(mf as CommunityMs)) {
    filter.ms = mf;
  }

  const col = db.collection("community_posts");
  const total = await col.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * pageSize;

  const rows = await col
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .toArray();

  return {
    posts: rows.map((r) =>
      serializePost(r as Record<string, unknown>, viewerNorm),
    ),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function createCommunityPostAction(
  email: string,
  input: { body: string; ms: CommunityMs; replyToId?: string | null },
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
  const col = db.collection("community_posts");

  let replyToId: ObjectId | undefined;
  let replyToPreview:
    | { initials: string; name: string; snippet: string }
    | undefined;

  const rawReply = input.replyToId?.trim();
  if (rawReply) {
    let parentOid: ObjectId;
    try {
      parentOid = new ObjectId(rawReply);
    } catch {
      return { ok: false, error: "Invalid reply target" };
    }
    const parent = await col.findOne({ _id: parentOid, approved: true });
    if (!parent) return { ok: false, error: "Original post not found" };
    replyToId = parentOid;
    replyToPreview = {
      initials: String(parent.initials ?? "?"),
      name: String(parent.name ?? "Member"),
      snippet: postPlainSnippet(
        String(parent.body ?? ""),
        parent.bodyIsHtml !== false,
      ),
    };
  }

  await col.insertOne({
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
    ...(replyToId && replyToPreview
      ? { replyToId, replyToPreview }
      : {}),
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
