import type { Metadata } from "next";
import { CommunityFeedClient } from "./CommunityFeedClient";

export const metadata: Metadata = {
  title: "Community — AORTrack",
};

export default function DashboardCommunityPage() {
  return <CommunityFeedClient />;
}
