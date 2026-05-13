"use client";

import Link from "next/link";
import { DN_PROFILE } from "./data";
import { IconPlus, IconUpload } from "./dashboard-icons";

/**
 * Sticky dark app-bar that sits at the top of the dashboard-new page.
 *
 * Sample reference: <nav class="nav"> in `aortrack-dashboard.html`.
 *
 * The left side shows the AORTrack logo + applicant id; the right side
 * shows the cohort live-pill and two CTAs (Share, + Log Milestone) that
 * scroll to the relevant on-page section.
 */
export function DashboardAppBar() {
  const scrollTo = (id: string) => {
    const el =
      typeof document !== "undefined"
        ? document.getElementById(id)
        : null;
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="dnb" aria-label="Dashboard navigation">
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
        <div className="dnb-page">Dashboard · {DN_PROFILE.applicantId}</div>
      </div>

      <div className="dnb-r">
        <div className="dnb-pill" title="Live cohort view">
          <span className="dnb-dot" aria-hidden />
          {DN_PROFILE.cohortLabel}
        </div>
        <button
          type="button"
          className="dnb-btn"
          onClick={() => scrollTo("share-sec")}
        >
          <IconUpload aria-hidden />
          Share
        </button>
        <button
          type="button"
          className="dnb-btn red"
          onClick={() => scrollTo("tl-sec")}
        >
          <IconPlus aria-hidden />
          Log Milestone
        </button>
      </div>
    </nav>
  );
}
