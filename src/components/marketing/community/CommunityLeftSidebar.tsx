"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaCommentAlt,
  FaInbox,
  FaPlus,
  FaRegBookmark,
  FaUserFriends,
} from "react-icons/fa";
import { getProfileAction } from "@/app/actions/profile";
import { daysSinceAor } from "@/lib/ppr-estimate";
import type { UserProfile } from "@/lib/types";
import { MilestoneIcon } from "./community-icons";
import { useCommunityUi, type CommunityMsFilter } from "./CommunityUiContext";
import type { CohortMini, SidebarLink } from "./data";

type Props = {
  cohortMini: CohortMini;
  browseLinks: SidebarLink[];
  milestoneLinks: SidebarLink[];
  quickLinks: SidebarLink[];
};

/** Icon map for the static "Browse" group. */
const BROWSE_ICON: Record<string, React.ReactNode> = {
  all: <FaInbox aria-hidden />,
  "my-cohort": <FaUserFriends aria-hidden />,
  saved: <FaRegBookmark aria-hidden />,
};

const QUICK_ICON: Record<string, React.ReactNode> = {
  submit: <FaPlus aria-hidden />,
  feedback: <FaCommentAlt aria-hidden />,
};

const MS_LINK_TO_FILTER: Record<string, CommunityMsFilter> = {
  ppr: "ppr",
  bil: "bil",
  bgc: "bgc",
  medical: "medical",
};

/** Convert "2026-02-14" to "Feb 2026" without tripping over timezones. */
function formatAorMonth(aorDate: string): string {
  if (!aorDate) return "";
  const d = new Date(`${aorDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return aorDate;
  return d.toLocaleDateString("en-CA", { month: "short", year: "numeric" });
}

function buildCohortMiniFromProfile(p: UserProfile): CohortMini {
  const submissions = Object.values(p.milestones ?? {}).filter(
    (m) => m && m.date,
  ).length;
  return {
    label: "My Profile",
    rows: [
      { key: "Stream", value: p.stream || "—", emphasis: "green" },
      { key: "AOR Month", value: formatAorMonth(p.aorDate) || "—" },
      {
        key: "Day",
        value: p.aorDate ? String(daysSinceAor(p.aorDate)) : "—",
        emphasis: "green",
      },
      { key: "Submissions", value: String(submissions) },
    ],
  };
}

function CohortMiniCard({ data }: { data: CohortMini }) {
  return (
    <div className="cohort-mini">
      <div className="cm-label">{data.label}</div>
      {data.rows.map((row) => (
        <div className="cm-row" key={row.key}>
          <div className="cm-key">{row.key}</div>
          <div className={`cm-val${row.emphasis ? ` text-[#4ade80]!` : ""}`}>
            {row.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function SidebarItem({
  link,
  icon,
  onClick,
  active,
}: {
  link: SidebarLink;
  icon?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  const className = `lsb-link${active ?? link.active ? " on" : ""}`;
  const inner = (
    <>
      {icon}
      <span>{link.label}</span>
      {link.badge ? <span className="lsb-badge">{link.badge}</span> : null}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {inner}
      </button>
    );
  }
  if (link.href) {
    return (
      <Link href={link.href} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={className}>
      {inner}
    </button>
  );
}

/**
 * Sticky left rail: viewer's cohort mini-card + browse / milestone filters
 * + quick actions. Real backend data when a profile is loaded; seeded
 * fallback for anonymous viewers.
 *
 * TODO(real-data, scope-deferred):
 *   - `my-cohort` and `saved` Browse links: backend doesn't yet support
 *     a `cohortKey` filter on `getCommunityFeedAction`, and "saved" is
 *     local-only (localStorage). For now they're inert + emit a toast.
 *   - "Active Session" / online-presence stat: no presence channel yet.
 */
export function CommunityLeftSidebar({
  cohortMini,
  browseLinks,
  milestoneLinks,
  quickLinks,
}: Props) {
  const {
    viewerEmail,
    isSignedIn,
    msFilter,
    setMsFilter,
    requestPost,
    toast,
  } = useCommunityUi();

  const [profileMini, setProfileMini] = useState<CohortMini | null>(null);

  useEffect(() => {
    if (!viewerEmail || !isSignedIn) {
      setProfileMini(null);
      return;
    }
    let cancelled = false;
    void getProfileAction(viewerEmail).then((res) => {
      if (cancelled) return;
      if (res.ok) setProfileMini(buildCohortMiniFromProfile(res.profile));
    });
    return () => {
      cancelled = true;
    };
  }, [viewerEmail, isSignedIn]);

  const miniToRender = profileMini ?? cohortMini;

  return (
    <aside className="left-sb" aria-label="Community filters">
      <div className="lsb-sec">
        <div className="lsb-label">My Profile</div>
        <CohortMiniCard data={miniToRender} />
      </div>

      <div className="lsb-sec">
        <div className="lsb-label">Browse</div>
        {browseLinks.map((link) => {
          if (link.id === "all") {
            return (
              <SidebarItem
                link={link}
                icon={BROWSE_ICON[link.id]}
                key={link.id}
                active={msFilter === null}
                onClick={() => setMsFilter(null)}
              />
            );
          }
          return (
            <SidebarItem
              link={link}
              icon={BROWSE_ICON[link.id]}
              key={link.id}
              onClick={() =>
                toast(
                  "Coming soon — cohort-only and saved filters need a backend pass.",
                  "default",
                )
              }
            />
          );
        })}
      </div>

      <div className="lsb-divider" />

      <div className="lsb-sec">
        <div className="lsb-label">Milestones</div>
        {milestoneLinks.map((link) => {
          const ms = MS_LINK_TO_FILTER[link.id] ?? null;
          return (
            <SidebarItem
              link={link}
              icon={<MilestoneIcon milestone={link.id} />}
              key={link.id}
              active={ms !== null && ms === msFilter}
              onClick={() => setMsFilter(ms)}
            />
          );
        })}
      </div>

      <div className="lsb-divider" />

      <div className="lsb-sec">
        <div className="lsb-label">Quick</div>
        {quickLinks.map((link) => (
          <SidebarItem
            link={link}
            icon={QUICK_ICON[link.id]}
            key={link.id}
            onClick={link.id === "submit" ? requestPost : undefined}
          />
        ))}
      </div>
    </aside>
  );
}
