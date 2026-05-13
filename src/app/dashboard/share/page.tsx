import type { Metadata } from "next";
import { DashboardShareTabV2 } from "@/components/dashboard/v2/DashboardShareTabV2";

export const metadata: Metadata = {
  title: "Share — AORTrack",
};

export default function DashboardSharePage() {
  return <DashboardShareTabV2 />;
}
