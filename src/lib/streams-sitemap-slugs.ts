import { STREAM_OPTIONS } from "@/lib/constants";

export type StreamOption = (typeof STREAM_OPTIONS)[number];

/** URL segment under `/streams/*` — kept in sync with `STREAM_OPTIONS`. */
export const STREAM_PAGE_SLUG_BY_LABEL: Record<StreamOption, string> = {
  "CEC General": "cec",
  // "CEC STEM": "cec-stem",
  // "CEC Healthcare": "cec-healthcare",
  // "CEC French": "cec-french",
  "FSW General": "fsw",
  // "PNP": "pnp",
};

export const STREAM_PAGE_SLUGS: readonly string[] = STREAM_OPTIONS.map(
  (label) => STREAM_PAGE_SLUG_BY_LABEL[label],
);

export function streamLabelFromSitemapSlug(slug: string): StreamOption | null {
  const hit = (
    Object.entries(STREAM_PAGE_SLUG_BY_LABEL) as [StreamOption, string][]
  ).find(([, s]) => s === slug);
  return hit?.[0] ?? null;
}
