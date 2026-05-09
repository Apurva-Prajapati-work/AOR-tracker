import type { Metadata } from "next";
import "@/styles/hero-animation.css";
import { HeroAnimationClient } from "@/components/marketing/HeroAnimationClient";

export const metadata: Metadata = {
  title: "Hero Animation — AORTrack",
  description:
    "Interactive preview of the AORTrack landing experience: live feed, dashboard, AOR form, and PPR timeline views.",
  robots: { index: true, follow: true },
};

export default function HeroAnimationPage() {
  return <HeroAnimationClient />;
}
