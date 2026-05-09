import type { Metadata } from "next";
import "@/styles/roadmap-page.css";
import { RoadmapClient } from "@/components/marketing/RoadmapClient";

export const metadata: Metadata = {
  title: "Public Roadmap — AORTrack | Canadian PR Tracker",
  description:
    "See what the AORTrack community is building next. Vote on features, follow issues, and track progress in the open on GitHub.",
  alternates: {
    canonical: "https://track.getnorthpath.com/roadmap",
  },
  openGraph: {
    title: "Public Roadmap — AORTrack",
    url: "https://track.getnorthpath.com/roadmap",
    type: "website",
  },
};

export default function RoadmapPage() {
  return <RoadmapClient />;
}
