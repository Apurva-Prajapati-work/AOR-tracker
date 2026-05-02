import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";

function StatCardSkeleton() {
  return (
    <div className="sc">
      <div className="sk sk-line mb-2 w-24 max-w-[70%]" />
      <div className="sk sk-line mb-1 h-7 w-16" />
      <div className="sk sk-line sm mt-1 w-20 max-w-[85%]" />
    </div>
  );
}

function TimelineRowSkeleton({
  withBar,
  isLast,
}: {
  withBar?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="tlrow border-b border-[var(--border)] pb-4 last:border-0">
      <div className="tll">
        <div className="sk sk-line w-20" />
        <div className="sk sk-line sm mt-2 w-16" />
      </div>
      <div className="tlc">
        <div className="sk sk-dot" />
        {!isLast ? (
          <div className="tlln mt-0.5 min-h-[18px] w-0.5 bg-[var(--border)]" />
        ) : null}
      </div>
      <div className="tlr min-w-0 flex-1">
        <div className="sk sk-line mb-2 w-[min(280px,90%)]" />
        <div className="sk sk-line sm mb-2 w-full max-w-md" />
        {withBar ? (
          <div className="mt-2 flex items-center gap-2">
            <div className="sk h-1 flex-1 rounded-full" />
            <div className="sk sk-line sm w-28 shrink-0" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <div
      id="screen-dashboard"
      className="screen active flex min-h-screen flex-col bg-[var(--navy)]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <div className="topbar">
        <Link href="/" className="logo">
          <div className="logo-icon text-white">
            <LogoMark />
          </div>
          <span className="logo-name">
            AOR<span>Track</span>
          </span>
        </Link>
        <div className="nav pointer-events-none opacity-70">
          <span className="sk h-7 w-[4.5rem] rounded-md" />
          <span className="sk h-7 w-20 rounded-md" />
          <span className="sk h-7 w-14 rounded-md max-md:hidden" />
          <span className="sk h-7 w-14 rounded-md" />
        </div>
        <div className="tr pointer-events-none">
          <span className="sk h-7 w-24 rounded-md" />
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-3.5 py-4 md:px-5 md:py-5">
          <header className="text-center">
            <p className="text-[15px] font-semibold tracking-tight text-[var(--t1)]">
              Loading your timeline
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-[13px] font-light leading-snug text-[var(--t2)]">
              Syncing your profile, cohort statistics, and community feed from
              the server.
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[var(--t3)]">
              <span className="dlive" aria-hidden />
              Please wait
            </p>
          </header>

          <div className="srow">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          <div className="card">
            <div className="chd">
              <div className="sk sk-line h-4 w-48 max-w-[60%]" />
              <div className="sk sk-line sm h-3 w-32" />
            </div>
            <div className="mt-1 space-y-0">
              <TimelineRowSkeleton withBar />
              <TimelineRowSkeleton withBar />
              <TimelineRowSkeleton withBar />
              <TimelineRowSkeleton isLast />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            <div className="card">
              <div className="chd">
                <div className="sk sk-line h-4 w-40" />
                <div className="sk sk-line sm h-3 w-20" />
              </div>
              <div className="space-y-2.5 pt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="sk sk-line w-14 shrink-0" />
                    <div className="sk h-5 flex-1 rounded" />
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="chd">
                <div className="sk sk-line h-4 w-28" />
                <div className="sk sk-line sm h-3 w-24" />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="sk h-3 w-3 rounded-sm"
                    style={{ animationDelay: `${(i % 8) * 0.08}s` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto flex justify-center pb-2 lg:hidden">
            <div className="flex max-w-xs flex-col items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--navy2)] px-5 py-4">
              <div className="sk sk-ring" />
              <div className="sk sk-line w-28" />
              <div className="sk sk-line sm w-40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
