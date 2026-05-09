import type { Metadata } from "next";
import { TrackClient } from "./TrackClient";

export const metadata: Metadata = {
  title: "Track — AORTrack",
  description:
    "Start tracking your Canadian PR application with AORTrack. Enter your email to create or resume a profile synced via server actions.",
  alternates: {
    canonical: "https://track.getnorthpath.com/track",
  },
  openGraph: {
    title: "Track — AORTrack",
    url: "https://track.getnorthpath.com/track",
    type: "website",
  },
};

export default function TrackPage() {
  return <TrackClient />;
}
