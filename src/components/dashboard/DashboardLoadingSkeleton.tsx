import Link from "next/link";

/**
 * Loading state shown by `DashboardShellV2` while the profile + cohort
 * server actions are in flight. Mirrors the v2 layout (`.dashboard-v2-page`
 * → `.dnb` + `.dlay` → `.dsb` / `.dmain`) so the page doesn't visually
 * "jump" the moment data lands.
 *
 * Uses the global `.sk` shimmer helpers from `aortrack.css` (imported via
 * `globals.css`); all surrounding layout classes come from
 * `dashboard-v2.css`, which is imported in `app/dashboard/layout.tsx`.
 */

function SidebarSkeleton() {
  return (
    <aside className="dsb" aria-hidden>
      {/* Mirrors `.dsb-card` (applicant id / stream / type / AOR row) */}
      <div className="dsb-card">
        <div className="sk sk-line sm mb-2 w-16 opacity-70" />
        <div className="sk sk-line mb-1 h-4 w-32" />
        <div className="sk sk-line sm mt-1 w-24 opacity-60" />
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2">
          <div className="sk sk-line sm w-12 opacity-60" />
          <div className="sk sk-line sm w-16 opacity-70" />
        </div>
      </div>

      {/* Dashboard / Community / Share / Profile sections */}
      {([5, 3, 4, 3] as const).map((count, sectionIdx) => (
        <div key={sectionIdx}>
          <div className="dsb-sec">
            <div className="dsb-lbl">
              <span className="sk sk-line sm inline-block h-2.5 w-16 opacity-60" />
            </div>
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="sk mx-3 mb-1 h-8 rounded-md opacity-80"
                style={{
                  width: `${72 + ((i * 13) % 28)}%`,
                  animationDelay: `${(sectionIdx * 3 + i) * 0.05}s`,
                }}
              />
            ))}
          </div>
          {sectionIdx < 3 ? <div className="dsb-div" aria-hidden /> : null}
        </div>
      ))}
    </aside>
  );
}

function HeroBarSkeleton() {
  return (
    <div className="hero-bar">
      {/* Days-since-AOR box */}
      <div className="days-box">
        <div className="sk mx-auto h-10 w-24 rounded-md opacity-90" />
        <div className="sk sk-line sm mx-auto mt-3 w-20 opacity-70" />
        <div className="sk sk-line sm mx-auto mt-2 w-28 opacity-50" />
      </div>

      {/* 3 small KPI cards */}
      <div className="stat-grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="s-card">
            <div className="sk sk-line sm w-24 opacity-70" />
            <div className="sk sk-line mb-1 mt-3 h-6 w-20" />
            <div className="sk sk-line sm w-28 opacity-60" />
          </div>
        ))}
      </div>
    </div>
  );
}

function RingsRowSkeleton() {
  return (
    <div className="rings-row">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="ring-card">
          <div className="ring-svg-wrap">
            <div className="sk h-[68px] w-[68px] rounded-full" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="sk sk-line h-3 w-32 max-w-[80%]" />
            <div className="sk sk-line sm w-40 max-w-[90%]" />
            <div className="sk sk-line sm w-24 opacity-70" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineRowSkeleton({ isLast }: { isLast?: boolean }) {
  return (
    <div className="tl-row">
      <div className="tl-spine" aria-hidden />
      <div className="sk h-7 w-7 shrink-0 rounded-full" />
      <div className="tl-body">
        <div className="tl-top">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="sk sk-line h-3.5 w-44 max-w-[60%]" />
            <div className="sk sk-line sm w-full max-w-md opacity-70" />
          </div>
          <div className="tl-r space-y-2 text-right">
            <div className="sk sk-line ml-auto h-3 w-20" />
            <div className="sk sk-line sm ml-auto w-16 opacity-70" />
          </div>
        </div>
        {!isLast ? (
          <div className="sk mt-3 h-1 w-full rounded-full opacity-70" />
        ) : null}
      </div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <section id="tl-sec" aria-hidden>
      <div className="sec-head">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="sk sk-line h-4 w-56 max-w-[50%]" />
          <div className="sk sk-line sm w-full max-w-lg opacity-70" />
        </div>
        <div className="sk h-7 w-24 rounded-md opacity-80" />
      </div>

      <div className="timeline">
        <TimelineRowSkeleton />
        <TimelineRowSkeleton />
        <TimelineRowSkeleton />
        <TimelineRowSkeleton isLast />
      </div>
    </section>
  );
}

function LoadingHeader() {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="sk-loader" aria-hidden />
      <div className="min-w-0">
        <p className="text-[14px] font-semibold tracking-tight text-(--navy)">
          Loading your dashboard
        </p>
        <p className="mt-0.5 text-[12px] leading-snug text-(--muted)">
          Fetching profile, cohort stats, and timeline…
        </p>
      </div>
    </div>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <div
      className="dashboard-v2-page flex min-h-0 flex-1 flex-col"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      {/* App-bar (mirrors `DashboardAppBar`) */}
      <nav className="dnb" aria-hidden>
        <div className="dnb-l">
          <Link href="/" className="dnb-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logo.png"
              alt=""
              className="dnb-logo"
              width={24}
              height={24}
            />
            <div className="dnb-name">AORTrack</div>
          </Link>
          <div className="dnb-sep" aria-hidden />
          <span className="sk sk-line h-3 w-28 opacity-70" />
        </div>
        <div className="dnb-r">
          <span className="sk h-6 w-28 rounded-full opacity-80" />
          <span className="sk h-7 w-16 rounded-md opacity-80" />
          <span className="sk h-7 w-28 rounded-md opacity-80" />
        </div>
      </nav>

      <div className="dlay">
        <SidebarSkeleton />
        <main className="dmain">
          <LoadingHeader />
          <HeroBarSkeleton />
          <RingsRowSkeleton />
          <TimelineSkeleton />
        </main>
      </div>
    </div>
  );
}
