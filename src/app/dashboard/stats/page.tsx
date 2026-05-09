import type { Metadata } from "next";
import { DashboardStatsTab } from "@/components/dashboard/DashboardStatsTab";

export const metadata: Metadata = {
  title: "Processing stats — AORTrack",
};

export default function DashboardStatsPage() {
  return <DashboardStatsTab />;
}
