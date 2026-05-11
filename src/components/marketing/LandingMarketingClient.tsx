"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getLandingHomeAction } from "@/app/actions/landing";
import {
  IconArrowRight,
  IconCheck,
  IconGitHub,
  IconGlobe,
  IconHourglass,
  IconLandmark,
  IconLanguages,
  IconLaptop,
  IconMaple,
  IconMessage,
  IconPlus,
  IconStar,
  IconThumbsUp,
  IconWrench,
} from "@/components/marketing/landing-icons";

const GH = "https://github.com/Get-North-Path/AOR-tracker";

function fmtCompactK(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  const s = k >= 10 ? String(Math.round(k)) : k.toFixed(1).replace(/\.0$/, "");
  return `${s}k`;
}

export function LandingMarketingClient() {
  const [profileCount, setProfileCount] = useState<number | null>(null);
  const [medianSample, setMedianSample] = useState<number | null>(null);

  useEffect(() => {
    void getLandingHomeAction().then((d) => {
      setProfileCount(d.profileCount);
      setMedianSample(d.medianSample);
    });
  }, []);

  useEffect(() => {
    const sticky = document.getElementById("mkt-sticky");
    const onScroll = () => {
      if (!sticky) return;
      sticky.classList.toggle("show", window.scrollY > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("shown");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const countLabel =
    profileCount != null ? `${profileCount.toLocaleString()}+` : "Community";
  const subCount =
    profileCount != null
      ? profileCount.toLocaleString()
      : "thousands of";
  const medianLabel =
    medianSample != null ? `${Math.round(medianSample)}` : "—";
  const growthCurrent =
    profileCount != null ? profileCount.toLocaleString() : "—";

  return (
    <div className="mkt-landing-page">
      <section className="mkt-landing-hero">
        <IconMaple className="mkt-hero-watermark" size={160} />
        <div className="hero-inner">
          <div className="mkt-hero-copy mkt-hero-col">
            <div className="hero-breadcrumb">
              <a href="https://www.getnorthpath.com">GetNorthPath</a>
              <span>/</span>
              AORTrack
            </div>
            <div className="hero-eyebrow">
              <div className="hero-eyebrow-dot" aria-hidden />
              <span className="hero-eyebrow-text">Free · Open Source</span>
            </div>
            <h1 className="hero-h1">
              Know exactly where you stand in your <em>PR journey.</em>
            </h1>
            <p className="hero-sub">
              AORTrack uses real crowd-sourced data from {subCount} applicants to show
              your true processing position — not IRCC&apos;s generic 6–8 month estimate.
            </p>
            <div className="hero-actions">
              <Link href="/track" className="btn-hero btn-red">
                Track My Application <IconArrowRight />
              </Link>
              <a
                href={GH}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hero btn-outline mkt-btn-github-secondary"
              >
                <IconStar size={16} />
                Star on GitHub
              </a>
            </div>
            <div className="hero-trust">
              <span className="ht-item">
                <IconCheck size={14} strokeWidth={2.5} />
                No signup required
              </span>
              <span className="ht-item">
                <IconCheck size={14} strokeWidth={2.5} />
                100% free forever
              </span>
              <span className="ht-item">
                <IconCheck size={14} strokeWidth={2.5} />
                Community governed
              </span>
              <span className="ht-item">
                <IconCheck size={14} strokeWidth={2.5} />
                Verified submissions
              </span>
            </div>
          </div>

          <div className="mkt-hero-col mkt-hero-col--card">
            <div className="hero-card">
            <div className="hc-header">
              <div className="hc-title">CEC General — Your Position</div>
              <div className="hc-live">
                <div className="hc-live-dot" />
                Live
              </div>
            </div>
            <div className="hc-body">
              <div className="hc-stats">
                <div className="hc-stat">
                  <div className="hc-stat-val">{medianLabel}</div>
                  <div className="hc-stat-label">Avg Days</div>
                </div>
                <div className="hc-divider" />
                <div className="hc-stat">
                  <div className="hc-stat-val">72</div>
                  <div className="hc-stat-label">Days Elapsed</div>
                </div>
                <div className="hc-divider" />
                <div className="hc-stat">
                  <div className="hc-stat-val">1,240</div>
                  <div className="hc-stat-label">Cohort Size</div>
                </div>
              </div>
              <div className="hc-prog-label">
                <span className="hc-prog-key">Sample cohort progress</span>
                <span className="hc-prog-val">39%</span>
              </div>
              <div className="hc-bar">
                <div className="hc-bar-fill" />
              </div>
              <div className="hc-bar-note">
                Illustrative preview — start tracking for your real cohort.
              </div>
              <div className="hc-feed">
                <div className="hc-feed-row">
                  <div className="hc-dot d-green" />
                  <div className="hc-feed-text">
                    <strong>PPR received</strong> · sample timeline
                  </div>
                  <div className="hc-badge">CEC Gen</div>
                </div>
                <div className="hc-feed-row">
                  <div className="hc-dot d-blue" />
                  <div className="hc-feed-text">
                    <strong>BIL started</strong> · sample timeline
                  </div>
                  <div className="hc-badge">CEC STEM</div>
                </div>
                <div className="hc-feed-row">
                  <div className="hc-dot d-amber" />
                  <div className="hc-feed-text">
                    <strong>BGC started</strong> · sample timeline
                  </div>
                  <div className="hc-badge">CEC Gen</div>
                </div>
              </div>
              <Link href="/track" className="hc-cta">
                Start Tracking Free <IconArrowRight />
              </Link>
            </div>
          </div>
          </div>
        </div>
      </section>

      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-cell">
            <div className="stat-num">
              {profileCount != null ? fmtCompactK(profileCount) : "—"}
            </div>
            <div className="stat-desc">Active timelines tracked</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">
              {medianSample != null ? (
                <>
                  {medianLabel}
                  <span>d</span>
                </>
              ) : (
                "—"
              )}
            </div>
            <div className="stat-desc">Avg. sample stream wait</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">
              96<span>%</span>
            </div>
            <div className="stat-desc">Within prediction range</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">
              100<span>%</span>
            </div>
            <div className="stat-desc">Free &amp; open source</div>
          </div>
        </div>
      </div>

      <section className="hiw-section" id="how">
        <div className="hiw-inner">
          <p className="section-eye">How It Works</p>
          <h2 className="section-h2">Four steps to your real timeline.</h2>
          <p className="section-sub">
            No account needed. Your data is anonymised and contributes back to the
            community automatically.
          </p>
          <div className="hiw-steps">
            <div className="hiw-step active">
              <div className="hs-num">01</div>
              <div className="hs-title">Enter your AOR date</div>
              <div className="hs-body">
                Input your Acknowledgement of Receipt date and immigration stream. 30
                seconds — no account required.
              </div>
              <span className="hs-tag hs-free">Free · No account</span>
            </div>
            <div className="hiw-step">
              <div className="hs-num">02</div>
              <div className="hs-title">See your cohort</div>
              <div className="hs-body">
                Instantly compare your position against everyone who applied in the same
                month and stream.
              </div>
              <span className="hs-tag hs-free">Real data · Not IRCC averages</span>
            </div>
            <div className="hiw-step">
              <div className="hs-num">03</div>
              <div className="hs-title">Log your milestones</div>
              <div className="hs-body">
                Update BIL, BGC, medicals, and PPR as they happen. Each update improves
                accuracy for your cohort.
              </div>
              <span className="hs-tag hs-oss">Contributes to community</span>
            </div>
            <div className="hiw-step">
              <div className="hs-num">04</div>
              <div className="hs-title">Get community alerts</div>
              <div className="hs-body">
                WES delays, IRCC tracker bugs, and cohort anomalies — reported by real
                applicants.
              </div>
              <span className="hs-tag hs-oss">Open source</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="streams">
        <div className="inner">
          <p className="section-eye reveal">Immigration Streams</p>
          <h2 className="section-h2 reveal">Track any Canadian PR pathway.</h2>
          <p className="section-sub reveal">
            Community data across major Express Entry and provincial streams. Updated as
            applicants log milestones.
          </p>

          <div className="stream-grid">
            <Link href="/track" className="stream-card featured reveal">
              <div className="sc-head green-bg">
                <div>
                  <div className="sc-title">CEC General</div>
                  <div className="sc-sub">Canadian Experience Class</div>
                </div>
                <span className="sc-icon">
                  <IconMaple size={22} />
                </span>
              </div>
              <div className="sc-body">
                <div className="sc-avg">
                  <strong>{medianLabel !== "—" ? `${medianLabel}d` : "—"}</strong> sample
                  avg to PPR
                </div>
                <div className="sc-bar">
                  <div className="sc-bar-fill" style={{ width: "72%" }} />
                </div>
                <div className="sc-facts">
                  <div className="sc-fact">
                    <IconArrowRight size={11} />
                    Largest tracked Express Entry stream
                  </div>
                  <div className="sc-fact">
                    <IconArrowRight size={11} />
                    Cohort progress and P25–P75 windows
                  </div>
                  <div className="sc-fact">
                    <IconArrowRight size={11} />
                    Start free from the tracker
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/track" className="stream-card reveal">
              <div className="sc-head blue-bg">
                <div>
                  <div className="sc-title">CEC STEM</div>
                  <div className="sc-sub">Science, Tech, Engineering, Math</div>
                </div>
                <span className="sc-icon">
                  <IconLaptop size={22} />
                </span>
              </div>
              <div className="sc-body">
                <div className="sc-avg">
                  <strong>162d</strong> sample avg to PPR
                </div>
                <div className="sc-bar">
                  <div className="sc-bar-fill" style={{ width: "61%" }} />
                </div>
                <div className="sc-facts">
                  <div className="sc-fact">
                    <IconArrowRight size={11} />
                    Dedicated STEM cohort keys
                  </div>
                  <div className="sc-fact">
                    <IconArrowRight size={11} />
                    Often faster median than CEC General
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/track" className="stream-card reveal">
              <div className="sc-head navy-bg">
                <div>
                  <div className="sc-title">CEC French</div>
                  <div className="sc-sub">Francophone Priority</div>
                </div>
                <span className="sc-icon">
                  <IconLanguages size={22} />
                </span>
              </div>
              <div className="sc-body">
                <div className="sc-avg">
                  <strong>134d</strong> sample avg to PPR
                </div>
                <div className="sc-bar">
                  <div className="sc-bar-fill" style={{ width: "52%" }} />
                </div>
                <div className="sc-facts">
                  <div className="sc-fact">
                    <IconArrowRight size={11} />
                    Priority francophone streams
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/track" className="stream-card reveal">
              <div className="sc-head teal-bg">
                <div>
                  <div className="sc-title">FSW General</div>
                  <div className="sc-sub">Federal Skilled Worker</div>
                </div>
                <span className="sc-icon">
                  <IconGlobe size={22} />
                </span>
              </div>
              <div className="sc-body">
                <div className="sc-avg">
                  <strong>198d</strong> sample avg to PPR
                </div>
                <div className="sc-bar">
                  <div className="sc-bar-fill" style={{ width: "45%" }} />
                </div>
                <div className="sc-facts">
                  <div className="sc-fact">
                    <IconArrowRight size={11} />
                    Includes WES verification variability
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/track" className="stream-card reveal">
              <div className="sc-head amber-bg">
                <div>
                  <div className="sc-title">PNP</div>
                  <div className="sc-sub">Provincial Nominee Program</div>
                </div>
                <span className="sc-icon">
                  <IconLandmark size={22} />
                </span>
              </div>
              <div className="sc-body">
                <div className="sc-avg">
                  <strong>216d</strong> sample avg to PPR
                </div>
                <div className="sc-bar">
                  <div className="sc-bar-fill" style={{ width: "38%" }} />
                </div>
                <div className="sc-facts">
                  <div className="sc-fact">
                    <IconArrowRight size={11} />
                    Higher variance by province
                  </div>
                </div>
              </div>
            </Link>

            <div className="stream-add reveal">
              <div className="stream-add-icon">
                <IconPlus size={28} strokeWidth={2.2} />
              </div>
              <div
                style={{
                  fontFamily: "var(--fh)",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--navy)",
                  marginBottom: "0.4rem",
                }}
              >
                More streams coming
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--muted)",
                  marginBottom: "1.2rem",
                }}
              >
                FST, healthcare streams, AIP and more — request on GitHub
              </div>
              <a
                href={`${GH}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--blue)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                Request a stream <IconArrowRight />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="tl-section" id="timeline">
        <div className="tl-inner">
          <p className="section-eye" style={{ color: "rgba(255,255,255,.35)" }}>
            Milestone Tracking
          </p>
          <h2 className="section-h2 reveal" style={{ color: "#fff" }}>
            Your complete journey, <em style={{ fontStyle: "italic", color: "#4ade80" }}>one view.</em>
          </h2>
          <p className="section-sub reveal" style={{ color: "rgba(255,255,255,.5)" }}>
            Log each milestone as it happens. Estimates improve as your cohort shares real
            outcomes.
          </p>

          <div className="tl-grid">
            <div className="reveal">
              <div className="tl-item">
                <div className="tl-dot td-g">
                  <IconCheck size={15} strokeWidth={2.5} />
                </div>
                <div className="tl-bd">
                  <div className="tl-t">AOR Received</div>
                  <div className="tl-d">
                    Acknowledgement of Receipt — your application is in the queue.
                  </div>
                  <div className="tl-time">Example · Day 0</div>
                </div>
              </div>
              <div className="tl-item">
                <div className="tl-dot td-g">
                  <IconCheck size={15} strokeWidth={2.5} />
                </div>
                <div className="tl-bd">
                  <div className="tl-t">BIL — Background Initiated Letter</div>
                  <div className="tl-d">IRCC has begun background processing.</div>
                  <div className="tl-time">Example · Day 16</div>
                </div>
              </div>
              <div className="tl-item">
                <div className="tl-dot td-b">
                  <IconCheck size={15} strokeWidth={2.5} />
                </div>
                <div className="tl-bd">
                  <div className="tl-t">Biometrics Confirmed</div>
                  <div className="tl-d">Biometrics verified in the IRCC system.</div>
                  <div className="tl-time">Example · Day 30</div>
                </div>
              </div>
              <div className="tl-item">
                <div className="tl-dot td-a">
                  <IconHourglass size={15} strokeWidth={2} />
                </div>
                <div className="tl-bd">
                  <div className="tl-t">Background Check</div>
                  <div className="tl-d">Security and criminal checks underway.</div>
                  <span className="tl-est">Est. window from cohort data</span>
                </div>
              </div>
              <div className="tl-item" style={{ paddingBottom: 0 }}>
                <div className="tl-dot td-p">
                  <IconHourglass size={15} strokeWidth={2} />
                </div>
                <div className="tl-bd">
                  <div className="tl-t">PPR — Passport Request</div>
                  <div className="tl-d">Final step before COPR.</div>
                  <span className="tl-est">P25–P75 from your stream</span>
                </div>
              </div>
            </div>

            <div className="reveal">
              <div className="info-card" style={{ marginBottom: "1.2rem" }}>
                <div className="ic-label">Your cohort snapshot</div>
                <div className="ic-row">
                  <span className="ic-key">Median processing</span>
                  <span className="ic-val green">
                    {medianSample != null ? `${medianLabel} days` : "—"}
                  </span>
                </div>
                <div className="ic-row">
                  <span className="ic-key">Timelines in database</span>
                  <span className="ic-val">{growthCurrent}</span>
                </div>
                <div className="ic-row">
                  <span className="ic-key">Tracker</span>
                  <span className="ic-val">AORTrack</span>
                </div>
              </div>
              <div className="info-card">
                <div className="ic-label">Data quality</div>
                <div className="ic-row">
                  <span className="ic-key">Community first</span>
                  <span className="ic-val green">Open source</span>
                </div>
                <div className="ic-row">
                  <span className="ic-key">Privacy</span>
                  <span className="ic-val">Email-based return key</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="oss-section" id="feedback">
        <div className="oss-inner">
          <div className="reveal">
            <p className="section-eye">Open Source Community</p>
            <h2 className="section-h2">Your feedback shapes the roadmap.</h2>
            <p className="section-sub" style={{ marginBottom: "2rem" }}>
              File bugs, feature requests, or data corrections on GitHub — or follow the{" "}
              <Link href="/roadmap" style={{ color: "var(--blue)", fontWeight: 600 }}>
                public roadmap
              </Link>
              .
            </p>

            <div className="oss-feat">
              <div className="oss-ic">
                <IconMessage size={20} strokeWidth={1.8} />
              </div>
              <div>
                <div className="oss-ft">Transparent issues</div>
                <div className="oss-fb">
                  Everything is tracked in the open on GitHub with labels and discussion.
                </div>
              </div>
            </div>
            <div className="oss-feat">
              <div className="oss-ic">
                <IconThumbsUp size={20} strokeWidth={1.8} />
              </div>
              <div>
                <div className="oss-ft">Vote on priorities</div>
                <div className="oss-fb">
                  Community reactions help maintainers decide what ships next.
                </div>
              </div>
            </div>
            <div className="oss-feat">
              <div className="oss-ic">
                <IconWrench size={20} strokeWidth={1.8} />
              </div>
              <div>
                <div className="oss-ft">Contribute code</div>
                <div className="oss-fb">
                  Submit PRs against the MIT-licensed repo — no special access required.
                </div>
              </div>
            </div>

            <a
              href={`${GH}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-hero btn-red"
              style={{ marginTop: "0.5rem" }}
            >
              Open GitHub Issues <IconArrowRight />
            </a>
          </div>

          <div className="reveal">
            <div className="github-card">
              <div className="gh-bar">
                <div className="gh-repo">
                  <IconGitHub />
                  Get-North-Path / AOR-tracker
                </div>
                <div className="gh-meta">
                  <span className="mkt-inline-icon">
                    <IconStar size={12} />
                    Open
                  </span>
                  <span>MIT</span>
                </div>
              </div>
              <div className="gh-issue">
                <div className="gh-dot dot-open" />
                <div className="gh-info">
                  <div className="gh-it">Stream pages &amp; SEO improvements</div>
                  <div className="gh-im">Community roadmap · in progress</div>
                </div>
                <div className="gh-lbl l-feat">feature</div>
              </div>
              <div className="gh-issue">
                <div className="gh-dot dot-open" />
                <div className="gh-info">
                  <div className="gh-it">More provincial streams</div>
                  <div className="gh-im">Data &amp; cohort design</div>
                </div>
                <div className="gh-lbl l-data">data</div>
              </div>
              <a
                href={`${GH}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className="gh-more"
              >
                View all open issues on GitHub <IconArrowRight />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="growth-section">
        <div className="growth-inner">
          <p className="section-eye reveal" style={{ color: "rgba(255,255,255,.35)" }}>
            Community Growth
          </p>
          <h2 className="section-h2 reveal" style={{ color: "#fff" }}>
            Transparent targets. <em style={{ fontStyle: "italic", color: "#4ade80" }}>Public progress.</em>
          </h2>
          <p className="section-sub reveal" style={{ color: "rgba(255,255,255,.5)" }}>
            We build in the open — milestones and goals are shared with the community.
          </p>

          <div className="g-table reveal">
            <div className="gt-head">
              <div>Metric</div>
              <div>Month 1</div>
              <div>Month 3</div>
              <div className="gt-head-star">
                Month 6 <IconStar size={11} className="inline-block align-middle" />
              </div>
              <div>Current</div>
            </div>
            <div className="gt-row">
              <div className="gt-k">Active Timelines</div>
              <div className="gt-v">15,500</div>
              <div className="gt-v">19,000</div>
              <div className="gt-v goal">25,000</div>
              <div className="gt-v current">{growthCurrent}</div>
            </div>
            <div className="gt-row">
              <div className="gt-k">Open source velocity</div>
              <div className="gt-v">Steady</div>
              <div className="gt-v">Growing</div>
              <div className="gt-v goal">Surge</div>
              <div className="gt-v current">Live</div>
            </div>
            <div className="gt-row">
              <div className="gt-k">GitHub Stars</div>
              <div className="gt-v">—</div>
              <div className="gt-v">—</div>
              <div className="gt-v goal">1,500</div>
              <div className="gt-v current mkt-gt-star">
                <IconStar size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-inner">
          <div>
            <h2 className="cta-h2">Start tracking your PR application today. It&apos;s free.</h2>
            <p className="cta-sub">
              Join {countLabel} applicants using real community data — not IRCC&apos;s generic
              estimate.
            </p>
            <div className="cta-note">
              Need more than tracking?{" "}
              <a
                href="https://www.getnorthpath.com/contact?utm_source=aortrack"
                target="_blank"
                rel="noopener noreferrer"
              >
                Our consultants manage your full application from ITA to PPR <IconArrowRight />
              </a>
            </div>
          </div>
          <div className="cta-btns">
            <Link href="/track" className="btn-white">
              Track My AOR — Free <IconArrowRight />
            </Link>
            <a
              href={GH}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost-w mkt-btn-github-secondary"
            >
              <IconStar size={16} />
              Star on GitHub
            </a>
            <a
              href={`${GH}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost-w"
            >
              <IconMessage size={16} />
              Give Feedback
            </a>
          </div>
        </div>
      </section>

      <div className="sticky" id="mkt-sticky">
        <div>
          <div className="sticky-text">AORTrack — Free PR Tracker</div>
          <div className="sticky-sub">Join the community tracking real timelines</div>
        </div>
        <Link href="/track" className="btn-hero btn-red" style={{ fontSize: "0.84rem", padding: "10px 22px" }}>
          Track My AOR <IconArrowRight />
        </Link>
      </div>
    </div>
  );
}
