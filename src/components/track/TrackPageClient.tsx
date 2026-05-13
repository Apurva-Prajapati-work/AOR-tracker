"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createDraftProfileAction,
  getProfileAction,
  saveProfileAction,
} from "@/app/actions/profile";
import { emptyMilestones, isValidEmail } from "@/lib/profile";
import { readSessionEmail, writeSessionEmail } from "@/lib/session-client";
import type { MilestoneEntry, MilestoneKey, UserProfile } from "@/lib/types";
import { useToast } from "@/components/ToastContext";
import type { AppType, StreamId } from "./data";
import { TrackHeroPanel } from "./TrackHeroPanel";
import { TrackStep1Application } from "./TrackStep1Application";
import { TrackStep2Milestones } from "./TrackStep2Milestones";
import { TrackStep3Review, type EmailMode } from "./TrackStep3Review";
import { TrackStepsNav } from "./TrackStepsNav";
import { TrackSuccess } from "./TrackSuccess";

type PostAorKey = Exclude<MilestoneKey, "aor">;

const POST_AOR_KEYS: PostAorKey[] = [
  "bil",
  "biometrics",
  "background",
  "medical",
  "ppr",
];

function blankChecked(): Record<PostAorKey, boolean> {
  return {
    bil: false,
    biometrics: false,
    background: false,
    medical: false,
    ppr: false,
  };
}
function blankDates(): Record<PostAorKey, string> {
  return { bil: "", biometrics: "", background: "", medical: "", ppr: "" };
}

const ANON_PROFILE_KEY = "aortrack_anon_profile_v1";

/**
 * Top-level client for `/track`. Owns ALL form state for the 3-step flow
 * plus the success transition, then persists either:
 *
 *   - email mode: `createDraftProfileAction` → `saveProfileAction` → MongoDB
 *     + `writeSessionEmail` so the dashboard can read the same profile back.
 *   - anon mode: serialises the profile to `localStorage` for now (matches
 *     the sample's "Cookie-only · 90 days" copy). When dashboard adds
 *     anonymous-cookie sessions, swap this for a server action that
 *     mints a signed cookie-only profile id.
 *
 * On mount we read the session email — if present (e.g. user came from
 * the dashboard's "Edit profile" link) we hydrate the form with their
 * existing profile so re-edits don't start from scratch.
 */
export function TrackPageClient() {
  const router = useRouter();
  const toast = useToast();

  // ── Step state ───────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [done, setDone] = useState(false);

  // ── Step 1 ───────────────────────────────────────────────────────────────
  const [aorDate, setAorDate] = useState("");
  const [stream, setStream] = useState<StreamId | null>(null);
  const [appType, setAppType] = useState<AppType | null>(null);
  const [province, setProvince] = useState("");
  const [step1Errors, setStep1Errors] = useState<{
    aor?: boolean;
    stream?: boolean;
    type?: boolean;
    province?: boolean;
  }>({});

  // ── Step 2 ───────────────────────────────────────────────────────────────
  const [checked, setChecked] = useState<Record<PostAorKey, boolean>>(
    blankChecked,
  );
  const [dates, setDates] = useState<Record<PostAorKey, string>>(blankDates);

  // ── Step 3 ───────────────────────────────────────────────────────────────
  const [emailMode, setEmailMode] = useState<EmailMode>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Live counter (cosmetic, matches sample) ──────────────────────────────
  const [liveCount, setLiveCount] = useState(14_827);
  useEffect(() => {
    const id = window.setInterval(() => {
      if (Math.random() > 0.7) {
        setLiveCount((c) => c + Math.floor(Math.random() * 3) + 1);
      }
    }, 4000);
    return () => window.clearInterval(id);
  }, []);
  const liveCountLabel = useMemo(
    () => `${liveCount.toLocaleString("en-US")} timelines live`,
    [liveCount],
  );

  // ── Hydrate from session email (returning users / dashboard edits) ───────
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const existingEmail = readSessionEmail();
    if (!existingEmail) return;
    setEmail(existingEmail);

    void (async () => {
      const res = await getProfileAction(existingEmail);
      if (!res.ok) return;
      const p = res.profile;

      if (p.aorDate) setAorDate(p.aorDate);
      if (p.stream) setStream(p.stream as StreamId);
      if (p.type) setAppType(p.type as AppType);
      if (p.province) setProvince(p.province);

      const nextChecked = blankChecked();
      const nextDates = blankDates();
      for (const k of POST_AOR_KEYS) {
        const m = p.milestones[k];
        if (m?.date) {
          nextChecked[k] = true;
          nextDates[k] = m.date;
        }
      }
      setChecked(nextChecked);
      setDates(nextDates);
    })();
  }, []);

  // ── Step transitions ─────────────────────────────────────────────────────
  const goToStep = (n: 1 | 2 | 3) => {
    setStep(n);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onContinueStep1 = () => {
    const today = new Date().toISOString().split("T")[0];
    const errs: typeof step1Errors = {};
    if (!aorDate || aorDate > today) errs.aor = true;
    if (!stream) errs.stream = true;
    if (!appType) errs.type = true;
    if (stream === "PNP" && !province) errs.province = true;
    setStep1Errors(errs);
    if (Object.keys(errs).length === 0) goToStep(2);
  };

  const toggleMilestone = (key: PostAorKey) => {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next[key]) {
        setDates((d) => ({ ...d, [key]: "" }));
      }
      return next;
    });
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const buildProfile = (forEmail: string): UserProfile => {
    const now = new Date().toISOString();
    const milestones = emptyMilestones();
    milestones.aor = { date: aorDate, updatedAt: now };
    for (const k of POST_AOR_KEYS) {
      if (checked[k] && dates[k]) {
        milestones[k] = { date: dates[k], updatedAt: now } as MilestoneEntry;
      }
    }
    return {
      email: forEmail,
      createdAt: now,
      updatedAt: now,
      aorDate,
      stream: stream ?? "CEC General",
      type: appType ?? "Inland",
      province: province || "Ontario",
      milestones,
    };
  };

  const onSubmit = async () => {
    let valid = true;
    if (!consent) {
      setConsentError(true);
      valid = false;
    } else {
      setConsentError(false);
    }

    if (emailMode === "email") {
      const trimmed = email.trim();
      if (!isValidEmail(trimmed)) {
        setEmailError(true);
        valid = false;
      } else {
        setEmailError(false);
      }
    }
    if (!valid) return;

    setSubmitting(true);

    try {
      if (emailMode === "email") {
        const trimmed = email.trim();
        const draft = await createDraftProfileAction(trimmed);
        if (!draft.ok) {
          toast.show("Couldn't create your profile — please try again.");
          setSubmitting(false);
          return;
        }
        const profile = buildProfile(trimmed);
        const existing = await getProfileAction(trimmed);
        if (existing.ok) {
          profile.createdAt = existing.profile.createdAt;
        }
        const res = await saveProfileAction(profile);
        if (!res.ok) {
          toast.show(res.error ?? "Failed to save your profile.");
          setSubmitting(false);
          return;
        }
        writeSessionEmail(trimmed);
      } else {
        // TODO(anon-cookie): replace with a server action that mints a
        // signed cookie-only profile id (90-day TTL) and stores the
        // anonymous record server-side, so cohort stats can include it.
        // For now we persist locally so the dashboard can still hydrate.
        if (typeof window !== "undefined") {
          const placeholder = `anon-${crypto
            .randomUUID()
            .slice(0, 8)}@aortrack.local`;
          const profile = buildProfile(placeholder);
          window.localStorage.setItem(
            ANON_PROFILE_KEY,
            JSON.stringify(profile),
          );
        }
      }

      setDone(true);
      toast.show("Profile saved! Welcome to AORTrack");
    } catch (err) {
      console.error(err);
      toast.show("Something went wrong — please try again.");
      setSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="mkt-track-page flex min-h-0 flex-1 flex-col">
      <div className="tk-page">
        <TrackHeroPanel liveCount={liveCountLabel} />

        <div className="tk-right">
          {done ? (
            <TrackSuccess mode={emailMode} />
          ) : (
            <>
              <TrackStepsNav current={step} />

              {step === 1 ? (
                <TrackStep1Application
                  aorDate={aorDate}
                  onAorDate={setAorDate}
                  stream={stream}
                  onStream={(id) => {
                    setStream(id);
                    if (id !== "PNP") setProvince("");
                  }}
                  appType={appType}
                  onAppType={setAppType}
                  province={province}
                  onProvince={setProvince}
                  errors={step1Errors}
                  onContinue={onContinueStep1}
                />
              ) : null}

              {step === 2 ? (
                <TrackStep2Milestones
                  checked={checked}
                  dates={dates}
                  onToggle={toggleMilestone}
                  onDate={(k, v) => setDates((d) => ({ ...d, [k]: v }))}
                  onBack={() => goToStep(1)}
                  onContinue={() => goToStep(3)}
                  onSkip={() => {
                    setChecked(blankChecked());
                    setDates(blankDates());
                    goToStep(3);
                  }}
                />
              ) : null}

              {step === 3 && stream && appType ? (
                <TrackStep3Review
                  aorDate={aorDate}
                  stream={stream}
                  appType={appType}
                  province={province}
                  checked={checked}
                  dates={dates}
                  emailMode={emailMode}
                  email={email}
                  emailError={emailError}
                  onEmailMode={(m) => {
                    setEmailMode(m);
                    setEmailError(false);
                  }}
                  onEmail={(v) => {
                    setEmail(v);
                    if (emailError) setEmailError(false);
                  }}
                  consent={consent}
                  consentError={consentError}
                  onConsent={() => {
                    setConsent((c) => !c);
                    setConsentError(false);
                  }}
                  submitting={submitting}
                  onBack={() => goToStep(2)}
                  onSubmit={() => void onSubmit()}
                />
              ) : null}
            </>
          )}

          {done ? (
            <button
              type="button"
              className="tk-btn-secondary"
              onClick={() => router.push("/dashboard")}
              style={{ marginTop: "1rem" }}
            >
              Go to dashboard now
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
