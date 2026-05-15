import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteUrl } from "@/lib/site-url";
import {
  STREAM_PAGE_SLUGS,
  streamLabelFromSitemapSlug,
} from "@/lib/streams-sitemap-slugs";
import { WebsiteLogo } from "@/components/WebsiteLogo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return STREAM_PAGE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const label = streamLabelFromSitemapSlug(slug);
  if (!label) return { title: "Stream — AORTrack" };
  const url = `${getSiteUrl()}/streams/${slug}`;
  return {
    title: `${label} — PR timelines | AORTrack`,
    description: `Crowd-sourced Canadian PR processing timelines for ${label}. Compare milestones and cohort stats on AORTrack.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${label} — AORTrack`,
      description: `Track and compare ${label} PR timelines with community data.`,
      url,
      type: "website",
    },
  };
}

export default async function StreamLandingPage({ params }: Props) {
  const { slug } = await params;
  const label = streamLabelFromSitemapSlug(slug);
  if (!label) notFound();

  return (
    <div className="marketing-site flex min-h-screen flex-col bg-[#0f1923] text-white">
      <header className="border-b border-white/10 px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <WebsiteLogo href="/" className="opacity-95" size="sm" aria-label="AORTrack — home" />
          <Link
            href="/track"
            className="rounded-lg bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-[#0a1219] hover:bg-emerald-400"
          >
            Track my AOR
          </Link>
        </div>
      </header>
      <main className="mx-auto flex max-w-3xl flex-1 flex-col gap-6 px-4 py-12">
        <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
          {label}
        </h1>
        <p className="text-lg text-white/75">
          Explore real applicant milestones and cohort-level stats for this stream on
          AORTrack — free, no account required.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/track"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#0f1923] hover:bg-white/90"
          >
            Start tracking
          </Link>
          <Link
            href="/dashboard/stats"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-sm font-medium text-white/90 hover:border-white/35"
          >
            Processing stats
          </Link>
        </div>
      </main>
    </div>
  );
}
