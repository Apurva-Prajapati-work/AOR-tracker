import type { Metadata } from "next";
import { DashboardStatsTabV2 } from "@/components/dashboard/v2/DashboardStatsTabV2";

export const metadata: Metadata = {
  title: "Processing stats — AORTrack",
};

export default function DashboardStatsPage() {
  return <DashboardStatsTabV2 />;
}
