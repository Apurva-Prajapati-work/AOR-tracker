import type { UserProfile } from "@/lib/types";

const STREAM_SLUG: Record<string, string> = {
  "CEC General": "CEC_GENERAL",
  "CEC STEM": "CEC_STEM",
  "CEC Healthcare": "CEC_HEALTHCARE",
  "CEC French": "CEC_FRENCH",
  "FSW General": "FSW_GENERAL",
  PNP: "PNP",
};

const PROVINCE_SLUG: Record<string, string> = {
  Ontario: "ON",
  "British Columbia": "BC",
  Alberta: "AB",
  Quebec: "QC",
  Manitoba: "MB",
  Saskatchewan: "SK",
  "Nova Scotia": "NS",
  Other: "OT",
};

const SLUG_TO_PROVINCE: Record<string, string> = Object.fromEntries(
  Object.entries(PROVINCE_SLUG).map(([k, v]) => [v, k]),
);

const MONTH_SHORT = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function streamSlugFromLabel(stream: string): string {
  return STREAM_SLUG[stream] ?? "CEC_GENERAL";
}

export function provinceSlugFromLabel(province: string): string {
  const t = province?.trim();
  if (!t) return "NA";
  return PROVINCE_SLUG[t] ?? t.replace(/\s+/g, "_").toUpperCase().slice(0, 10);
}

export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Regex pattern string (no slashes) matching cohorts in the same peer group:
 * same stream, inland/outland, province — any AOR month/year.
 */
export function peerCohortKeyPattern(profileCohortKey: string): string {
  const parts = profileCohortKey.split(":");
  if (parts.length >= 5) {
    const stream = escapeRegex(parts[0] ?? "");
    const kind = escapeRegex(parts[3] ?? "");
    const prov = escapeRegex(parts[4] ?? "");
    return `^${stream}:\\d+:\\d{4}:${kind}:${prov}$`;
  }
  if (parts.length >= 4) {
    const stream = escapeRegex(parts[0] ?? "");
    const kind = escapeRegex(parts[3] ?? "");
    return `^${stream}:\\d+:\\d{4}:${kind}$`;
  }
  if (parts.length >= 2) {
    return `^${escapeRegex(parts[0] ?? "")}:`;
  }
  return `^${escapeRegex(profileCohortKey)}`;
}

export function humanizeCohortKey(key: string): string {
  const parts = key.split(":");
  const slug = parts[0] ?? key;
  const streamLabel =
    Object.entries(STREAM_SLUG).find(([, v]) => v === slug)?.[0] ??
    slug.replace(/_/g, " ");

  if (parts.length >= 5) {
    const mi = parseInt(parts[1] ?? "0", 10);
    const year = parts[2] ?? "";
    const kind = parts[3] === "outland" ? "Outland" : "Inland";
    const prov = parts[4] ?? "";
    const mo =
      !mi || Number.isNaN(mi) ? "—" : (MONTH_SHORT[mi] ?? parts[1]);
    const provLabel =
      !prov || prov === "NA"
        ? ""
        : ` · ${SLUG_TO_PROVINCE[prov] ?? prov}`;
    return `${mo} ${year} · ${streamLabel} · ${kind}${provLabel}`;
  }

  if (parts.length >= 4) {
    const mi = parseInt(parts[1] ?? "0", 10);
    const year = parts[2] ?? "";
    const kind = parts[3] === "outland" ? "Outland" : "Inland";
    const mo =
      !mi || Number.isNaN(mi) ? "—" : (MONTH_SHORT[mi] ?? parts[1]);
    return `${mo} ${year} · ${streamLabel} · ${kind}`;
  }
  if (parts.length >= 2) {
    return `${streamLabel} · ${parts[1]}`;
  }
  return streamLabel;
}

export function pulseTitleFromAor(aorDate: string): string {
  const d = new Date(`${aorDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "Weekly PPR pulse";
  const label = d.toLocaleDateString("en-CA", { month: "long", year: "numeric" });
  return `Weekly PPR pulse — ${label} cohorts`;
}

export function buildCohortKey(
  profile: Pick<UserProfile, "aorDate" | "stream" | "type" | "province">,
): string {
  const d = new Date(`${profile.aorDate}T12:00:00`);
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const stream = streamSlugFromLabel(profile.stream);
  const kind = profile.type.toLowerCase() === "outland" ? "outland" : "inland";
  const prov = provinceSlugFromLabel(profile.province ?? "Other");
  return `${stream}:${month}:${year}:${kind}:${prov}`;
}

/** When AOR is missing — groups by stream, year, type, province (month 0 = unspecified). */
export function streamFallbackKey(
  stream: string,
  province?: string,
  type?: string,
): string {
  const slug = streamSlugFromLabel(stream);
  const y = new Date().getFullYear();
  const kind = type?.toLowerCase() === "outland" ? "outland" : "inland";
  const prov = provinceSlugFromLabel(province ?? "Other");
  return `${slug}:0:${y}:${kind}:${prov}`;
}

export function cohortKeyFromProfile(
  profile: Pick<UserProfile, "aorDate" | "stream" | "type" | "province">,
): string {
  if (profile.aorDate?.trim()) {
    return buildCohortKey(profile);
  }
  return streamFallbackKey(profile.stream, profile.province, profile.type);
}
