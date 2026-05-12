"use client";

import { useEffect, useId, useRef, useState } from "react";
import { IconArrowRight } from "../landing-icons";
import { IconClose } from "./community-icons";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onValidationFail: (msg: string) => void;
};

// Native <option> elements can't render React icons, so labels are text
// only. The visual icon for the chosen milestone shows up on the resulting
// feed card via `MilestoneIcon`.
const MILESTONE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Select milestone…" },
  { value: "ppr", label: "PPR Received" },
  { value: "bil", label: "BIL Received" },
  { value: "bgc", label: "Background Check Started" },
  { value: "medical", label: "Medical Results Passed" },
  { value: "biometrics", label: "Biometrics Confirmed" },
  { value: "copr", label: "COPR Received" },
];

/** ISO date string for "today", used as the upper bound of the date picker. */
function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * "+ Submit Milestone" modal. Visual + interaction port of
 * `samples/aortrack-community-updated.html`:
 *   - select milestone type
 *   - pick a date (max = today)
 *   - optional note (max 500 chars)
 *   - validation: type + date required
 *   - simulated 1.6 s submit, then close + green toast
 *
 * TODO(real-data): swap the simulated submit for a real server action.
 *   The shape is already very close to the dashboard's submit form — we can
 *   reuse the existing zod schema + mutation once we move community
 *   submissions off of /track and inline them here.
 */
export function SubmitMilestoneModal({
  open,
  onClose,
  onSuccess,
  onValidationFail,
}: Props) {
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const labelId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, submitting]);

  useEffect(() => {
    if (open) return;
    if (submitting) return;
    setType("");
    setDate("");
    setNote("");
  }, [open, submitting]);

  function onOverlayMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget && !submitting) onClose();
  }

  function handleSubmit() {
    if (!type || !date) {
      onValidationFail("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      onSuccess(
        "Submitted! Under Gemini review — appears in your feed once approved",
      );
      onClose();
    }, 1600);
  }

  return (
    <div
      className={`modal-overlay${open ? " open" : ""}`}
      role="presentation"
      onMouseDown={onOverlayMouseDown}
      aria-hidden={!open}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        ref={dialogRef}
      >
        <div className="modal-header">
          <div className="modal-title" id={labelId}>
            Submit a Milestone
          </div>
          <button
            type="button"
            className="modal-close"
            aria-label="Close"
            onClick={onClose}
            disabled={submitting}
          >
            <IconClose aria-hidden />
          </button>
        </div>

        <div className="modal-body">
          <div className="m-field">
            <label className="m-label" htmlFor={`${labelId}-type`}>
              Milestone Type <span className="req">Required</span>
            </label>
            <select
              id={`${labelId}-type`}
              className="m-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {MILESTONE_OPTIONS.map((opt) => (
                <option value={opt.value} key={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="m-field">
            <label className="m-label" htmlFor={`${labelId}-date`}>
              Date <span className="req">Required</span>
            </label>
            <input
              id={`${labelId}-date`}
              className="m-input"
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="m-field">
            <label className="m-label" htmlFor={`${labelId}-note`}>
              Optional note
              <span className="optional-hint">(max 500 chars)</span>
            </label>
            <textarea
              id={`${labelId}-note`}
              className="m-textarea"
              placeholder="Share context about your timeline — WES timing, province, anything useful for others in your cohort…"
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="m-note">
              Your post will go through Gemini moderation before appearing in
              the community feed. Usually takes under 30 seconds. Visible only
              to you until approved.
            </div>
          </div>
        </div>

        <div className="m-footer">
          <button
            type="button"
            className="m-cancel"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="m-submit"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              "Submitting…"
            ) : (
              <>
                <span>Submit Milestone</span>
                <IconArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
