"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { getProfileAction, saveProfileAction, updateMilestoneAction } from "@/app/actions/profile";
import { useToast } from "@/components/ToastContext";
import { PROVINCES, STREAM_OPTIONS } from "@/lib/constants";
import type { ProfileCompleteness } from "@/lib/profile-completeness";
import type { MilestoneKey, UserProfile } from "@/lib/types";

type Props = {
  email: string;
  profile: UserProfile;
  completeness: ProfileCompleteness;
  onProfileUpdated: (next: UserProfile) => void;
};

const inputClass =
  "w-full max-w-[220px] rounded-md border border-[var(--border)] bg-[var(--navy3)] px-2.5 py-1.5 text-[12px] text-[var(--t1)] outline-none focus:border-[var(--red)]";
const btnPrimary =
  "shrink-0 rounded-md bg-[var(--red)] px-3 py-1.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40";

export function ProfileCompletenessCard({
  email,
  profile,
  completeness,
  onProfileUpdated,
}: Props) {
  const toast = useToast();
  const [savingDetails, setSavingDetails] = useState(false);
  const [milestoneSaving, setMilestoneSaving] = useState<MilestoneKey | null>(
    null,
  );

  const requiredFields = useMemo(
    () => completeness.remaining.filter((r) => r.priority === "required"),
    [completeness.remaining],
  );
  const optionalFields = useMemo(
    () => completeness.remaining.filter((r) => r.priority === "optional"),
    [completeness.remaining],
  );

  const [draft, setDraft] = useState(() => ({
    aorDate: profile.aorDate,
    stream: profile.stream,
    type: profile.type,
    province: profile.province,
  }));

  const saveApplicationDetails = useCallback(async () => {
    setSavingDetails(true);
    try {
      const next: UserProfile = {
        ...profile,
        aorDate: draft.aorDate.trim(),
        stream: draft.stream.trim(),
        type: draft.type.trim(),
        province: draft.province.trim(),
      };
      if (!next.aorDate) {
        toast.show("AOR date is required");
        return;
      }
      if (!next.stream || !next.type || !next.province) {
        toast.show("Please fill stream, type, and province");
        return;
      }
      const res = await saveProfileAction(next);
      if (!res.ok) {
        toast.show(res.error ?? "Could not save");
        return;
      }
      const p = await getProfileAction(email);
      if (p.ok) {
        onProfileUpdated(p.profile);
        toast.show("Application details saved");
      }
    } finally {
      setSavingDetails(false);
    }
  }, [draft, email, onProfileUpdated, profile, toast]);

  const saveMilestoneDate = useCallback(
    async (key: MilestoneKey, date: string) => {
      if (!date) {
        toast.show("Pick a date first");
        return;
      }
      setMilestoneSaving(key);
      try {
        const res = await updateMilestoneAction(email, key, date);
        if (!res.ok) {
          toast.show(res.error ?? "Could not save");
          return;
        }
        if (res.profile) {
          onProfileUpdated(res.profile);
          toast.show("Milestone saved");
        }
      } finally {
        setMilestoneSaving(null);
      }
    },
    [email, onProfileUpdated, toast],
  );

  if (completeness.remaining.length === 0) return null;

  return (
    <div className="card mb-4 border border-[rgba(192,57,43,0.25)] bg-[rgba(192,57,43,0.06)]">
      <div className="chd">
        <span className="ctit">Complete your profile</span>
        <span className="ctag">
          {completeness.percent}% ·{" "}
          {completeness.requiredRemaining > 0
            ? `${completeness.requiredRemaining} required`
            : "Required fields done"}{" "}
          · {completeness.optionalRemaining} optional
        </span>
      </div>
      <p className="mb-3 text-[11px] text-[var(--t2)]">
        {completeness.requiredRemaining > 0
          ? "Fill in the fields below and save. Milestone dates can be added here or in the timeline."
          : "Add dates for steps you have already completed."}
      </p>

      {requiredFields.length > 0 ? (
        <div className="mb-4 space-y-3 rounded-lg border border-[var(--border)] bg-[var(--navy2)] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--t3)]">
            Application details
          </div>
          {requiredFields.some((r) => r.field === "aorDate") ? (
            <label className="block text-[11px] text-[var(--t2)]">
              <span className="mb-1 block font-medium text-[var(--t1)]">
                AOR date
              </span>
              <input
                type="date"
                className={inputClass}
                value={draft.aorDate}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, aorDate: e.target.value }))
                }
              />
            </label>
          ) : null}
          {requiredFields.some((r) => r.field === "stream") ? (
            <label className="block text-[11px] text-[var(--t2)]">
              <span className="mb-1 block font-medium text-[var(--t1)]">
                Stream
              </span>
              <select
                className={inputClass}
                value={draft.stream}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, stream: e.target.value }))
                }
              >
                {STREAM_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {requiredFields.some((r) => r.field === "type") ? (
            <div className="text-[11px] text-[var(--t2)]">
              <span className="mb-1 block font-medium text-[var(--t1)]">
                Inland / Outland
              </span>
              <div className="flex flex-wrap gap-2">
                {(["Inland", "Outland"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                      draft.type === t
                        ? "border-[var(--red)] bg-[rgba(192,57,43,0.15)] text-[var(--w)]"
                        : "border-[var(--border)] bg-[var(--navy3)] text-[var(--t2)] hover:border-[var(--t3)]"
                    }`}
                    onClick={() => setDraft((d) => ({ ...d, type: t }))}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {requiredFields.some((r) => r.field === "province") ? (
            <label className="block text-[11px] text-[var(--t2)]">
              <span className="mb-1 block font-medium text-[var(--t1)]">
                Province
              </span>
              <select
                className={inputClass}
                value={draft.province}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, province: e.target.value }))
                }
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              className={btnPrimary}
              disabled={savingDetails}
              onClick={() => void saveApplicationDetails()}
            >
              {savingDetails ? "Saving…" : "Save application details"}
            </button>
            <Link
              href="/onboarding"
              className="text-[11px] font-medium text-[var(--t3)] underline hover:text-[var(--t1)]"
            >
              Full onboarding form
            </Link>
          </div>
        </div>
      ) : null}

      {optionalFields.length > 0 ? (
        <ul className="m-0 list-none space-y-2 p-0">
          {optionalFields.map((r) => {
            if (r.field !== "milestone") return null;
            const key = r.milestoneKey;
            return (
              <li
                key={r.id}
                id={`complete-milestone-${key}`}
                className="flex flex-col gap-2 rounded-md border border-[var(--border)] bg-[var(--navy2)] px-3 py-2.5 sm:flex-row sm:items-end sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-semibold text-[var(--t1)]">
                    {r.label}
                    <span className="ml-1.5 text-[9px] font-normal uppercase text-[var(--t3)]">
                      optional
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-[var(--t3)]">{r.hint}</p>
                  <MilestoneDateRow
                    busy={milestoneSaving === key}
                    onSave={(date) => void saveMilestoneDate(key, date)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function MilestoneDateRow({
  busy,
  onSave,
}: {
  busy: boolean;
  onSave: (date: string) => void;
}) {
  const [val, setVal] = useState("");

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <input
        type="date"
        className={`${inputClass} max-w-[160px]`}
        value={val}
        disabled={busy}
        onChange={(e) => setVal(e.target.value)}
      />
      <button
        type="button"
        className={btnPrimary}
        disabled={busy || !val}
        onClick={() => {
          onSave(val);
          setVal("");
        }}
      >
        {busy ? "Saving…" : "Save date"}
      </button>
    </div>
  );
}
