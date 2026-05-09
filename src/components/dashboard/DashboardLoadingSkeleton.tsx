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

function SidebarSkeleton() {
  return (
    <aside className="dsb" aria-hidden>
      <div className="sk sk-line mb-2 h-3 w-16 opacity-60" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="sk mb-1 h-8 w-full rounded-lg opacity-80" />
      ))}
      <div className="sbdiv" />
      <div className="sk sk-line mb-2 mt-2 h-3 w-24 opacity-60" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="sk mb-1 h-8 w-full rounded-lg opacity-70" />
      ))}
      <div className="mt-auto rounded-[10px] border border-[var(--border)] bg-[var(--navy3)] p-3">
        <div className="flex gap-2">
          <div className="sk h-7 w-7 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="sk sk-line w-24" />
            <div className="sk sk-line sm w-full max-w-[140px]" />
          </div>
        </div>
        <div className="sk mt-3 h-5 w-full max-w-[180px] rounded" />
      </div>
    </aside>
  );
}

function RightRailSkeleton() {
  return (
    <aside className="dr" aria-hidden>
      <div className="rc">
        <div className="sk sk-line mx-auto mb-2 h-3 w-20" />
        <div className="sk sk-ring mx-auto opacity-90" />
        <div className="sk sk-line mx-auto mt-2 w-16" />
        <div className="sk sk-line sm mx-auto mt-1 w-24" />
        <div className="sk mt-3 h-16 w-full rounded-lg" />
      </div>
      <div className="rc space-y-2">
        <div className="sk sk-line h-3 w-28" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-2 py-1">
            <div className="sk mt-1 h-1.5 w-1.5 shrink-0 rounded-full" />
            <div className="sk h-8 flex-1 rounded-md" />
          </div>
        ))}
      </div>
    </aside>
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
        <div className="nav pointer-events-none opacity-60">
          <span className="sk h-7 w-[4.5rem] rounded-md" />
          <span className="sk h-7 w-20 rounded-md" />
          <span className="sk h-7 max-md:hidden w-[7.5rem] rounded-md" />
          <span className="sk h-7 w-14 rounded-md" />
        </div>
        <div className="tr pointer-events-none">
          <span className="sk h-7 w-24 rounded-md" />
        </div>
      </div>

      <div className="dlayout flex-1 min-h-0">
        <SidebarSkeleton />

        <main className="dmain">
          <div className="flex flex-col items-center gap-3 py-1 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-3">
              <div className="sk-loader" aria-hidden />
              <div>
                <p className="text-[14px] font-semibold tracking-tight text-[var(--t1)]">
                  Loading your dashboard
                </p>
                <p className="mt-0.5 max-w-md text-[12px] leading-snug text-[var(--t2)]">
                  Fetching profile, cohort stats, and timeline…
                </p>
              </div>
            </div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--t3)]">
              <span className="dlive" aria-hidden /> One moment
            </p>
          </div>

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
              <div className="cgrid pt-1">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="sk cdot"
                    style={{ animationDelay: `${(i % 8) * 0.06}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>

        <RightRailSkeleton />
      </div>
    </div>
  );
}
