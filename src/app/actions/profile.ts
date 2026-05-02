"use server";

import { getDb } from "@/lib/db";
import { buildCohortKey, streamFallbackKey } from "@/lib/cohort";
import { ensureSeed } from "@/lib/seed";
import {
  emptyMilestones,
  isValidEmail,
  newProfile,
  normalizeEmail,
} from "@/lib/profile";
import type { MilestoneKey, UserProfile } from "@/lib/types";

function iso(v: unknown): string {
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string") return v;
  return new Date().toISOString();
}

function docToProfile(doc: Record<string, unknown>): UserProfile {
  const m = doc.milestones as UserProfile["milestones"];
  return {
    email: doc.emailNorm as string,
    createdAt: iso(doc.createdAt),
    updatedAt: iso(doc.updatedAt),
    aorDate: (doc.aorDate as string) ?? "",
    stream: (doc.stream as string) ?? "CEC General",
    type: (doc.type as string) ?? "Inland",
    province: (doc.province as string) ?? "Ontario",
    milestones: m ?? emptyMilestones(),
  };
}

export async function getProfileAction(
  email: string,
): Promise<{ ok: true; profile: UserProfile } | { ok: false; error: string }> {
  if (!isValidEmail(email)) {
    return { ok: false, error: "Invalid email" };
  }
  const db = await getDb();
  await ensureSeed(db);
  const norm = normalizeEmail(email);
  const doc = await db.collection("profiles").findOne({ emailNorm: norm });
  if (!doc) return { ok: false, error: "not_found" };
  return { ok: true, profile: docToProfile(doc as Record<string, unknown>) };
}

export async function saveProfileAction(profile: UserProfile): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (!isValidEmail(profile.email)) return { ok: false, error: "Invalid email" };
  const db = await getDb();
  await ensureSeed(db);
  const norm = normalizeEmail(profile.email);
  const now = new Date();
  await db.collection("profiles").updateOne(
    { emailNorm: norm },
    {
      $set: {
        emailNorm: norm,
        aorDate: profile.aorDate,
        stream: profile.stream,
        type: profile.type,
        province: profile.province,
        milestones: profile.milestones,
        cohortKey: profile.aorDate
          ? buildCohortKey({
              aorDate: profile.aorDate,
              stream: profile.stream,
              type: profile.type,
            })
          : streamFallbackKey(profile.stream),
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true },
  );
  return { ok: true };
}

export async function createDraftProfileAction(
  email: string,
): Promise<{ ok: true; profile: UserProfile } | { ok: false; error: string }> {
  if (!isValidEmail(email)) return { ok: false, error: "Invalid email" };
  const db = await getDb();
  await ensureSeed(db);
  const norm = normalizeEmail(email);
  const existing = await db.collection("profiles").findOne({ emailNorm: norm });
  if (existing) {
    return { ok: true, profile: docToProfile(existing as Record<string, unknown>) };
  }
  const profile = newProfile(norm);
  await db.collection("profiles").insertOne({
    emailNorm: norm,
    createdAt: new Date(profile.createdAt),
    updatedAt: new Date(profile.updatedAt),
    aorDate: profile.aorDate,
    stream: profile.stream,
    type: profile.type,
    province: profile.province,
    milestones: profile.milestones,
    cohortKey: streamFallbackKey(profile.stream),
  });
  return { ok: true, profile };
}

export async function updateMilestoneAction(
  email: string,
  key: MilestoneKey,
  date: string | null,
): Promise<{ ok: boolean; error?: string; profile?: UserProfile }> {
  if (!isValidEmail(email)) return { ok: false, error: "Invalid email" };
  const db = await getDb();
  await ensureSeed(db);
  const norm = normalizeEmail(email);
  const now = new Date().toISOString();
  const update: Record<string, unknown> = {
    [`milestones.${key}.date`]: date,
    [`milestones.${key}.updatedAt`]: date ? now : null,
    updatedAt: new Date(),
  };
  if (key === "aor" && date) {
    update.aorDate = date;
  }
  await db.collection("profiles").updateOne({ emailNorm: norm }, { $set: update });
  const doc = await db.collection("profiles").findOne({ emailNorm: norm });
  if (!doc) return { ok: false, error: "not_found" };
  const profile = docToProfile(doc as Record<string, unknown>);
  if (profile.aorDate) {
    await db.collection("profiles").updateOne(
      { emailNorm: norm },
      {
        $set: {
          cohortKey: buildCohortKey({
            aorDate: profile.aorDate,
            stream: profile.stream,
            type: profile.type,
          }),
        },
      },
    );
  }
  return { ok: true, profile };
}

const DEMO_EMAIL = "demo@aortrack.ca";

export async function ensureDemoProfileAction(): Promise<UserProfile> {
  const db = await getDb();
  await ensureSeed(db);
  const norm = normalizeEmail(DEMO_EMAIL);
  const now = new Date().toISOString();
  const milestones = emptyMilestones();
  milestones.aor = { date: "2025-02-25", updatedAt: now };
  milestones.bil = { date: "2025-03-12", updatedAt: now };
  milestones.biometrics = { date: "2025-03-24", updatedAt: now };
  const profile: UserProfile = {
    email: norm,
    createdAt: now,
    updatedAt: now,
    aorDate: "2025-02-25",
    stream: "CEC General",
    type: "Inland",
    province: "Ontario",
    milestones,
  };
  await db.collection("profiles").updateOne(
    { emailNorm: norm },
    {
      $set: {
        emailNorm: norm,
        aorDate: profile.aorDate,
        stream: profile.stream,
        type: profile.type,
        province: profile.province,
        milestones: profile.milestones,
        cohortKey: buildCohortKey({
          aorDate: profile.aorDate,
          stream: profile.stream,
          type: profile.type,
        }),
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true },
  );
  const saved = await db.collection("profiles").findOne({ emailNorm: norm });
  return docToProfile(saved as Record<string, unknown>);
}
