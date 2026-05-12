"use client";

import Link from "next/link";
import {
  FaCommentAlt,
  FaInbox,
  FaPlus,
  FaRegBookmark,
  FaUserFriends,
} from "react-icons/fa";
import { MilestoneIcon } from "./community-icons";
import { useCommunityUi } from "./CommunityUiContext";
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
}: {
  link: SidebarLink;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  const className = `lsb-link${link.active ? " on" : ""}`;
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
 * + quick actions.
 *
 * TODO(real-data): the cohort mini-card needs the signed-in user's profile.
 *   Use the existing `getProfileAction()` (see @/app/actions/profile) and
 *   compute the day count via @/lib/cohort-data utilities. The browse and
 *   milestone counts should be cohort-scoped queries.
 */
export function CommunityLeftSidebar({
  cohortMini,
  browseLinks,
  milestoneLinks,
  quickLinks,
}: Props) {
  const { openSubmit } = useCommunityUi();

  return (
    <aside className="left-sb" aria-label="Community filters">
      <div className="lsb-sec">
        <div className="lsb-label">My Profile</div>
        <CohortMiniCard data={cohortMini} />
      </div>

      <div className="lsb-sec">
        <div className="lsb-label">Browse</div>
        {browseLinks.map((link) => (
          <SidebarItem link={link} icon={BROWSE_ICON[link.id]} key={link.id} />
        ))}
      </div>

      <div className="lsb-divider" />

      <div className="lsb-sec">
        <div className="lsb-label">Milestones</div>
        {milestoneLinks.map((link) => (
          <SidebarItem
            link={link}
            icon={<MilestoneIcon milestone={link.id} />}
            key={link.id}
          />
        ))}
      </div>

      <div className="lsb-divider" />

      <div className="lsb-sec">
        <div className="lsb-label">Quick</div>
        {quickLinks.map((link) => (
          <SidebarItem
            link={link}
            icon={QUICK_ICON[link.id]}
            key={link.id}
            onClick={link.id === "submit" ? openSubmit : undefined}
          />
        ))}
      </div>
    </aside>
  );
}
