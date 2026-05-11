"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { getProfileAction, saveProfileAction } from "@/app/actions/profile";
import {
  MILESTONE_DEFS,
  PROVINCES,
  STREAM_OPTIONS,
} from "@/lib/constants";
import { readSessionEmail } from "@/lib/session-client";
import type { MilestoneKey, UserProfile } from "@/lib/types";
import { useToast } from "@/components/ToastContext";
import { LogoMark } from "@/components/LogoMark";
import { emptyMilestones } from "@/lib/profile";

type SelectField = "type" | "stream" | "province";

export function OnboardingClient() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [aorDate, setAorDate] = useState("2025-02-25");
  const [type, setType] = useState("Inland");
  const [stream, setStream] = useState<string>("CEC General");
  const [province, setProvince] = useState("Ontario");
  const [activeSelect, setActiveSelect] = useState<SelectField | null>(null);
  const [checked, setChecked] = useState<Record<MilestoneKey, boolean>>(() => ({
    aor: true,
    bil: false,
    biometrics: false,
    background: false,
    medical: false,
    ppr: false,
  }));
  const [dates, setDates] = useState<Record<MilestoneKey, string>>(() => ({
    aor: "2025-02-25",
    bil: "",
    biometrics: "",
    background: "",
    medical: "",
    ppr: "",
  }));

  useEffect(() => {
    const e = readSessionEmail();
    if (!e) {
      router.replace("/track");
      return;
    }
    startTransition(() => {
      setEmail(e);
    });
    void (async () => {
      const res = await getProfileAction(e);
      if (res.ok) {
        const p = res.profile;
        if (p.aorDate) {
          setAorDate(p.aorDate);
          setType(p.type);
          setStream(p.stream);
          setProvince(p.province);
          const ch: Record<MilestoneKey, boolean> = {
            aor: true,
            bil: false,
            biometrics: false,
            background: false,
            medical: false,
            ppr: false,
          };
          const dt: Record<MilestoneKey, string> = {
            aor: p.aorDate,
            bil: "",
            biometrics: "",
            background: "",
            medical: "",
            ppr: "",
          };
          for (const k of Object.keys(p.milestones) as MilestoneKey[]) {
            const m = p.milestones[k];
            if (m.date) {
              ch[k] = true;
              dt[k] = m.date;
            }
          }
          setChecked(ch);
          setDates(dt);
        }
      }
    })();
  }, [router]);

  const streamSelect = useMemo(
    () =>
      STREAM_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s === "CEC General"
            ? "CEC — Canadian Experience Class (General)"
            : s === "CEC STEM"
              ? "CEC — STEM occupations"
              : s === "CEC Healthcare"
                ? "CEC — Healthcare"
                : s === "CEC French"
                  ? "CEC — French language"
                  : s === "FSW General"
                    ? "FSW — Federal Skilled Worker"
                    : "Provincial Nominee (PNP)"}
        </option>
      )),
    [],
  );

  const onStep1 = () => {
    if (!aorDate) {
      toast.show("Please enter your AOR date");
      return;
    }
    setDates((d) => ({ ...d, aor: aorDate }));
    setChecked((c) => ({ ...c, aor: true }));
    setStep(2);
  };

  const onFinish = async () => {
    if (!email) return;
    const milestones = emptyMilestones();
    for (const def of MILESTONE_DEFS) {
      if (checked[def.key] && dates[def.key]) {
        milestones[def.key] = {
          date: dates[def.key],
          updatedAt: new Date().toISOString(),
        };
      }
    }
    milestones.aor = {
      date: aorDate,
      updatedAt: new Date().toISOString(),
    };
    const profile: UserProfile = {
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aorDate,
      stream,
      type,
      province,
      milestones,
    };
    const prev = await getProfileAction(email);
    if (prev.ok) {
      profile.createdAt = prev.profile.createdAt;
    }
    await saveProfileAction(profile);
    router.push("/dashboard");
    toast.show("Profile saved! Welcome to AORTrack 🇨🇦");
  };

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--navy)] text-[var(--t2)]">
        Loading…
      </div>
    );
  }

  return (
    <div
      id="screen-onboarding"
      className="screen active flex min-h-screen flex-col items-center justify-center bg-[var(--navy)] py-16"
    >
      <div className="topbar fixed top-0 right-0 left-0">
        <Link href="/" className="logo">
          <div className="logo-icon text-white">
            <LogoMark />
          </div>
          <span className="logo-name">
            AOR<span>Track</span>
          </span>
        </Link>
        <span />
        <span />
      </div>

      {step === 1 ? (
        <div className="ob mt-10">
          <div className="pdots">
            <div className="pd on" />
            <div className="pd" />
            <div className="pd" />
          </div>
          <div className="ostep">Step 2 of 3 — Application details</div>
          <div className="otitle">About your application</div>
          <div className="osub">
            We&apos;ll match you with the right cohort and pull real processing
            data.
          </div>
          <div className="fr2">
            <div className="fg2">
              <label className="fl">AOR date</label>
              <input
                className="fi2"
                type="date"
                value={aorDate}
                onChange={(e) => setAorDate(e.target.value)}
              />
            </div>
            <div className="fg2">
              <label className="fl">Application type</label>
              <div className="fsel-wrap">
                <select
                  className="fsel"
                  value={type}
                  onBlur={() => setActiveSelect(null)}
                  onChange={(e) => setType(e.target.value)}
                  onFocus={() => setActiveSelect("type")}
                >
                  <option value="Inland">Inland</option>
                  <option value="Outland">Outland</option>
                </select>
                <span className={`fsel-arrow ${activeSelect === "type" ? "is-open" : ""}`}>
                  <FaChevronDown className="fsel-arrow-icon arrow-down" />
                  <FaChevronUp className="fsel-arrow-icon arrow-up" />
                </span>
              </div>
            </div>
          </div>
          <div className="fg2">
            <label className="fl">Immigration stream</label>
            <div className="fsel-wrap">
              <select
                className="fsel"
                value={stream}
                onBlur={() => setActiveSelect(null)}
                onChange={(e) => setStream(e.target.value)}
                onFocus={() => setActiveSelect("stream")}
              >
                {streamSelect}
              </select>
              <span className={`fsel-arrow ${activeSelect === "stream" ? "is-open" : ""}`}>
                <FaChevronDown className="fsel-arrow-icon arrow-down" />
                <FaChevronUp className="fsel-arrow-icon arrow-up" />
              </span>
            </div>
          </div>
          <div className="fg2">
            <label className="fl">Province</label>
            <div className="fsel-wrap">
              <select
                className="fsel"
                value={province}
                onBlur={() => setActiveSelect(null)}
                onChange={(e) => setProvince(e.target.value)}
                onFocus={() => setActiveSelect("province")}
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <span className={`fsel-arrow ${activeSelect === "province" ? "is-open" : ""}`}>
                <FaChevronDown className="fsel-arrow-icon arrow-down" />
                <FaChevronUp className="fsel-arrow-icon arrow-up" />
              </span>
            </div>
          </div>
          <button type="button" className="bf" onClick={onStep1}>
            Continue →
          </button>
        </div>
      ) : (
        <div className="ob mt-10">
          <div className="pdots">
            <div className="pd dn" />
            <div className="pd on" />
            <div className="pd" />
          </div>
          <div className="ostep">Step 3 of 3 — Your milestones</div>
          <div className="otitle">Which milestones have you reached?</div>
          <div className="osub">
            Check each one and enter the date. We&apos;ll estimate the rest from
            your cohort data.
          </div>
          {MILESTONE_DEFS.map((m) => (
            <button
              key={m.key}
              type="button"
              className={`msitem ${checked[m.key] ? "ck" : ""}`}
              onClick={(e) => {
                if ((e.target as HTMLElement).tagName === "INPUT") return;
                setChecked((c) => ({ ...c, [m.key]: !c[m.key] }));
              }}
            >
              <div className="mscb">
                <span className="msck">✓</span>
              </div>
              <span className="mslbl">{m.label}</span>
              <input
                className="msdate"
                type="date"
                value={dates[m.key]}
                onChange={(e) =>
                  setDates((d) => ({ ...d, [m.key]: e.target.value }))
                }
                onClick={(e) => e.stopPropagation()}
              />
            </button>
          ))}
          <button
            type="button"
            className="bf mt-3.5"
            onClick={() => void onFinish()}
          >
            Build my timeline →
          </button>
        </div>
      )}
    </div>
  );
}
