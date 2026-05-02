"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createDraftProfileAction,
  ensureDemoProfileAction,
  getProfileAction,
} from "@/app/actions/profile";
import { isValidEmail } from "@/lib/profile";
import { writeSessionEmail } from "@/lib/session-client";
import { useToast } from "@/components/ToastContext";
import { LogoMark } from "@/components/LogoMark";

export function TrackClient() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState(false);

  const onContinue = async () => {
    setErr(false);
    if (!isValidEmail(email)) {
      setErr(true);
      return;
    }
    const existing = await getProfileAction(email);
    if (existing.ok && existing.profile.aorDate) {
      writeSessionEmail(email);
      router.push("/dashboard");
      toast.show(`Welcome back! Profile loaded for ${email}`);
      return;
    }
    if (existing.ok && !existing.profile.aorDate) {
      writeSessionEmail(email);
      router.push("/onboarding");
      return;
    }
    const draft = await createDraftProfileAction(email);
    if (!draft.ok) {
      setErr(true);
      return;
    }
    writeSessionEmail(email);
    router.push("/onboarding");
  };

  const onDemo = async () => {
    const p = await ensureDemoProfileAction();
    writeSessionEmail(p.email);
    router.push("/dashboard");
    toast.show("Demo profile loaded");
  };

  return (
    <div
      id="screen-email"
      className="screen active flex min-h-screen flex-col items-center justify-center bg-[var(--navy)] pt-14"
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
        <span className="hidden max-w-[200px] truncate text-center text-[11px] leading-snug text-[var(--t3)] sm:inline sm:max-w-none sm:text-[12px]">
          Profile syncs to MongoDB via server actions
        </span>
        <span />
      </div>

      <div className="ec">
        <div className="estep">Step 1 of 3</div>
        <div className="etitle">What&apos;s your email?</div>
        <div className="esub">
          We use it as your profile key so you can return anytime. On this build
          it is stored in MongoDB (normalized) when you continue.
        </div>
        <div className="fg2">
          <label className="fl" htmlFor="gate-email">
            Email address
          </label>
          <input
            id="gate-email"
            className="fi2"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void onContinue()}
          />
        </div>
        <div className={`eerr ${err ? "is-visible" : ""}`}>
          Please enter a valid email address.
        </div>
        <button type="button" className="bf" onClick={() => void onContinue()}>
          Continue →
        </button>
        <div className="enote">🔒 Persists in MongoDB for your return visits.</div>
        <div className="eor">or</div>
        <button
          type="button"
          className="w-full cursor-pointer rounded-[10px] border border-[var(--border)] bg-transparent py-2.5 font-[family-name:var(--f)] text-[13px] text-[var(--t2)] transition-colors hover:border-[rgba(255,255,255,0.2)]"
          onClick={() => void onDemo()}
        >
          Try with demo profile
        </button>
      </div>
    </div>
  );
}
