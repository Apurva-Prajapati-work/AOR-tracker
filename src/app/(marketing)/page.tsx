import type { Metadata } from "next";
import "@/styles/landing-sections.css";
import { LandingMarketingClient } from "@/components/marketing/LandingMarketingClient";

export const metadata: Metadata = {
  title: "AORTrack — Canadian PR Processing Time Tracker | Free | Community Powered",
  description:
    "Track your Canadian permanent residency processing time with real crowd-sourced data from thousands of applicants. Free, open-source, no signup required.",
  openGraph: {
    title: "AORTrack — Free Canadian PR Processing Time Tracker",
    description:
      "Real processing timelines from the community — not IRCC's generic estimate.",
    url: "https://track.getnorthpath.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://track.getnorthpath.com",
  },
};

export default function MarketingHomePage() {
  return <LandingMarketingClient />;
}
