# AORTrack schema v3

Schemas as specified for the product redesign.

---

## 1. Draw category

```ts
export const DRAW_CATEGORIES = [
  { value: "general", label: "General, all program draw" },
  { value: "french", label: "French language proficiency" },
  {
    value: "healthcare-social",
    label: "Healthcare and social services occupations",
  },
  {
    value: "stem",
    label: "Science, Technology, Engineering and Math (STEM) occupations",
  },
  {
    value: "trades",
    label: "Trade occupations (carpenters, electricians, welders)",
  },
  {
    value: "transport",
    label: "Transport occupations (truck drivers, pilots)",
  },
  { value: "education", label: "Education occupations" },
  {
    value: "physicians-senior-managers-researchers-military",
    label:
      "Physicians, senior managers, researchers and military recruits with Canadian work experience",
  },
] as const;

export type DrawCategory = (typeof DRAW_CATEGORIES)[number]["value"];
```

---



## 2. Visa offices

```ts
export const OFFICE_LIST = [
  "Ottawa",
  "Edmonton",
  "Vancouver",
  "Montreal",
  "Scarborough",
  "Etobicoke",
  "Mississauga",
  "Niagara Falls",
  "Sydney NS",
  "New Delhi",
  "Chandigarh",
  "Manila",
  "London UK",
  "Abu Dhabi",
  "Ankara",
  "Mexico City",
  "Sao Paulo",
  "Other",
  "Not sure",
] as const;

export type VisaOffice = (typeof OFFICE_LIST)[number];
```

### Office adjustments

Days added to every estimable milestone **after BIL** when the user has a PVO. Not applied to `bil` itself. Config (code or collection) — not on the user doc.

```ts
OFFICE_ADJ: Record<VisaOffice, number> = {
  Ottawa: 0,
  Edmonton: -6,
  Vancouver: -3,
  Montreal: 4,
  Scarborough: 8,
  Etobicoke: 6,
  Mississauga: 5,
  "Niagara Falls": 2,
  "Sydney NS": -4,
  "New Delhi": 18,
  Chandigarh: 16,
  Manila: 12,
  "London UK": 8,
  "Abu Dhabi": 10,
  Ankara: 14,
  "Mexico City": 9,
  "Sao Paulo": 11,
  Other: 0,
  "Not sure": 0,
};
```

Placeholder values from the product HTML. Replace with data-backed adjustments when enough PVO-tagged completions exist.

---



## 3. Milestones

```ts
export const MILESTONES = [
  {
    id: "bil",
    sec: "biometrics",
    label: "Biometrics letter (BIL) received",
    desc: "The instruction letter from IRCC, usually about 2 months after AOR",
    est: true,
  },
  {
    id: "bio_done",
    sec: "biometrics",
    label: "Biometrics completed",
    desc: "You get 30 days from your BIL, so this one is in your hands",
    est: false,
    needs: "bil",
  },
  {
    id: "medical",
    sec: "medical-and-background",
    label: "Medical passed",
    desc: "Your account shows medical results received",
    est: true,
  },
  {
    id: "bgc_start",
    sec: "medical-and-background",
    label: "Background check initiated",
    desc: "BGC flips from not applicable to in progress",
    est: true,
  },
  {
    id: "crim",
    sec: "medical-and-background",
    label: "Criminality check completed",
    desc: "Part of the background check",
    est: true,
    sub: true,
    needs: "bgc_start",
  },
  {
    id: "info",
    sec: "medical-and-background",
    label: "Information sharing completed",
    desc: "Part of the background check",
    est: true,
    sub: true,
    needs: "bgc_start",
  },
  {
    id: "sec",
    sec: "medical-and-background",
    label: "Security check completed",
    desc: "Part of the background check",
    est: true,
    sub: true,
    needs: "bgc_start",
  },
  {
    id: "elig",
    sec: "medical-and-background",
    label: "Eligibility check completed",
    desc: "Eligibility shows recommended or passed",
    est: true,
  },
  {
    id: "final",
    sec: "decision-and-portals",
    label: "Final decision received",
    desc: "Your application shows approved",
    est: true,
  },
  {
    id: "p1",
    sec: "decision-and-portals",
    label: "P1 Portal invitation received",
    desc: "First PR confirmation portal email",
    est: true,
  },
  {
    id: "p2",
    sec: "decision-and-portals",
    label: "P2 Portal invitation received",
    desc: "Photo and address portal email",
    est: true,
  },
  {
    id: "ecopr",
    sec: "the-finish-line",
    label: "eCOPR received",
    desc: "Electronic Confirmation of Permanent Residence",
    est: true,
  },
  {
    id: "prcard",
    sec: "the-finish-line",
    label: "PR card received",
    desc: "The physical card lands in your mailbox",
    est: true,
  },
] as const;
```



### Milestone config vs stored data

`MILESTONES` above is **UI / validation only** (`label`, `sec`, `desc`, `est`, `needs`, `sub`). It is not written onto each profile.

### Profile milestone (stored on user)

Only id + date:

```ts
PROFILE_MILESTONE = {
  milestoneId: MILESTONES.id;
  milestoneDate: date;                 // ISO YYYY-MM-DD
}
```

Join to `MILESTONES` in the app when rendering labels, sections, estimates, and dependency rules.

---



## 4. User details

```ts
USER_DETAILS = {
  crsScore: number | null;
  maritalStatus: enum[married, single, common-law] | null;
  spouseStatus: enum[accompanying, non-accompanying, no-spouse] | null;
  nationality: enum[countries] | null;
  foreignWork: boolean | null;
  foreignWorkYears: number | null;     // when foreignWork is true
  canadianWork: boolean | null;
  canadianWorkYears: number | null;    // when canadianWork is true
  dependants: number | null;
  countryOfResidence: enum[countries] | null;
  medicalType: enum[old-medical, new-medical] | null;
}
```

PVO / SVO live on `USER_SCHEMA` (they drive estimates), not inside `userDetails`.
All `USER_DETAILS` fields are optional at first submit.

---



## 5. User schema

```ts
USER_SCHEMA = {
  _id: ObjectId;

  // Identity
  username: string | null;             // unique for live users; not enforced while seeding
  email: string;                       // email validation & unique
  emailNorm: string;                   // lowercased; unique index
  caseNo: string | null;               // tracker Case # — unique (sparse)
  shareToken: string | null;           // public /s/[token] — unique (sparse)
  seededData: boolean;                 // true = scraped/imported from tracker

  // Application
  applyingFrom: enum[inland, outland];
  pathway: enum[express-entry, provincial-nominee-program];
  // expressEntryProgram only when pathway is express-entry
  expressEntryProgram: enum[cec, fswp, fstp, null];
  drawCategory: enum[DRAW_CATEGORIES];
  itaDate: date;
  aorDate: date;
  primaryVisaOffice: enum[OFFICE_LIST] | null;
  secondaryVisaOffice: enum[OFFICE_LIST] | null;

  // Timeline + cohort
  milestones: PROFILE_MILESTONE[];     // id + date only; UI joins MILESTONES config
  cohortKey: ref("Cohort");            // always ObjectId → COHORT._id
  currentStatus: string | null;        // tracker "current status" string, if any

  // Optional extras
  userDetails: USER_DETAILS;           // all fields optional at first submit
  purity: number | null;               // import data-quality score

  // Timestamps
  createdAt: date;
  updatedAt: date;
  submittedAt: date | null;            // first time milestones flow completed
}
```

### Uniqueness

| Field | Unique? | Notes |
|-------|---------|--------|
| `email` / `emailNorm` | Yes | Always |
| `caseNo` | Yes (sparse) | Tracker sync PK; null for non-seeded |
| `shareToken` | Yes (sparse) | Null until share is created |
| `username` | Yes for live users | **Not unique while seeding** — tracker usernames can collide; seeded rows may omit or share names. Enforce uniqueness only when `seededData === false` (app submit / account create). |

Resolve cohort on write: find-or-create `COHORT` by `"{YYYY-MM}|{inland|outland}"`, then set `USER_SCHEMA.cohortKey` to that document’s `_id`.

---



## 6. Cohort

```ts
// cohortKey = "{YYYY-MM}|{inland|outland}"
// Example: "2026-03|inland"
// Derived from: aorDate.slice(0, 7) + "|" + applyingFrom

COHORT = {
  _id: ObjectId;
  cohortKey: string;                 // unique — "{YYYY-MM}|{inland|outland}"
  aorMonth: string;                    // "YYYY-MM"
  applyingFrom: enum[inland, outland];
  // Browse grid + detail header
  nApplicants: number;                 // verified profiles in this cohort
  dominantStage: MILESTONES.id | null; // furthest milestone most applicants have reached
  stageDistribution: {                 // counts per furthest milestone (for sparkline / filters)
    [milestoneId: MILESTONES.id]: number;
  };

  // eCOPR timing (computed on sync)
  nCompleted: number;                  // applicants with eCOPR logged
  nWaiting: number;                    // applicants still in progress
  medianDaysToEcopr: number;           // P50 days AOR → eCOPR
  p25DaysToEcopr: number;
  p75DaysToEcopr: number;

  // Optional per-milestone medians when n is large enough
  perMilestoneMedian: {
    [milestoneId: MILESTONES.id]: number; // median days from AOR
  };

  algorithmVersion: string;            // e.g. "v3.0"
  lastUpdated: date;
}
```

`USER_SCHEMA.cohortKey` is always `ref("Cohort")` → `COHORT._id`. The human-readable key lives only on `COHORT.cohortKey`. Cohort stats are rebuilt on profile insert/update and weekly sync.

---



## 7. Stream / estimation pace

One document per `applyingFrom`. Powers timeline chips and “typical day” estimates. Separate from month cohorts — empty month cohorts still fall back here.

```ts
STREAM_PACE = {
  _id: ObjectId;
  applyingFrom: enum[inland, outland]; // unique

  // Median (or mean) days from AOR → each estimable milestone
  // Omit bio_done (est:false — never community-estimated)
  daysFromAor: {
    bil: number;
    medical: number;
    bgc_start: number;
    crim: number;
    info: number;
    sec: number;
    elig: number;
    final: number;
    p1: number;
    p2: number;
    ecopr: number;
    prcard: number;
  };

  // How many profiles contributed to each milestone median
  segmentN: {
    [milestoneId: MILESTONES.id]: number;
  };

  totalDaysToEcopr: number;            // = daysFromAor.ecopr (or sum of gaps)
  profilesScanned: number;
  seededProfiles: number;
  computedAt: date;
  algorithmVersion: string;            // e.g. "v3.0"
}
```

### Placeholder seed (from product HTML — replace after sync)

```ts
// inland daysFromAor
{ bil:58, medical:74, bgc_start:96, crim:122, info:133, sec:154,
  elig:165, final:182, p1:185, p2:189, ecopr:216, prcard:268 }

// outland daysFromAor
{ bil:66, medical:88, bgc_start:110, crim:139, info:151, sec:174,
  elig:186, final:204, p1:208, p2:213, ecopr:241, prcard:300 }
```

### Estimate formula

```
base = STREAM_PACE[applyingFrom].daysFromAor[milestoneId]
adj  = milestoneId === "bil" ? 0 : (OFFICE_ADJ[primaryVisaOffice] ?? 0)
est  = aorDate + base + adj
then: chain-forward (never before previous milestone)
then: future-shift pending chain if first pending < today
never estimate bio_done
```

Recomputed on weekly sync from profiles with enough `segmentN` per milestone. Prefer live + correctly labeled seeded rows; do not trust inland/outland split until seed labeling is fixed.

---



## What needs to be added

1. **Indexes** — unique on `emailNorm`; sparse unique on `caseNo` / `shareToken`; unique on `username` only for live users (`seededData: false`); index on `cohortKey` (ObjectId) and `applyingFrom`; unique on `STREAM_PACE.applyingFrom`.
2. **Tracker → milestone mapping** — which source columns fill which of the 13 ids; which ids are user-only (`crim`, `info`, `sec`, `elig`, `final`, `prcard`, `bio_done`).
3. **Inland/outland on seed** — stop defaulting all imported rows to inland; map real type (and inland/outland P1/eCOPR columns) before `STREAM_PACE` and cohort stats are trustworthy.

