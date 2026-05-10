import type { Metadata } from "next";
import { readFileSync } from "fs";
import { join } from "path";
import { StandaloneMarketingClient } from "@/components/marketing/StandaloneMarketingClient";
import { parseMetaFromStandaloneHtml, parseStandaloneHtml } from "@/lib/parse-standalone-html";

const FILE = join(process.cwd(), "samples", "aortrack-changelog-updated.html");

function loadRaw(): string {
  return readFileSync(FILE, "utf8");
}

export function generateMetadata(): Metadata {
  const raw = loadRaw();
  const meta = parseMetaFromStandaloneHtml(raw);
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: "https://track.getnorthpath.com/changelog" },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: "https://track.getnorthpath.com/changelog",
      type: "website",
    },
  };
}

export default function ChangelogPage() {
  const parsed = parseStandaloneHtml(loadRaw());
  return <StandaloneMarketingClient {...parsed} />;
}
