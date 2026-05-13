"use client";

import { useState } from "react";
import {
  DN_TIMELINE,
  DN_TIMELINE_NOTE,
  type DnTimelineBadge,
  type DnTimelineRow,
} from "./data";
import { useDashboardNewUi } from "./DashboardNewContext";
import {
  IconCheck,
  IconCheckCircle,
  IconEdit,
  IconInfo,
  IconPlus,
  IconSync,
} from "./dashboard-icons";

const DOT_GLYPHS = {
  done: <IconCheck aria-hidden />,
  now: <IconSync aria-hidden />,
  wait: <IconPlus aria-hidden />,
  final: <IconCheckCircle aria-hidden />,
} as const;

function Badge({ badge }: { badge: DnTimelineBadge }) {
  if (badge.kind === "verified") {
    return (
      <div className="badge-v">
        <IconCheck aria-hidden />
        {badge.label}
      </div>
    );
  }
  if (badge.kind === "pending") {
    return (
      <div className="badge-p">
        <IconSync aria-hidden />
        {badge.label}
      </div>
    );
  }
  return <div className="tl-est">{badge.label}</div>;
}

function TimelineRow({ row }: { row: DnTimelineRow }) {
  const { openEditKey, toggleEdit, showToast } = useDashboardNewUi();
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState(row.edit?.initial ?? "");

  const open = openEditKey === row.key;

  const onSave = () => {
    if (!value) {
      toggleEdit(row.key);
      return;
    }
    setSaving(true);
    // TODO(dashboard-new): replace this fake delay with
    // `updateMilestoneAction(email, row.key, value)`.
    window.setTimeout(() => {
      setSaving(false);
      toggleEdit(row.key);
      showToast("Milestone updated · Submitted for Gemini review");
    }, 1200);
  };

  return (
    <div className="tl-row">
      <div className="tl-spine" aria-hidden />
      <div className={`tl-dot ${row.state}`}>{DOT_GLYPHS[row.state]}</div>
      <div className="tl-body">
        <div className="tl-top">
          <div>
            <div className="tl-name">{row.name}</div>
            <div className="tl-desc">{row.desc}</div>
            {row.badge ? <Badge badge={row.badge} /> : null}
          </div>
          <div className="tl-r">
            {row.date ? (
              <>
                <div className="tl-date">{row.date.date}</div>
                <div className="tl-day">{row.date.day}</div>
                {row.edit ? (
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => toggleEdit(row.key)}
                  >
                    <IconEdit aria-hidden />
                    {row.edit.label}
                  </button>
                ) : null}
              </>
            ) : row.pending ? (
              <>
                <div className="tl-pend">Not yet</div>
                {row.edit ? (
                  <button
                    type="button"
                    className="edit-btn"
                    style={{ marginTop: 5 }}
                    onClick={() => toggleEdit(row.key)}
                  >
                    <IconPlus aria-hidden />
                    {row.edit.label}
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        {row.edit ? (
          <div className={`edit-panel${open ? " open" : ""}`}>
            <label className="ep-label">{row.edit.fieldLabel}</label>
            <input
              className="ep-input"
              type="date"
              value={value}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setValue(e.target.value)}
            />
            <div className="ep-btns">
              <button
                type="button"
                className="ep-save"
                onClick={onSave}
                disabled={saving}
              >
                {saving ? "Saving…" : row.edit.saveLabel ?? "Save"}
              </button>
              <button
                type="button"
                className="ep-cancel"
                onClick={() => toggleEdit(row.key)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Milestone Timeline (Section: `tl-sec`).
 *
 * Sample reference: `.timeline` block in `aortrack-dashboard.html`.
 *
 * Each row can be:
 *   - `done`:  a green dot + verified/pending badge + concrete date
 *   - `now`:   a pulsing blue dot + an estimate badge + "+ Add date" affordance
 *   - `wait`:  a grey dot + estimate + "+ Add date"
 *   - `final`: the PPR row (no edit, just estimate + "Not yet")
 *
 * TODO(dashboard-new): replace `DN_TIMELINE` with the merge of
 * `MILESTONE_DEFS` and the user's `profile.milestones` (see
 * `DashboardTimelineTab.tsx` for the production version).
 */
export function DashboardTimeline() {
  return (
    <section id="tl-sec">
      <div className="sec-head">
        <div>
          <div className="sec-title">My Milestone Timeline</div>
          <div className="sec-sub">
            Hover any row to edit your date — updates are Gemini-verified before
            contributing to community stats
          </div>
        </div>
        <button
          type="button"
          className="sec-btn"
          onClick={() => {
            const target = document.getElementById("ep-bgc-anchor");
            target?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        >
          + Add BGC date
        </button>
      </div>

      <div className="timeline" id="ep-bgc-anchor">
        {DN_TIMELINE.map((row) => (
          <TimelineRow key={row.key} row={row} />
        ))}
      </div>

      <div className="data-note">
        <IconInfo aria-hidden />
        {DN_TIMELINE_NOTE}
      </div>
    </section>
  );
}
