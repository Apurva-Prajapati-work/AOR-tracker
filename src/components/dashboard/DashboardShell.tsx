"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getLiveCohortAggregateAction,
  listRelatedCohortSummariesAction,
  type CohortSummaryRow,
  type LiveCohortAggregate,
} from "@/app/actions/aggregate";
import { getCohortStatsForProfileAction } from "@/app/actions/cohort";
import { getProfileAction, updateMilestoneAction } from "@/app/actions/profile";
import { LogoMark } from "@/components/LogoMark";
import { DashboardLoadingSkeleton } from "@/components/dashboard/DashboardLoadingSkeleton";
import { DashboardProvider } from "@/components/dashboard/DashboardContext";
import { DashboardRails } from "@/components/dashboard/DashboardRails";
import { useToast } from "@/components/ToastContext";
import { MILESTONE_DEFS } from "@/lib/constants";
import { dashboardHref, dashboardNavActive } from "@/lib/dashboard-nav";
import { humanizeCohortKey } from "@/lib/cohort";
import { computeProfileCompleteness } from "@/lib/profile-completeness";
import {
  daysSinceAor,
  estimatePprWindow,
  pctThroughMedian,
} from "@/lib/ppr-estimate";
import { clearSessionEmail, readSessionEmail } from "@/lib/session-client";
import type { CohortStats, MilestoneKey, UserProfile } from "@/lib/types";

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cohort, setCohort] = useState<CohortStats | null>(null);
  const [openPicker, setOpenPicker] = useState<MilestoneKey | null>(null);
  const [savedFlash, setSavedFlash] = useState<MilestoneKey | null>(null);
  const [ringPct, setRingPct] = useState(0);
  const [liveAggregate, setLiveAggregate] = useState<LiveCohortAggregate | null>(
    null,
  );
  const [relatedCohorts, setRelatedCohorts] = useState<
    Omit<CohortSummaryRow, "isCurrent">[]
  >([]);

  const load = useCallback(async (em: string) => {
    const p = await getProfileAction(em);
    if (!p.ok) {
      router.replace("/");
      return;
    }
    setProfile(p.profile);
    const c = await getCohortStatsForProfileAction(p.profile);
    setCohort(c);
    const [live, related] = await Promise.all([
      getLiveCohortAggregateAction(c.cohortKey),
      listRelatedCohortSummariesAction(c.cohortKey, p.profile.stream),
    ]);
    setLiveAggregate(live);
    setRelatedCohorts(related);
  }, [router]);

  const refreshAfterProfileUpdate = useCallback(
    async (next: UserProfile) => {
      setProfile(next);
      const c = await getCohortStatsForProfileAction(next);
      setCohort(c);
      const [live, related] = await Promise.all([
        getLiveCohortAggregateAction(c.cohortKey),
        listRelatedCohortSummariesAction(c.cohortKey, next.stream),
      ]);
      setLiveAggregate(live);
      setRelatedCohorts(related);
    },
    [],
  );

  useEffect(() => {
    const em = readSessionEmail();
    if (!em) {
      router.replace("/");
      return;
    }
    startTransition(() => {
      setEmail(em);
    });
  }, [router]);

  useEffect(() => {
    if (!email) return;
    const id = window.setTimeout(() => {
      void load(email);
    }, 0);
    return () => window.clearTimeout(id);
  }, [email, load]);

  const cohortDisplay = useMemo((): CohortStats | null => {
    if (!cohort || !liveAggregate) return cohort;
    const useLive = liveAggregate.profileCount >= 2;
    if (!useLive) return cohort;
    return {
      ...cohort,
      n_verified: liveAggregate.profileCount,
      per_milestone_n: { ...liveAggregate.perMilestoneFilled },
    };
  }, [cohort, liveAggregate]);

  const ppr = useMemo(() => {
    if (!profile || !cohortDisplay || !profile.aorDate) return null;
    return estimatePprWindow(profile.aorDate, cohortDisplay);
  }, [profile, cohortDisplay]);

  const completeness = useMemo(
    () => (profile ? computeProfileCompleteness(profile) : null),
    [profile],
  );

  const similarCohortsDisplay = useMemo((): CohortSummaryRow[] => {
    if (!cohort) return [];
    const current: CohortSummaryRow = {
      cohortKey: cohort.cohortKey,
      label: humanizeCohortKey(cohort.cohortKey),
      nVerified: cohort.n_verified,
      medianDays: cohort.median_days_to_ppr,
      isCurrent: true,
    };
    const rest = relatedCohorts
      .filter((r) => r.cohortKey !== cohort.cohortKey)
      .map((r) => ({ ...r, isCurrent: false as const }));
    return [current, ...rest].slice(0, 5);
  }, [cohort, relatedCohorts]);

  const cohortInsightHtml = useMemo(() => {
    if (!liveAggregate || !cohort || liveAggregate.profileCount < 1) return null;
    const n = liveAggregate.profileCount;
    const bio = liveAggregate.perMilestoneFilled.biometrics;
    return `<strong>Your cohort on AOR Track</strong> — ${n} saved profile${n === 1 ? "" : "s"} in ${humanizeCohortKey(cohort.cohortKey)}. ${bio} logged biometrics completed.`;
  }, [liveAggregate, cohort]);

  const days = profile?.aorDate ? daysSinceAor(profile.aorDate) : 0;
  const median = cohortDisplay?.median_days_to_ppr ?? 184;
  const pct = pctThroughMedian(days, median);

  useEffect(() => {
    const t = window.setTimeout(() => setRingPct(pct), 250);
    return () => window.clearTimeout(t);
  }, [pct]);

  const ringOffset = 207 - (207 * ringPct) / 100;

  const switchProfile = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm("Switch to a different profile?")
    ) {
      clearSessionEmail();
      router.push("/");
    }
  };

  const onSaveMilestone = async (key: MilestoneKey, val: string) => {
    if (!email || !val) return;
    const res = await updateMilestoneAction(email, key, val);
    if (res.ok && res.profile) {
      setProfile(res.profile);
      setOpenPicker(null);
      setSavedFlash(key);
      window.setTimeout(() => setSavedFlash(null), 3000);
      const c = await getCohortStatsForProfileAction(res.profile);
      setCohort(c);
      const live = await getLiveCohortAggregateAction(c.cohortKey);
      setLiveAggregate(live);
      toast.show(`✓ ${MILESTONE_DEFS.find((m) => m.key === key)?.label} date saved`);
    }
  };

  const cohortTotal = cohortDisplay?.n_verified ?? cohort?.n_verified ?? 0;

  const shareUrl =
    typeof window !== "undefined" && profile
      ? `${window.location.origin}/t/${profile.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-")}-${(profile.aorDate || "aor").replaceAll("-", "")}`
      : "";

  if (!profile || !cohort || !cohortDisplay || !email) {
    return <DashboardLoadingSkeleton />;
  }

  const ctxValue = {
    email,
    profile,
    setProfile,
    cohort,
    setCohort,
    cohortDisplay,
    liveAggregate,
    setLiveAggregate,
    relatedCohorts,
    setRelatedCohorts,
    refreshAfterProfileUpdate,
    onSaveMilestone,
    openPicker,
    setOpenPicker,
    savedFlash,
    switchProfile,
    days,
    median,
    pct,
    ppr,
    completeness,
    similarCohortsDisplay,
    cohortInsightHtml,
    cohortTotal,
    ringOffset,
    shareUrl,
  };

  return (
    <DashboardProvider value={ctxValue}>
      <div id="screen-dashboard" className="screen active flex min-h-screen flex-col">
        <div className="topbar">
          <Link href="/" className="logo">
            <div className="logo-icon text-white">
              <LogoMark />
            </div>
            <span className="logo-name">
              AOR<span>Track</span>
            </span>
          </Link>
          <nav className="nav">
            <Link
              href={dashboardHref.timeline}
              className={`nb ${dashboardNavActive(pathname, "timeline") ? "on" : ""}`}
            >
              Timeline
            </Link>
            <Link
              href={dashboardHref.community}
              className={`nb ${dashboardNavActive(pathname, "community") ? "on" : ""}`}
            >
              Community
            </Link>
            <Link
              href={dashboardHref.stats}
              className={`nb ${dashboardNavActive(pathname, "stats") ? "on" : ""}`}
            >
              Processing Stats
            </Link>
            <Link
              href={dashboardHref.share}
              className={`nb ${dashboardNavActive(pathname, "share") ? "on" : ""}`}
            >
              Share
            </Link>
          </nav>
          <div className="tr">
            <span className="text-[11px] text-[var(--t3)]">
              <span className="dlive" />
              Live
            </span>
            <button type="button" className="bg" onClick={switchProfile}>
              Switch profile
            </button>
          </div>
        </div>

        <div className="dlayout flex-1 min-h-0">
          <aside className="dsb">
            <div className="sblbl">Views</div>
            <Link
              href={dashboardHref.timeline}
              className={`sbitem no-underline ${dashboardNavActive(pathname, "timeline") ? "on" : ""}`}
            >
              <span className="sbico">📅</span>My Timeline
            </Link>
            <Link
              href={dashboardHref.community}
              className={`sbitem no-underline ${dashboardNavActive(pathname, "community") ? "on" : ""}`}
            >
              <span className="sbico">👥</span>Community Feed
            </Link>
            <Link
              href={dashboardHref.stats}
              className={`sbitem no-underline ${dashboardNavActive(pathname, "stats") ? "on" : ""}`}
            >
              <span className="sbico">📊</span>Processing Stats
            </Link>
            <Link
              href={dashboardHref.share}
              className={`sbitem no-underline ${dashboardNavActive(pathname, "share") ? "on" : ""}`}
            >
              <span className="sbico">🔗</span>Share Timeline
            </Link>
            <hr className="sbdiv" />
            <div className="sblbl">Similar cohorts</div>
            {similarCohortsDisplay.slice(0, 3).map((s) => (
              <div
                key={s.cohortKey}
                className={`sbitem ${s.isCurrent ? "on" : ""}`}
                role="presentation"
              >
                <span className="sbico">◈</span>
                <span className="truncate">{s.label.split("·")[0]?.trim()}</span>
              </div>
            ))}
            <hr className="sbdiv" />
            <Link href="/onboarding" className="sbitem no-underline">
              <span className="sbico">✏️</span>Edit profile
            </Link>
            <button type="button" className="sbitem" onClick={switchProfile}>
              <span className="sbico">↩</span>Switch profile
            </button>
            <div className="sbuser">
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(192,57,43,0.2)] text-[10px] font-semibold text-[var(--red)]">
                  {email.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="sbun">{email.split("@")[0]}</div>
                  <div className="sbue">{email}</div>
                </div>
              </div>
              <div className="sbub">
                {profile.stream} · {profile.type} · {profile.province}
              </div>
            </div>
          </aside>

          <main className="dmain">{children}</main>

          <aside className="dr">
            <DashboardRails
              days={days}
              pct={pct}
              ringOffset={ringOffset}
              median={median}
              ppr={ppr}
              cohort={cohortDisplay}
              similarCohorts={similarCohortsDisplay}
              cohortInsightHtml={cohortInsightHtml}
            />
          </aside>
        </div>
      </div>
    </DashboardProvider>
  );
}
