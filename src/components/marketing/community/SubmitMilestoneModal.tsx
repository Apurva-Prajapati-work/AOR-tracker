"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  createCommunityPostAction,
  type CommunityMs,
} from "@/app/actions/community";
import { IconArrowRight } from "../landing-icons";
import { IconClose } from "./community-icons";

type Props = {
  open: boolean;
  /** Viewer email; only opened when non-null (else SignInPromptModal opens). */
  email: string | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onValidationFail: (msg: string) => void;
};

/**
 * Form milestone value → backend `CommunityMs`. Backend only supports four
 * tags (`ppr | bil | bg | med`), so the previous `biometrics` / `copr`
 * options were removed — they have no public-feed surface today.
 *
 * Each option also carries a short label used to build the post body when
 * the user leaves the optional note blank.
 */
const MILESTONE_OPTIONS: {
  value: "" | "ppr" | "bil" | "bgc" | "medical";
  label: string;
  /** Used as the fallback body when the optional note is empty. */
  short: string;
}[] = [
  { value: "", label: "Select milestone…", short: "" },
  { value: "ppr", label: "PPR Received", short: "PPR" },
  { value: "bil", label: "BIL Received", short: "BIL" },
  { value: "bgc", label: "Background Check Started", short: "BGC" },
  { value: "medical", label: "Medical Results Passed", short: "Medical" },
];

const TYPE_TO_MS: Record<
  Exclude<(typeof MILESTONE_OPTIONS)[number]["value"], "">,
  CommunityMs
> = {
  ppr: "ppr",
  bil: "bil",
  bgc: "bg",
  medical: "med",
};

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
  email,
  onClose,
  onSuccess,
  onValidationFail,
}: Props) {
  const [type, setType] = useState<
    "" | "ppr" | "bil" | "bgc" | "medical"
  >("");
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

  async function handleSubmit() {
    if (!type || !date) {
      onValidationFail("Please fill in all required fields");
      return;
    }
    if (!email) {
      onValidationFail("You need to sign in to post.");
      return;
    }
    const ms = TYPE_TO_MS[type];
    const opt = MILESTONE_OPTIONS.find((o) => o.value === type);
    const body =
      note.trim() || `${opt?.short ?? type.toUpperCase()} on ${date}.`;

    setSubmitting(true);
    try {
      const res = await createCommunityPostAction(email, { body, ms });
      if (!res.ok) {
        onValidationFail(res.error);
        return;
      }
      onSuccess(
        "Submitted! Appears in your feed once the new-post bar refreshes",
      );
      onClose();
    } finally {
      setSubmitting(false);
    }
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
              onChange={(e) =>
                setType(e.target.value as typeof type)
              }
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
            onClick={() => void handleSubmit()}
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
