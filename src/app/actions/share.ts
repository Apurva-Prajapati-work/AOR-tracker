"use server";

import { randomBytes } from "crypto";
import { getCohortStatsForProfileAction } from "@/app/actions/cohort";
import { getDb } from "@/lib/db";
import { emptyMilestones, isValidEmail, normalizeEmail } from "@/lib/profile";
import {
  daysSinceAor,
  estimatePprWindow,
  pctThroughMedian,
} from "@/lib/ppr-estimate";
import type { UserProfile } from "@/lib/types";

const TOKEN_RE = /^[a-f0-9]{36}$/i;

export type PublicSharePayload = {
  displayName: string;
  stream: string;
  province: string;
  type: string;
  aorDate: string;
  days: number;
  median: number;
  pct: number;
  pprP50: string;
  pprWindow: string;
};

function sliceProfileFromDoc(doc: Record<string, unknown>): Pick<
  UserProfile,
  "aorDate" | "stream" | "type" | "province" | "milestones" | "email"
> {
  const m = doc.milestones as UserProfile["milestones"] | undefined;
  return {
    email: doc.emailNorm as string,
    aorDate: (doc.aorDate as string) ?? "",
    stream: (doc.stream as string) ?? "CEC General",
    type: (doc.type as string) ?? "Inland",
    province: (doc.province as string) ?? "Ontario",
    milestones: m ?? emptyMilestones(),
  };
}

export async function ensureShareTokenForEmailAction(
  email: string,
): Promise<
  { ok: true; token: string } | { ok: false; error: string }
> {
  if (!isValidEmail(email)) return { ok: false, error: "Invalid email" };
  const norm = normalizeEmail(email);
  const db = await getDb();
  const col = db.collection("profiles");

  const existing = await col.findOne(
    { emailNorm: norm },
    { projection: { shareToken: 1 } },
  );
  if (!existing) return { ok: false, error: "not_found" };

  const current = existing.shareToken;
  if (typeof current === "string" && TOKEN_RE.test(current)) {
    return { ok: true, token: current.toLowerCase() };
  }

  const token = randomBytes(18).toString("hex");
  await col.updateOne({ emailNorm: norm }, { $set: { shareToken: token } });
  const doc = await col.findOne(
    { emailNorm: norm },
    { projection: { shareToken: 1 } },
  );
  const t = doc?.shareToken;
  if (typeof t === "string" && TOKEN_RE.test(t)) {
    return { ok: true, token: t.toLowerCase() };
  }
  return { ok: false, error: "Could not create share link" };
}

export async function getPublicSharePayloadAction(
  token: string,
): Promise<PublicSharePayload | null> {
  const t = token.trim().toLowerCase();
  if (!TOKEN_RE.test(t)) return null;

  const db = await getDb();
  const doc = await db.collection("profiles").findOne({ shareToken: t });
  if (!doc) return null;

  const p = sliceProfileFromDoc(doc as Record<string, unknown>);
  const aorDate =
    p.aorDate.trim() ||
    (p.milestones.aor?.date as string | null | undefined)?.trim() ||
    "";

  const cohort = await getCohortStatsForProfileAction({
    aorDate: aorDate || "2000-01-01",
    stream: p.stream,
    type: p.type,
    province: p.province,
  });

  const median = cohort.median_days_to_ppr || 184;
  const days = aorDate ? daysSinceAor(aorDate) : 0;
  const pct = pctThroughMedian(days, median);

  let pprP50 = "—";
  let pprWindow = "—";
  if (aorDate) {
    const est = estimatePprWindow(aorDate, cohort);
    pprP50 = est.p50Approx;
    pprWindow = est.windowLabel;
  }

  const displayName =
    (p.email.split("@")[0] ?? "applicant").replace(/[._-]+/g, " ").trim() ||
    "Applicant";

  return {
    displayName,
    stream: p.stream,
    province: p.province,
    type: p.type,
    aorDate,
    days,
    median,
    pct,
    pprP50,
    pprWindow,
  };
}
