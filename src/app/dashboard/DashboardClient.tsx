"use client";

import Link from "next/link";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { getCohortStatsForProfileAction } from "@/app/actions/cohort";
import { getCommunityFeedAction } from "@/app/actions/community";
import { getProfileAction, updateMilestoneAction } from "@/app/actions/profile";
import { LogoMark } from "@/components/LogoMark";
import { useToast } from "@/components/ToastContext";
import {
  INSIGHTS,
  MILESTONE_DEFS,
  SIMILAR_COHORTS,
  WES_ROWS,
} from "@/lib/constants";
import {
  daysSinceAor,
  estimatePprWindow,
  pctThroughMedian,
} from "@/lib/ppr-estimate";
import { clearSessionEmail, readSessionEmail } from "@/lib/session-client";
import type {
  CommunityPost,
  CohortStats,
  MilestoneKey,
  UserProfile,
} from "@/lib/types";
import { fmtDate, fmtShortUpdated } from "@/lib/format";

type Tab = "tl" | "cm" | "st" | "sh";

export function DashboardClient() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cohort, setCohort] = useState<CohortStats | null>(null);
  const [feed, setFeed] = useState<CommunityPost[]>([]);
  const [tab, setTab] = useState<Tab>("tl");
  const [feedFilter, setFeedFilter] = useState<string>("all");
  const [openPicker, setOpenPicker] = useState<MilestoneKey | null>(null);
  const [savedFlash, setSavedFlash] = useState<MilestoneKey | null>(null);
  const [ringPct, setRingPct] = useState(0);

  const load = useCallback(async (em: string) => {
    const p = await getProfileAction(em);
    if (!p.ok) {
      router.replace("/");
      return;
    }
    setProfile(p.profile);
    const c = await getCohortStatsForProfileAction(p.profile);
    setCohort(c);
    const f = await getCommunityFeedAction();
    setFeed(f);
  }, [router]);

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

  const ppr = useMemo(() => {
    if (!profile || !cohort || !profile.aorDate) return null;
    return estimatePprWindow(profile.aorDate, cohort);
  }, [profile, cohort]);

  const days = profile?.aorDate ? daysSinceAor(profile.aorDate) : 0;
  const median = cohort?.median_days_to_ppr ?? 184;
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
      toast.show(`✓ ${MILESTONE_DEFS.find((m) => m.key === key)?.label} date saved`);
    }
  };

  const cohortTotal = cohort?.n_verified ?? 412;

  const dotClass = (idx: number, key: MilestoneKey, hasDate: boolean) => {
    if (!hasDate) return "pend";
    let lastDone = -1;
    MILESTONE_DEFS.forEach((d, i) => {
      if (profile?.milestones[d.key]?.date) lastDone = i;
    });
    if (idx === lastDone) return "now";
    return "done";
  };

  const shareUrl =
    typeof window !== "undefined" && profile
      ? `${window.location.origin}/t/${profile.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-")}-${(profile.aorDate || "aor").replaceAll("-", "")}`
      : "";

  if (!profile || !cohort || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--navy)] text-[var(--t2)]">
        Loading dashboard…
      </div>
    );
  }

  const filteredFeed =
    feedFilter === "all"
      ? feed
      : feed.filter((x) => x.ms === feedFilter || (feedFilter === "bg" && x.ms === "bg"));

  return (
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
        <div className="nav">
          <button
            type="button"
            className={`nb ${tab === "tl" ? "on" : ""}`}
            onClick={() => setTab("tl")}
          >
            Timeline
          </button>
          <button
            type="button"
            className={`nb ${tab === "cm" ? "on" : ""}`}
            onClick={() => setTab("cm")}
          >
            Community
          </button>
          <button
            type="button"
            className={`nb ${tab === "st" ? "on" : ""}`}
            onClick={() => setTab("st")}
          >
            Processing Stats
          </button>
          <button
            type="button"
            className={`nb ${tab === "sh" ? "on" : ""}`}
            onClick={() => setTab("sh")}
          >
            Share
          </button>
        </div>
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

      <div className="dlayout flex-1">
        <aside className="dsb">
          <div className="sblbl">Views</div>
          <button
            type="button"
            className={`sbitem ${tab === "tl" ? "on" : ""}`}
            onClick={() => setTab("tl")}
          >
            <span className="sbico">📅</span>My Timeline
          </button>
          <button
            type="button"
            className={`sbitem ${tab === "cm" ? "on" : ""}`}
            onClick={() => setTab("cm")}
          >
            <span className="sbico">👥</span>Community Feed
          </button>
          <button
            type="button"
            className={`sbitem ${tab === "st" ? "on" : ""}`}
            onClick={() => setTab("st")}
          >
            <span className="sbico">📊</span>Processing Stats
          </button>
          <button
            type="button"
            className={`sbitem ${tab === "sh" ? "on" : ""}`}
            onClick={() => setTab("sh")}
          >
            <span className="sbico">🔗</span>Share Timeline
          </button>
          <hr className="sbdiv" />
          <div className="sblbl">Similar cohorts</div>
          {SIMILAR_COHORTS.slice(0, 3).map((s) => (
            <div
              key={s.label}
              className={`sbitem ${s.on ? "on" : ""}`}
              role="presentation"
            >
              <span className="sbico">◈</span>
              {s.label.split("·")[0]?.trim()}
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
              {profile.stream} · {profile.type}
            </div>
          </div>
        </aside>

        <main className="dmain">
          <section className={`pgsec ${tab === "tl" ? "on" : ""}`}>
            <div className="srow">
              <div className="sc hi">
                <div className="slbl">Days since AOR</div>
                <div className="sval">{days}</div>
                <div className="ssub">{fmtDate(profile.aorDate) || "—"}</div>
              </div>
              <div className="sc">
                <div className="slbl">Median PPR (cohort)</div>
                <div className="sval">{median}</div>
                <div className="ssub">days · {profile.stream}</div>
              </div>
              <div className="sc">
                <div className="slbl">Est. PPR window</div>
                <div className="sval mt-1 text-base leading-tight">
                  {ppr?.windowLabel ?? "—"}
                </div>
                <div className="ssub">
                  {cohort.n_verified} similar profiles
                  {ppr?.limitedData ? " · Limited data (n < 30)" : ""}
                </div>
              </div>
              <div className="sc">
                <div className="slbl">Cohort PPR rate</div>
                <div className="sval">
                  {Math.round((cohort.completion_rate ?? 0) * 100)}%
                </div>
                <div className="ssub text-[#5de494]">
                  ↑ {Math.round((cohort.weekly_delta ?? 0) * 100)}% this week
                </div>
              </div>
            </div>

            <div className="card">
              <div className="chd">
                <span className="ctit">Your milestone timeline</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[var(--t3)]">
                    Hover any row → click to edit date
                  </span>
                  <span className="ctag">
                    {profile.stream} · {profile.type}
                  </span>
                </div>
              </div>
              <div>
                {MILESTONE_DEFS.map((def, i) => {
                  const m = profile.milestones[def.key];
                  const hasDate = !!m.date;
                  const isLast = i === MILESTONE_DEFS.length - 1;
                  const n = cohort.per_milestone_n[def.key] ?? 0;
                  const cp = Math.round((n / cohortTotal) * 100);
                  return (
                    <div key={def.key} className="tlrow">
                      <div className="tll">
                        <div className="tldw">
                          <span className="tldt">
                            {hasDate ? fmtDate(m.date) : def.est}
                          </span>
                          <button
                            type="button"
                            className="tledit"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenPicker((k) =>
                                k === def.key ? null : def.key,
                              );
                            }}
                          >
                            {hasDate ? "✏ Edit date" : "+ Add date"}
                          </button>
                          <input
                            className={`tldp ${openPicker === def.key ? "open" : ""}`}
                            type="date"
                            value={m.date ?? ""}
                            onChange={(e) =>
                              void onSaveMilestone(def.key, e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="tlc">
                        <div
                          className={`tldot ${dotClass(i, def.key, hasDate)}`}
                        />
                        {!isLast ? (
                          <div
                            className={`tlln ${hasDate ? "done" : ""}`}
                          />
                        ) : null}
                      </div>
                      <div className="tlr">
                        <div className="tltrow">
                          <span className="tltit">{def.label}</span>
                          <span
                            className={`tltag ${hasDate ? "done" : "est"}`}
                          >
                            {hasDate ? "Completed" : "Estimated"}
                          </span>
                        </div>
                        <div className="tldesc">{def.desc}</div>
                        <div
                          className={`tlsaved ${savedFlash === def.key ? "is-visible" : ""}`}
                        >
                          {m.updatedAt
                            ? `✓ Saved ${fmtShortUpdated(m.updatedAt)}`
                            : ""}
                        </div>
                        {!isLast ? (
                          <div className="tlcrowd">
                            <div className="tlcbw">
                              <div
                                className="tlcb"
                                style={{ width: `${cp}%` }}
                              />
                            </div>
                            <span className="tlctxt">
                              <b>{n}</b> of {cohortTotal} ({cp}%) past this
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              <div className="card">
                <div className="chd">
                  <span className="ctit">Days to PPR distribution</span>
                  <span className="ctag">your cohort</span>
                </div>
                {cohort.dist.map((r) => (
                  <div key={r.range} className="drow">
                    <span className="dlbl">{r.range}</span>
                    <div className="dtrk">
                      <div
                        className={`dfil ${r.you ? "y" : "n"}`}
                        style={{ width: `${r.pct}%` }}
                      >
                        <span className="dcnt">{r.count}</span>
                        {r.you ? (
                          <span className="dytag">← You</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
                <p className="mt-2 text-[10px] text-[var(--t3)]">
                  {cohort.n_verified} completed applications · {cohort.cohortKey}
                </p>
              </div>
              <div className="card">
                <div className="chd">
                  <span className="ctit">Cohort map</span>
                  <span className="ctag">{cohortTotal} applicants</span>
                </div>
                <div className="cgrid">
                  {Array.from({ length: Math.min(cohortTotal, 412) }).map(
                    (_, i) => {
                      const pos = Math.min(days - 1, 411);
                      let bg = "var(--navy4)";
                      let title = "Early stage";
                      if (i === pos) {
                        bg = "var(--red)";
                        title = `You — Day ${days}`;
                      } else if (i < 94) {
                        bg = "var(--red)";
                        title = "PPR received";
                      } else if (i < 204) {
                        bg = "rgba(192,57,43,.38)";
                        title = "In progress";
                      }
                      return (
                        <div
                          key={i}
                          className="cdot"
                          style={{
                            background: bg,
                            outline:
                              i === pos ? "2.5px solid #fff" : undefined,
                            outlineOffset: i === pos ? -2 : undefined,
                          }}
                          title={title}
                        />
                      );
                    },
                  )}
                </div>
                <div className="cleg">
                  <div className="cli">
                    <div
                      className="cld"
                      style={{ background: "var(--red)" }}
                    />
                    PPR received
                  </div>
                  <div className="cli">
                    <div
                      className="cld"
                      style={{ background: "rgba(192,57,43,.38)" }}
                    />
                    In progress
                  </div>
                  <div className="cli">
                    <div
                      className="cld"
                      style={{ background: "var(--navy4)" }}
                    />
                    Early stage
                  </div>
                  <div className="cli">
                    <div
                      className="cld"
                      style={{
                        background: "var(--red)",
                        outline: "2.5px solid #fff",
                        outlineOffset: -2,
                      }}
                    />
                    You
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={`pgsec ${tab === "cm" ? "on" : ""}`}>
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div>
                <div className="text-lg font-bold text-[var(--w)]">
                  Community reports
                </div>
                <div className="mt-0.5 text-xs text-[var(--t2)]">
                  Real applicants sharing real timelines (MongoDB feed)
                </div>
              </div>
              <div className="ffs">
                {["all", "ppr", "bil", "bg", "med"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`fch ${feedFilter === f ? "on" : ""}`}
                    onClick={() => setFeedFilter(f)}
                  >
                    {f === "all"
                      ? "All"
                      : f === "ppr"
                        ? "PPR 🎉"
                        : f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            {filteredFeed.map((c) => (
              <div key={c.id} className="fitem" data-ms={c.ms}>
                <div className="ftop">
                  <div className="fav">{c.initials}</div>
                  <div>
                    <div className="fname">{c.name}</div>
                    <div className="fmeta">{c.meta}</div>
                  </div>
                  <span className={`fms ${c.ms}`}>{c.msl}</span>
                </div>
                <div
                  className="fbody"
                  dangerouslySetInnerHTML={{ __html: c.body }}
                />
                <div className="ftl">
                  {c.tl.map((t) => (
                    <div key={t.label} className="ftli">
                      <div
                        className={`ftld ${t.done ? "d" : "p"}`}
                      />
                      {t.label}
                    </div>
                  ))}
                </div>
                <div className="facts">
                  <button type="button" className="fabtn">
                    👍 Helpful ({c.helpful})
                  </button>
                  <button type="button" className="fabtn">
                    💬 Reply
                  </button>
                  <button type="button" className="fabtn">
                    🔖 Save
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section className={`pgsec ${tab === "st" ? "on" : ""}`}>
            <div className="mb-1 text-lg font-bold text-[var(--w)]">
              Processing statistics
            </div>
            <div className="s2col">
              <div className="card">
                <div className="chd">
                  <span className="ctit">Median days by stream</span>
                  <span className="ctag">last 90 days</span>
                </div>
                {(() => {
                  const maxD = Math.max(
                    ...cohort.stream_medians.map((s) => s.median),
                    1,
                  );
                  return cohort.stream_medians.map((s, i) => {
                    const isY = s.name
                      .toLowerCase()
                      .includes(profile.stream.toLowerCase().split(" ")[1] ?? "x");
                    return (
                      <div
                        key={s.name}
                        className="lrow"
                        style={
                          isY
                            ? {
                                borderColor: "rgba(192,57,43,0.3)",
                                background: "rgba(192,57,43,0.06)",
                              }
                            : undefined
                        }
                      >
                        <span className="lrank">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 text-xs text-[var(--t1)]">
                            {s.name}
                            {isY ? (
                              <span className="ml-1 text-[9px] font-semibold text-[var(--red)]">
                                YOU
                              </span>
                            ) : null}
                          </div>
                          <div className="h-1 overflow-hidden rounded-full bg-[var(--navy4)]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.round((s.median / maxD) * 100)}%`,
                                background: isY
                                  ? "var(--red)"
                                  : "rgba(143,163,184,.35)",
                              }}
                            />
                          </div>
                        </div>
                        <span className="lval">{s.median}d</span>
                      </div>
                    );
                  });
                })()}
              </div>
              <div className="card">
                <div className="chd">
                  <span className="ctit">WES verification</span>
                  <span className="ctag">community reported</span>
                </div>
                <table className="wt">
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Avg days</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WES_ROWS.flatMap((r) => [
                      <tr key={`${r.t}-row`}>
                        <td className="font-medium text-[var(--t1)]">{r.t}</td>
                        <td className="font-[family-name:var(--m)]">{r.d}</td>
                        <td>
                          <span
                            className={`wsb ${r.s === "ok" ? "ok" : r.s === "dl" ? "dl" : "pe"}`}
                          >
                            {r.s === "ok"
                              ? "Verified"
                              : r.s === "dl"
                                ? "Issue"
                                : "Pending"}
                          </span>
                        </td>
                      </tr>,
                      <tr key={`${r.t}-note`}>
                        <td
                          colSpan={3}
                          className="pb-1 pt-0 text-[10px] text-[var(--t3)]"
                        >
                          {r.n}
                        </td>
                      </tr>,
                    ])}
                  </tbody>
                </table>
              </div>
              <div className="card col-span-full">
                <div className="chd">
                  <span className="ctit">Weekly PPR pulse — Feb 2025 cohorts</span>
                  <span className="ctag">trend</span>
                </div>
                <div className="flex h-[78px] items-end gap-1.75 pt-1.75">
                  {(() => {
                    const vals = cohort.pulseWeekly;
                    const max = Math.max(...vals, 1);
                    return vals.map((v, i) => (
                      <div
                        key={i}
                        className="flex flex-1 flex-col items-center gap-1"
                        title={`Week ${i + 1}: ${v} PPRs`}
                      >
                        <div className="text-[9px] text-[var(--t3)]">{v}</div>
                        <div
                          className="w-full cursor-pointer rounded-t transition-colors"
                          style={{
                            height: `${Math.round((v / max) * 100)}%`,
                            minHeight: 4,
                            background:
                              i === vals.length - 1
                                ? "var(--red)"
                                : "rgba(192,57,43,.3)",
                          }}
                        />
                      </div>
                    ));
                  })()}
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] text-[var(--t3)]">
                  <span>Jan 27</span>
                  <span>Mar 31</span>
                </div>
              </div>
            </div>
          </section>

          <section className={`pgsec ${tab === "sh" ? "on" : ""}`}>
            <div className="mb-3.5 text-lg font-bold text-[var(--w)]">
              Share your timeline
            </div>
            <div className="sharewrap">
              <div className="sprev">
                <div className="spflag">🇨🇦</div>
                <div className="sptit">
                  {email.split("@")[0]}&apos;s PR Timeline
                </div>
                <div className="spsub">
                  {profile.stream} · {fmtDate(profile.aorDate) || "—"} AOR · Day{" "}
                  {days} of ~{median}
                </div>
                <div className="spstats">
                  <div>
                    <div className="spsv">{days}</div>
                    <div className="spsl">Days elapsed</div>
                  </div>
                  <div>
                    <div className="spsv red">{ppr?.p50Approx ?? "—"}</div>
                    <div className="spsl">Est. PPR</div>
                  </div>
                  <div>
                    <div className="spsv">{pct}%</div>
                    <div className="spsl">Journey done</div>
                  </div>
                </div>
              </div>
              <div className="urlbox">
                <input className="urltxt" readOnly value={shareUrl} />
                <button
                  type="button"
                  className="urlcopy"
                  onClick={() => {
                    void navigator.clipboard.writeText(shareUrl);
                    toast.show("Link copied to clipboard!");
                  }}
                >
                  Copy link
                </button>
              </div>
              <div className="shopts">
                <button
                  type="button"
                  className="shopt"
                  onClick={() => toast.show("WhatsApp deep link (placeholder)")}
                >
                  💬 WhatsApp
                </button>
                <button
                  type="button"
                  className="shopt"
                  onClick={() => toast.show("Reddit format (placeholder)")}
                >
                  📋 Reddit
                </button>
                <button
                  type="button"
                  className="shopt"
                  onClick={() => toast.show("PNG export (placeholder)")}
                >
                  🖼 Save image
                </button>
              </div>
            </div>
          </section>
        </main>

        <aside className="dr">
          <div className="rc">
            <div className="rct">Progress</div>
            <div className="rrw">
              <svg width="82" height="82" viewBox="0 0 82 82">
                <circle
                  cx="41"
                  cy="41"
                  r="33"
                  fill="none"
                  stroke="rgba(255,255,255,.06)"
                  strokeWidth="6"
                />
                <circle
                  cx="41"
                  cy="41"
                  r="33"
                  fill="none"
                  stroke="#c0392b"
                  strokeWidth="6"
                  strokeDasharray="207"
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1.2s ease" }}
                />
              </svg>
              <div className="rrtxt">
                <div className="rrdays">{days}</div>
                <div className="rrlbl">days</div>
              </div>
            </div>
            <div className="rrfoot">
              <div className="rrpct">{pct}% through</div>
              <div className="rrsub">Based on {median}d median</div>
            </div>
            <div className="ebox">
              <div className="elbl">Estimated PPR window</div>
              <div className="eval">{ppr?.windowLabel ?? "—"}</div>
              <div className="esub">
                Based on {cohort.n_verified} similar profiles · Updated{" "}
                {fmtDate(cohort.last_updated.slice(0, 10))}
              </div>
            </div>
          </div>
          <div className="rc">
            <div className="rct">Community insights</div>
            {INSIGHTS.map((i) => (
              <div key={i.txt} className="iitem">
                <div className={`idot ${i.t}`} />
                <div
                  className="itxt"
                  dangerouslySetInnerHTML={{ __html: i.txt }}
                />
              </div>
            ))}
          </div>
          <div className="rc">
            <div className="rct">Similar cohorts</div>
            {SIMILAR_COHORTS.map((s) => (
              <div
                key={s.label}
                className={`sitem ${s.on ? "on" : ""}`}
                role="presentation"
              >
                <div>
                  <div className="siname">{s.label}</div>
                  <div className="simeta">{s.meta}</div>
                </div>
                <span className="sidays">{s.days}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
