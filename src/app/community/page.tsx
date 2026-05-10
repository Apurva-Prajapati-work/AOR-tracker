import type { Metadata } from "next";
import { readFileSync } from "fs";
import { join } from "path";
import { StandaloneMarketingClient } from "@/components/marketing/StandaloneMarketingClient";
import { parseMetaFromStandaloneHtml, parseStandaloneHtml } from "@/lib/parse-standalone-html";

const FILE = join(process.cwd(), "samples", "aortrack-community-updated.html");

function loadRaw(): string {
  return readFileSync(FILE, "utf8");
}

export function generateMetadata(): Metadata {
  const raw = loadRaw();
  const meta = parseMetaFromStandaloneHtml(raw);
  return {
    title: meta.title,
    description:
      meta.description ??
      "Community feed preview — timelines, replies, and moderation flows for AORTrack.",
    robots: meta.robots ?? { index: false, follow: false },
    openGraph: {
      title: meta.title,
      url: "https://track.getnorthpath.com/community",
      type: "website",
    },
  };
}

export default function CommunityMarketingPage() {
  const parsed = parseStandaloneHtml(loadRaw());
  return <StandaloneMarketingClient {...parsed} />;
}
