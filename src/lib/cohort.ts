const STREAM_SLUG: Record<string, string> = {
  "CEC General": "CEC_GENERAL",
  "CEC STEM": "CEC_STEM",
  "CEC Healthcare": "CEC_HEALTHCARE",
  "CEC French": "CEC_FRENCH",
  "FSW General": "FSW_GENERAL",
  PNP: "PNP",
};

export function buildCohortKey(profile: {
  aorDate: string;
  stream: string;
  type: string;
}): string {
  const d = new Date(`${profile.aorDate}T12:00:00`);
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const stream = STREAM_SLUG[profile.stream] ?? "CEC_GENERAL";
  const kind = profile.type.toLowerCase() === "outland" ? "outland" : "inland";
  return `${stream}:${month}:${year}:${kind}`;
}

export function streamFallbackKey(stream: string): string {
  const slug = STREAM_SLUG[stream] ?? "CEC_GENERAL";
  const y = new Date().getFullYear();
  return `${slug}:${y}`;
}
