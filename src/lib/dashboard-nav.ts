/** Dashboard section URLs (App Router). */
export const dashboardHref = {
  timeline: "/dashboard",
  community: "/dashboard/community",
  stats: "/dashboard/stats",
  share: "/dashboard/share",
} as const;

export type DashboardSegment = keyof typeof dashboardHref;

export function dashboardNavActive(
  pathname: string | null,
  segment: DashboardSegment,
): boolean {
  if (!pathname) return false;
  const normalized = pathname.replace(/\/$/, "") || "/";
  const target = dashboardHref[segment].replace(/\/$/, "") || "/";
  if (segment === "timeline") {
    return normalized === "/dashboard";
  }
  return normalized === target;
}
