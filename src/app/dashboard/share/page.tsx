import type { Metadata } from "next";
import { DashboardShareTab } from "@/components/dashboard/DashboardShareTab";

export const metadata: Metadata = {
  title: "Share — AORTrack",
};

export default function DashboardSharePage() {
  return <DashboardShareTab />;
}
