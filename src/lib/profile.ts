import type { MilestoneKey, MilestoneEntry, UserProfile } from "./types";
import { MILESTONE_DEFS } from "./constants";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emptyMilestones(): Record<MilestoneKey, MilestoneEntry> {
  return Object.fromEntries(
    MILESTONE_DEFS.map((m) => [m.key, { date: null, updatedAt: null }]),
  ) as Record<MilestoneKey, MilestoneEntry>;
}

export function newProfile(email: string): UserProfile {
  const now = new Date().toISOString();
  return {
    email: normalizeEmail(email),
    createdAt: now,
    updatedAt: now,
    aorDate: "",
    stream: "CEC General",
    type: "Inland",
    province: "Ontario",
    milestones: emptyMilestones(),
  };
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
