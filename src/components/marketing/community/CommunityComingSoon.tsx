import Image from "next/image";
import Link from "next/link";
import { IconDashboardGrid } from "./community-icons";

type Props = {
  /** Matches `COMMUNITY_NAV.dashboardHref` when the full feed is enabled. */
  dashboardHref?: string;
};

/**
 * Lightweight `/community` placeholder: same nav chrome as the live feed,
 * without `CommunityShell` / `CommunityUiProvider` or data fetching.
 */
export function CommunityComingSoon({ dashboardHref = "/dashboard" }: Props) {
  return (
      <main className="relative flex min-h-[calc(100vh-60px)] flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6 sm:py-16">
        <div className="relative z-1 mx-auto w-full max-w-lg">
          <div className="rounded-3xl border border-(--border)/80 bg-(--cream)/75 p-8 shadow-[0_24px_80px_-12px_rgba(26,35,50,0.18)] ring-1 ring-black/4 backdrop-blur-md sm:p-10">
            <div className="flex flex-col items-center text-center">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2d6a4f]/25 bg-[#eaf4ee]/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1f5038] shadow-sm">
                <span
                  className="relative flex h-2 w-2 shrink-0"
                  aria-hidden
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2d6a4f]/40 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2d6a4f]" />
                </span>
                In the works
              </span>

              <div className="relative mb-6 flex flex-col items-center gap-3 sm:mb-8">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-[0_8px_30px_rgba(26,35,50,0.12)] ring-1 ring-(--border)/60 sm:h-28 sm:w-28">
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white to-(--cream2)/80" />
                  <Image
                    src="/Logo.png"
                    alt=""
                    width={112}
                    height={112}
                    className="relative z-1 h-16 w-16 object-contain sm:h-18 sm:w-18"
                    priority
                  />
                </div>
                <Image
                  src="/animation-text.png"
                  alt="AORTrack"
                  width={200}
                  height={72}
                  className="h-9 w-auto max-w-[min(220px,85vw)] object-contain object-center opacity-95 sm:h-10"
                  priority
                />
              </div>

              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-(--muted2)">
                Community
              </p>
              <h1 className="mb-3 font-(family-name:--fh) text-3xl font-extrabold tracking-tight text-(--navy) sm:text-[2.125rem] sm:leading-tight">
                Something good is on the way
              </h1>
              <p className="max-w-sm text-pretty font-(family-name:--fb) text-[15px] leading-relaxed text-(--muted) sm:text-base">
                We&apos;re crafting a place to share milestones, learn from
                cohorts, and connect with others on the PR journey.
              </p>

              <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-(--border) bg-white/90 px-5 text-sm font-semibold text-(--navy) shadow-sm transition hover:border-(--border2) hover:bg-white"
                >
                  Back to home
                </Link>
                <Link
                  href={dashboardHref}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-(--navy) px-5 text-sm font-semibold text-white! shadow-md transition hover:bg-(--navy2)"
                >
                  <IconDashboardGrid className="h-[13px] w-[13px]" aria-hidden />
                  Open dashboard
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center font-(family-name:--fm) text-[12px] text-(--muted2)">
            Follow updates on{" "}
            <a
              href="https://github.com/Get-North-Path/AOR-tracker"
              className="font-semibold text-(--navy) underline decoration-(--border) underline-offset-2 transition hover:decoration-(--navy)"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </main>
  );
}
