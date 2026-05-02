import type { MilestoneKey } from "./types";

export const MILESTONE_DEFS: {
  key: MilestoneKey;
  label: string;
  est: string;
  desc: string;
}[] = [
  {
    key: "aor",
    label: "AOR received",
    est: "~Feb 2025",
    desc: "Acknowledgement of receipt confirmed by IRCC",
  },
  {
    key: "bil",
    label: "Biometrics instruction letter",
    est: "~15d after AOR",
    desc: "Avg. 15 days after AOR in your cohort",
  },
  {
    key: "biometrics",
    label: "Biometrics completed",
    est: "~27d after AOR",
    desc: "Tracker may lag 3–5 days after completion",
  },
  {
    key: "background",
    label: "Background check initiated",
    est: "~Apr–May 2025",
    desc: "Appears on IRCC tracker · median day 58",
  },
  {
    key: "medical",
    label: "Medical results received",
    est: "~Jun–Jul 2025",
    desc: "Officer review begins shortly after · median 112d",
  },
  {
    key: "ppr",
    label: "PPR — Passport request",
    est: "~Aug–Sep 2025",
    desc: "Final step before PR approval · median day 184",
  },
];

export const STREAM_OPTIONS = [
  "CEC General",
  "CEC STEM",
  "CEC Healthcare",
  "CEC French",
  "FSW General",
  "PNP",
] as const;

export const PROVINCES = [
  "Ontario",
  "British Columbia",
  "Alberta",
  "Quebec",
  "Manitoba",
  "Saskatchewan",
  "Nova Scotia",
  "Other",
] as const;

export const INSIGHTS = [
  {
    t: "g" as const,
    txt: "<strong>Processing accelerated</strong> — 18 PPRs in 7 days vs 11 prior week in your cohort.",
  },
  {
    t: "a" as const,
    txt: "<strong>WES verification delays</strong> affecting 12% of Feb 2025 applicants. Avg +22 days on BGC.",
  },
  {
    t: "r" as const,
    txt: "<strong>IRCC tracker lag</strong> — BIL completed but tracker not updating for 34 users. Known issue.",
  },
  {
    t: "b" as const,
    txt: "<strong>Background checks</strong> appear started for Feb 18–28 AOR cohort — 41 community reports.",
  },
];

export const SIMILAR_COHORTS = [
  { label: "Feb 25 · CEC General", meta: "Inland · 412 applicants", days: "~184d", on: true },
  { label: "Feb 2025 · CEC STEM", meta: "Inland · 87 applicants", days: "~167d", on: false },
  { label: "Jan 2025 · CEC General", meta: "Mixed · 538 applicants", days: "~201d", on: false },
  { label: "Mar 2025 · CEC General", meta: "Inland · 301 applicants", days: "~192d", on: false },
];

export const WES_ROWS = [
  {
    t: "Regular WES",
    s: "dl" as const,
    d: 62,
    n: "IRCC cannot verify — upload scanned copy",
  },
  {
    t: "IRCC Course-by-Course",
    s: "ok" as const,
    d: 5,
    n: "Recommended for PR applications",
  },
  { t: "ECA (General)", s: "ok" as const, d: 7, n: "Standard; verify expiry date" },
  { t: "WES Premium", s: "pe" as const, d: 14, n: "No IRCC-direct option" },
];

export const TICKER = [
  {
    time: "2m ago",
    type: "ppr" as const,
    label: "PPR",
    text: "Applicant #4821 received PPR — Feb 20 AOR CEC General, day 172",
    stream: "CEC Gen",
  },
  {
    time: "18m ago",
    type: "bil" as const,
    label: "BIL",
    text: "Applicant #7723 received BIL — Mar 15 AOR CEC STEM, day 14",
    stream: "CEC STEM",
  },
  {
    time: "42m ago",
    type: "bg" as const,
    label: "BGC",
    text: "Applicant #3390 background check started — Feb 18 AOR, day 58",
    stream: "CEC Gen",
  },
  {
    time: "1h ago",
    type: "ppr" as const,
    label: "PPR",
    text: "Applicant #2201 received PPR — Jan 28 AOR CEC French, day 145",
    stream: "CEC FR",
  },
  {
    time: "2h ago",
    type: "bil" as const,
    label: "BIL",
    text: "Applicant #9910 received BIL — Apr 2 AOR CEC STEM, day 12",
    stream: "CEC STEM",
  },
];
