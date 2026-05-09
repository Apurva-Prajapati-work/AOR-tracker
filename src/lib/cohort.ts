const STREAM_SLUG: Record<string, string> = {
  "CEC General": "CEC_GENERAL",
  "CEC STEM": "CEC_STEM",
  "CEC Healthcare": "CEC_HEALTHCARE",
  "CEC French": "CEC_FRENCH",
  "FSW General": "FSW_GENERAL",
  PNP: "PNP",
};

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

export function humanizeCohortKey(key: string): string {
  const parts = key.split(":");
  const slug = parts[0] ?? key;
  const streamLabel =
    Object.entries(STREAM_SLUG).find(([, v]) => v === slug)?.[0] ??
    slug.replace(/_/g, " ");
  if (parts.length >= 4) {
    const mi = parseInt(parts[1] ?? "0", 10);
    const year = parts[2] ?? "";
    const kind = parts[3] === "outland" ? "Outland" : "Inland";
    const mo = MONTH_SHORT[mi] ?? parts[1];
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

export function buildCohortKey(profile: {
  aorDate: string;
  stream: string;
  type: string;
}): string {
  const d = new Date(`${profile.aorDate}T12:00:00`);
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const stream = streamSlugFromLabel(profile.stream);
  const kind = profile.type.toLowerCase() === "outland" ? "outland" : "inland";
  return `${stream}:${month}:${year}:${kind}`;
}

export function streamFallbackKey(stream: string): string {
  const slug = streamSlugFromLabel(stream);
  const y = new Date().getFullYear();
  return `${slug}:${y}`;
}
