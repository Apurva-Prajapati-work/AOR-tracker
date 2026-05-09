"use client";

import { CommunityFeedPanel } from "@/components/dashboard/CommunityFeedPanel";
import { useDashboard } from "@/components/dashboard/DashboardContext";

export function CommunityFeedClient() {
  const { email, profile } = useDashboard();
  return <CommunityFeedPanel email={email} profile={profile} />;
}
