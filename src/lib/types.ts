export type MilestoneKey =
  | "aor"
  | "bil"
  | "biometrics"
  | "background"
  | "medical"
  | "ppr";

export type MilestoneEntry = {
  date: string | null;
  updatedAt: string | null;
};

export type UserProfile = {
  email: string;
  createdAt: string;
  updatedAt: string;
  aorDate: string;
  stream: string;
  type: string;
  province: string;
  milestones: Record<MilestoneKey, MilestoneEntry>;
};

export type CohortStats = {
  cohortKey: string;
  median_days_to_ppr: number;
  p25_days: number;
  p75_days: number;
  n_verified: number;
  completion_rate: number;
  weekly_delta?: number;
  per_milestone_n: Partial<Record<MilestoneKey, number>>;
  dist: { range: string; count: number; pct: number; you?: boolean }[];
  pulseWeekly: number[];
  stream_medians: { name: string; median: number }[];
  last_updated: string;
};

export type CommunityPost = {
  id: string;
  initials: string;
  name: string;
  meta: string;
  ms: string;
  msl: string;
  body: string;
  tl: { label: string; done: boolean }[];
  helpful: number;
};
