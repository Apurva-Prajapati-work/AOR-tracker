import type { Metadata } from "next";
import "@/styles/marketing-core.css";
import "@/styles/community.css";
// import {
//   getCommunityFeedAction,
//   getCommunityMsCountsAction,
// } from "@/app/actions/community";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { CommunityComingSoon } from "@/components/marketing/community/CommunityComingSoon";
// import { CommunityClient } from "@/components/marketing/community/CommunityClient";
// import { CommunityNav } from "@/components/marketing/community/CommunityNav";
// import { CommunityShell } from "@/components/marketing/community/CommunityShell";
// import { communityPostToApproved } from "@/components/marketing/community/adapter";
// import {
//   buildCommunityPageData,
//   COMMUNITY_NAV,
//   type Post,
// } from "@/components/marketing/community/data";
// import { COMMUNITY_FEED_PAGE_SIZE } from "@/lib/community-feed";

const CANONICAL = "https://track.getnorthpath.com/community";

export const metadata: Metadata = {
  title: "Community Feed — AORTrack",
  description:
    "Live feed of crowd-sourced Canadian PR processing milestones — replies, cohort insights, and community moderation flows.",
  alternates: { canonical: CANONICAL },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Community Feed — AORTrack",
    description:
      "Timelines, replies, and weekly eCOPR pulse from the AORTrack community.",
    url: CANONICAL,
    type: "website",
  },
};

/**
 * Placeholder: `CommunityComingSoon`. To restore the live feed, uncomment
 * `dynamic`, the server actions + `CommunityShell` tree in this file, and
 * the related imports above.
 */
// export const dynamic = "force-dynamic";

export default function CommunityPage() {
  // const [firstPage, counts] = await Promise.all([
  //   getCommunityFeedAction(null, {
  //     page: 1,
  //     pageSize: COMMUNITY_FEED_PAGE_SIZE,
  //   }),
  //   getCommunityMsCountsAction(),
  // ]);
  //
  // const posts: Post[] = firstPage.posts.map((p) =>
  //   communityPostToApproved(p),
  // );
  // const data = buildCommunityPageData(posts, counts);

  return (
    <div className="marketing-site flex min-h-screen flex-col">
      <div className="mkt-community-page flex min-h-0 flex-1 flex-col">
        <CommunityComingSoon />
        {/* <CommunityShell */}
        {/*   data={data} */}
        {/*   initialMsFilter={null} */}
        {/*   initialPage={firstPage.page} */}
        {/*   initialTotal={firstPage.total} */}
        {/*   initialTotalPages={firstPage.totalPages} */}
        {/* > */}
        {/*   <CommunityNav dashboardHref={COMMUNITY_NAV.dashboardHref} /> */}
        {/*   <CommunityClient data={data} /> */}
        {/* </CommunityShell> */}
      </div>
      <MarketingFooter />
    </div>
  );
}
