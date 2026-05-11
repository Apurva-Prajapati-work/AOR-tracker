"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconArrowDown,
  IconArrowRight,
  IconArrowUp,
  IconBolt,
  IconCalendar,
  IconChart,
  IconCheck,
  IconDashboard,
  IconEdit,
  IconGlobe,
  IconGraduation,
  IconMaple,
  IconMountain,
  IconTrophy,
} from "@/components/marketing/landing-icons";

const SCENES = 4;
const DURATION_MS = 4200;

const labels: { num: string; name: string; sub: string }[] = [
  { num: "View 1 of 4", name: "Live Community Feed", sub: "Real-time PPR reports from applicants" },
  { num: "View 2 of 4", name: "Personal Dashboard", sub: "Your cohort rank, days in queue & PPR probability" },
  { num: "View 3 of 4", name: "Submit Your AOR", sub: "Free · No account · Instant cohort placement" },
  { num: "View 4 of 4", name: "PPR Window Estimator", sub: "Earliest, median & latest PPR date" },
];

const tabs = [
  { label: "Live Feed", Icon: IconChart },
  { label: "Dashboard", Icon: IconDashboard },
  { label: "Submit AOR", Icon: IconEdit },
  { label: "PPR Timeline", Icon: IconCalendar },
] as const;

export function HeroAnimationClient() {
  const [scene, setScene] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  const startProg = useCallback(() => {
    const fill = fillRef.current;
    if (!fill) return;
    fill.style.transition = "none";
    fill.style.width = "0%";
    void fill.offsetWidth;
    fill.style.transition = `width ${DURATION_MS}ms linear`;
    fill.style.width = "100%";
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAuto = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      setScene((c) => (c >= SCENES ? 1 : c + 1));
    }, DURATION_MS);
  }, [clearTimer]);

  useEffect(() => {
    startProg();
  }, [scene, startProg]);

  useEffect(() => {
    startAuto();
    return () => clearTimer();
  }, [startAuto, clearTimer]);

  const onTab = (n: number) => {
    clearTimer();
    setScene(n);
    startAuto();
  };

  return (
    <div className="ha-hero" id="hero">
      <div className="grid-bg" />
      <div className="glow" />
        <IconMaple className="maple" />

      <div className="eyebrow">
        <span className="ey-dot" />
        14,800+ applicants tracked · Community powered
      </div>

      <h1 className="h1">
        Know exactly where
        <br />
        your <em>PR stands.</em>
      </h1>
      <p className="sub">
        Real processing timelines from real Express Entry applicants — not IRCC&apos;s generic
        estimates. Free, open-source, no signup required.
      </p>

      <div className="tabs" id="tabs">
        {tabs.map(({ label, Icon }, i) => (
            <button
              key={label}
              type="button"
              className={`tab ${scene === i + 1 ? "active" : ""}`}
              onClick={() => onTab(i + 1)}
            >
              <Icon size={12} />
              {label}
            </button>
        ))}
      </div>

      <div className="stage">
        <div className={`scene s1 ${scene === 1 ? "vis" : ""}`} id="scene-1">
          <div className="s1-head">
            <span className="s1h-title">Express Entry — Live Tracker</span>
            <span className="s1h-live">
              <span className="s1h-dot" />
              Updated 3 min ago
            </span>
          </div>
          <div className="s1-stats">
            <div className="s1-stat">
              <div className="s1-val">14,847</div>
              <div className="s1-lbl">Applicants</div>
            </div>
            <div className="s1-sep" />
            <div className="s1-stat">
              <div className="s1-val">247</div>
              <div className="s1-lbl">Avg Days</div>
            </div>
            <div className="s1-sep" />
            <div className="s1-stat">
              <div className="s1-val">68%</div>
              <div className="s1-lbl">PPR&apos;d</div>
            </div>
          </div>
          <div className="s1-bar-wrap">
            <div className="s1-bar-row">
              <span className="s1-bar-key">Applicants who received PPR</span>
              <span className="s1-bar-val">39.2%</span>
            </div>
            <div className="s1-track">
              <div className="s1-fill" />
            </div>
            <div className="s1-bar-note">Based on verified data points · illustrative demo</div>
          </div>
          <div className="s1-feed">
            <div className="s1-row">
              <div className="fd fd-g" />
              <div className="s1-txt">
                <strong>Ahmed R.</strong> received PPR — Day 198 · CEC
              </div>
              <span className="s1-badge">2 min ago</span>
            </div>
            <div className="s1-row">
              <div className="fd fd-b" />
              <div className="s1-txt">
                <strong>Priya S.</strong> submitted AOR — FSW
              </div>
              <span className="s1-badge">11 min ago</span>
            </div>
            <div className="s1-row">
              <div className="fd fd-a" />
              <div className="s1-txt">
                <strong>Wei C.</strong> medicals request — Day 143
              </div>
              <span className="s1-badge">24 min ago</span>
            </div>
          </div>
          <Link href="/track" className="s1-cta">
            Track Your AOR — Free <IconArrowRight />
          </Link>
        </div>

        <div className={`scene s2 ${scene === 2 ? "vis" : ""}`} id="scene-2">
          <div className="s2-nav">
            <div className="s2-logo">A</div>
            <span className="s2-brand">AORTrack</span>
            <div className="s2-sep" />
            <span className="s2-page">My Dashboard</span>
            <div className="s2-pill">
              <span className="s2-pdot" />
              Live
            </div>
          </div>
          <div className="s2-body">
            <div className="s2-top">
              <div className="days-box">
                <div className="days-n">247</div>
                <div className="days-lbl">Days since AOR</div>
              </div>
              <div className="stat-mini-grid">
                <div className="sm-card">
                  <div className="sm-lbl">Stream</div>
                  <div className="sm-val green" style={{ fontSize: "0.88rem", marginTop: "2px" }}>
                    CEC
                  </div>
                  <div className="sm-sub">Canadian Exp. Class</div>
                </div>
                <div className="sm-card">
                  <div className="sm-lbl">Cohort Rank</div>
                  <div className="sm-val amber">Top 28%</div>
                  <div className="sm-sub">of Jan &apos;24 cohort</div>
                </div>
                <div className="sm-card">
                  <div className="sm-lbl">Avg PPR Day</div>
                  <div className="sm-val">262</div>
                  <div className="sm-sub">
                    <IconArrowUp size={9} /> 4 days this week
                  </div>
                </div>
              </div>
            </div>
            <div className="cohort-card">
              <div className="cc-head">
                <span>Cohort Breakdown</span>
                <span style={{ fontFamily: "var(--fm)" }}>Jan 2024</span>
              </div>
              <div className="cc-row">
                <div className="cc-hd">
                  <span className="cc-name">Got PPR</span>
                  <span className="cc-stat">
                    <strong>5,812</strong> / 14,847
                  </span>
                </div>
                <div className="cc-track">
                  <div className="cc-fill cg" style={{ width: "39%" }} />
                </div>
              </div>
              <div className="cc-row">
                <div className="cc-hd">
                  <span className="cc-name">Medicals Requested</span>
                  <span className="cc-stat">
                    <strong>3,204</strong>
                  </span>
                </div>
                <div className="cc-track">
                  <div className="cc-fill cb" style={{ width: "22%" }} />
                </div>
              </div>
              <div className="cc-row">
                <div className="cc-hd">
                  <span className="cc-name">Still Waiting</span>
                  <span className="cc-stat">
                    <strong>5,831</strong>
                  </span>
                </div>
                <div className="cc-track">
                  <div className="cc-fill ca" style={{ width: "39%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`scene s3 ${scene === 3 ? "vis" : ""}`} id="scene-3">
          <div className="s3-head">
            <div className="s3-ico">
              <IconMaple size={15} />
            </div>
            <div>
              <div className="s3-title">Track My AOR</div>
              <div className="s3-sub">Enter your details — see your position instantly</div>
            </div>
          </div>
          <div className="s3-body">
            <div className="steps-row">
              <div className="sn done">
                <IconCheck size={11} />
              </div>
              <div className="s-line done" />
              <div className="sn active">2</div>
              <div className="s-line" />
              <div className="sn">3</div>
            </div>
            <div>
              <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--navy)", marginBottom: "7px" }}>
                Immigration Stream
              </div>
              <div className="ha-stream-grid">
                <div className="stream-opt sel">
                  <div className="so-icon">
                    <IconBolt />
                  </div>
                  <div className="so-name">CEC</div>
                  <div className="so-avg">Avg 241 days</div>
                </div>
                <div className="stream-opt">
                  <div className="so-icon">
                    <IconGlobe />
                  </div>
                  <div className="so-name">FSW</div>
                  <div className="so-avg">Avg 267 days</div>
                </div>
                <div className="stream-opt">
                  <div className="so-icon">
                    <IconGraduation />
                  </div>
                  <div className="so-name">FST</div>
                  <div className="so-avg">Avg 284 days</div>
                </div>
                <div className="stream-opt">
                  <div className="so-icon">
                    <IconMountain />
                  </div>
                  <div className="so-name">PNP</div>
                  <div className="so-avg">Avg 312 days</div>
                </div>
              </div>
            </div>
            <div className="f-row">
              <div className="f-field">
                <label>AOR Date</label>
                <input className="f-input filled" type="text" value="2024-01-08" readOnly />
              </div>
              <div className="f-field">
                <label>ITA Date</label>
                <input className="f-input" type="text" placeholder="YYYY-MM-DD" readOnly />
              </div>
            </div>
            <Link href="/track" className="s3-submit">
              Calculate My PPR Window <IconArrowRight />
            </Link>
          </div>
        </div>

        <div className={`scene s4 ${scene === 4 ? "vis" : ""}`} id="scene-4">
          <div className="s4-head">
            <span className="s4-title">Your PPR Window — CEC · Jan 2024</span>
            <span className="s4-badge">247 days in</span>
          </div>
          <div className="s4-ppr">
            <div className="s4-ppr-label">Estimated PPR window (based on your cohort)</div>
            <div className="s4-ppr-row">
              <div className="ppr-cell">
                <div className="ppr-val">Jun &apos;25</div>
                <div className="ppr-lbl">Earliest</div>
              </div>
              <div className="ppr-cell mid">
                <div className="ppr-val">Aug &apos;25</div>
                <div className="ppr-lbl">Most Likely</div>
              </div>
              <div className="ppr-cell">
                <div className="ppr-val">Nov &apos;25</div>
                <div className="ppr-lbl">Latest</div>
              </div>
            </div>
          </div>
          <div className="ha-tl-body">
            <div className="ha-tl-row">
              <div className="ha-tl-dot td-done">
                <IconCheck size={12} />
              </div>
              <div className="ha-tl-bd">
                <div className="ha-tl-name">ITA Received</div>
                <div className="ha-tl-desc">Invitation to Apply · Express Entry pool</div>
                <div className="ha-tl-date">Dec 14, 2023</div>
                <span className="badge-v">
                  <IconCheck size={9} /> Verified
                </span>
              </div>
            </div>
            <div className="ha-tl-row">
              <div className="ha-tl-dot td-done">
                <IconCheck size={12} />
              </div>
              <div className="ha-tl-bd">
                <div className="ha-tl-name">AOR Received</div>
                <div className="ha-tl-desc">Application received by IRCC</div>
                <div className="ha-tl-date">Jan 08, 2024</div>
                <span className="badge-v">
                  <IconCheck size={9} /> Confirmed
                </span>
              </div>
            </div>
            <div className="ha-tl-row">
              <div className="ha-tl-dot td-now">
                <IconArrowRight size={12} />
              </div>
              <div className="ha-tl-bd">
                <div className="ha-tl-name">Medicals / Biometrics</div>
                <div className="ha-tl-desc">Background checks in progress</div>
                <div
                  className="ha-tl-date"
                  style={{ color: "var(--muted)", fontStyle: "italic" }}
                >
                  In progress — Day 247
                </div>
                <span className="ha-tl-est">~4–6 weeks estimated</span>
              </div>
            </div>
            <div className="ha-tl-row">
              <div className="ha-tl-dot td-wait" style={{ borderColor: "var(--border)" }}>
                <IconTrophy size={12} />
              </div>
              <div className="ha-tl-bd">
                <div className="ha-tl-name">PPR — Passport Request</div>
                <div className="ha-tl-desc">Final step before PR approval</div>
                <div
                  className="ha-tl-date"
                  style={{ color: "var(--muted)", fontStyle: "italic" }}
                >
                  Pending
                </div>
                <span className="ha-tl-est">Est. Aug – Nov 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="scene-label" id="sceneLabel">
        {labels.map((l, i) => (
          <div key={l.num} className={`sl-wrap ${scene === i + 1 ? "vis" : ""}`} id={`label-${i + 1}`}>
            <span className="sl-num">{l.num}</span>
            <span className="sl-name">{l.name}</span>
            <span className="sl-sub">{l.sub}</span>
          </div>
        ))}
      </div>

      <div className="cta-row">
        <Link href="/track" className="btn-red">
          Track My AOR Free <IconArrowRight />
        </Link>
        <Link href="/" className="btn-outline">
          View home <IconArrowDown />
        </Link>
      </div>

      <div className="trust-row">
        <span className="trust-item">
          <IconCheck size={11} /> No signup required
        </span>
        <span className="trust-item">
          <IconCheck size={11} /> Open source
        </span>
        <span className="trust-item">
          <IconCheck size={11} /> 14,847 data points
        </span>
        <span className="trust-item">
          <IconCheck size={11} /> Updated daily
        </span>
      </div>

      <div className="prog-bar">
        <div className="pb-fill" ref={fillRef} id="pbFill" />
      </div>
    </div>
  );
}
