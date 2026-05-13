"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { useDashboardNewUi } from "./DashboardNewContext";
import {
  DN_NO_EMAIL_WARN,
  DN_PROFILE,
  DN_SIDEBAR,
} from "./data";
import {
  IconAlerts,
  IconCohort,
  IconEmail,
  IconFeed,
  IconHome,
  IconOverview,
  IconPlus,
  IconShare,
  IconStats,
  IconTimeline,
  IconTrash,
  IconWarn,
} from "./dashboard-icons";

type IconKey =
  | "overview"
  | "timeline"
  | "cohort"
  | "alerts"
  | "feed"
  | "stats"
  | "plus"
  | "share"
  | "email"
  | "trash";

const ICONS: Record<IconKey, ComponentType<{ "aria-hidden"?: boolean }>> = {
  overview: IconOverview,
  timeline: IconTimeline,
  cohort: IconCohort,
  alerts: IconAlerts,
  feed: IconFeed,
  stats: IconStats,
  plus: IconPlus,
  share: IconShare,
  email: IconEmail,
  trash: IconTrash,
};

type SidebarItem = {
  key: string;
  label: string;
  icon: IconKey;
  href?: string;
  active?: boolean;
  badge?: string;
  badgeTone?: "red";
  kind?: "danger";
};

function SidebarRow({
  item,
  onConfirmDelete,
}: {
  item: SidebarItem;
  onConfirmDelete: () => void;
}) {
  const Icon = ICONS[item.icon];
  const cls = [
    "dsb-link",
    item.active ? "on" : "",
    item.kind === "danger" ? "danger" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const body = (
    <>
      <Icon aria-hidden />
      {item.label}
      {item.badge ? (
        <span
          className={`dsb-badge${item.badgeTone === "red" ? " red" : ""}`}
        >
          {item.badge}
        </span>
      ) : null}
    </>
  );

  if (item.kind === "danger") {
    return (
      <button type="button" className={cls} onClick={onConfirmDelete}>
        {body}
      </button>
    );
  }

  if (item.href?.startsWith("#")) {
    return (
      <a href={item.href} className={cls}>
        {body}
      </a>
    );
  }

  return (
    <Link href={item.href ?? "#"} className={cls}>
      {body}
    </Link>
  );
}

/**
 * Left-rail sidebar.
 *
 * Sample reference: <aside class="sidebar">.
 *
 * Differences from the sample:
 *   - Iconography uses react-icons instead of inline SVGs/emojis.
 *   - A "Share" section is added (per spec) — the production `/dashboard`
 *     sidebar exposes a Share link, so the new design mirrors it. Section
 *     items are populated from `DN_SIDEBAR.share` in `data.ts`.
 *   - The icon next to the type label uses `IconHome` instead of 🏠.
 *
 * TODO(dashboard-new): make the "Add Email" item disappear when the user
 * already has an email on their profile, and badge it red otherwise.
 */
export function DashboardSidebar() {
  const { showToast } = useDashboardNewUi();

  const handleConfirmDelete = () => {
    const ok = window.confirm(
      "Delete all your AORTrack data permanently?\n\nThis removes:\n• AOR date and stream\n• All milestone dates\n• Community submissions\n• Shareable profile\n\nThis cannot be undone.",
    );
    if (!ok) return;
    // TODO(dashboard-new): wire `deleteProfileAction(email)` once we share
    // state with `/dashboard`.
    showToast("Deletion requested — you will receive a confirmation email");
  };

  return (
    <aside className="dsb" aria-label="Dashboard sidebar">
      <div className="dsb-card">
        <div className="dsb-id">Applicant {DN_PROFILE.applicantId}</div>
        <div className="dsb-stream">{DN_PROFILE.stream}</div>
        <div className="dsb-type">
          <IconHome aria-hidden />
          {DN_PROFILE.typeLabel} · {DN_PROFILE.province}
        </div>
        <div className="dsb-aor">
          <span>AOR Date</span>
          <span>{DN_PROFILE.aorDateLabel}</span>
        </div>
      </div>

      <div className="dsb-warn" role="note">
        <IconWarn aria-hidden />
        <span>
          {DN_NO_EMAIL_WARN.body}{" "}
          <Link href={DN_NO_EMAIL_WARN.linkHref}>
            {DN_NO_EMAIL_WARN.linkLabel}
          </Link>{" "}
          {DN_NO_EMAIL_WARN.trailing}
        </span>
      </div>

      <div className="dsb-sec">
        <div className="dsb-lbl">Dashboard</div>
        {DN_SIDEBAR.dashboard.map((it) => (
          <SidebarRow
            key={it.key}
            item={it as SidebarItem}
            onConfirmDelete={handleConfirmDelete}
          />
        ))}
      </div>

      <div className="dsb-div" aria-hidden />

      <div className="dsb-sec">
        <div className="dsb-lbl">Community</div>
        {DN_SIDEBAR.community.map((it) => (
          <SidebarRow
            key={it.key}
            item={it as SidebarItem}
            onConfirmDelete={handleConfirmDelete}
          />
        ))}
      </div>

      <div className="dsb-div" aria-hidden />

      {/* Share section — present in current `/dashboard` sidebar; restored
          on the new design per spec. */}
      <div className="dsb-sec">
        <div className="dsb-lbl">Share</div>
        {DN_SIDEBAR.share.map((it) => (
          <SidebarRow
            key={it.key}
            item={it as SidebarItem}
            onConfirmDelete={handleConfirmDelete}
          />
        ))}
      </div>

      <div className="dsb-div" aria-hidden />

      <div className="dsb-sec">
        <div className="dsb-lbl">Profile</div>
        {DN_SIDEBAR.profile.map((it) => (
          <SidebarRow
            key={it.key}
            item={it as SidebarItem}
            onConfirmDelete={handleConfirmDelete}
          />
        ))}
      </div>
    </aside>
  );
}
