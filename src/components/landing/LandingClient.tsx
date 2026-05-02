"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { getProfileAction, ensureDemoProfileAction } from "@/app/actions/profile";
import { TICKER } from "@/lib/constants";
import { isValidEmail } from "@/lib/profile";
import { writeSessionEmail } from "@/lib/session-client";
import { useToast } from "@/components/ToastContext";
import { LogoMark } from "@/components/LogoMark";

export function LandingClient() {
  const router = useRouter();
  const toast = useToast();
  const [resumeEmail, setResumeEmail] = useState("");
  const [resumeErr, setResumeErr] = useState(false);

  const goDashboard = useCallback(
    (email: string) => {
      writeSessionEmail(email);
      router.push("/dashboard");
    },
    [router],
  );

  const onResume = async () => {
    setResumeErr(false);
    if (!isValidEmail(resumeEmail)) {
      setResumeErr(true);
      return;
    }
    const res = await getProfileAction(resumeEmail);
    if (!res.ok) {
      setResumeErr(true);
      return;
    }
    goDashboard(resumeEmail);
    toast.show(`Welcome back, ${resumeEmail.split("@")[0]}! 🇨🇦`);
  };

  const onDemo = async () => {
    const profile = await ensureDemoProfileAction();
    goDashboard(profile.email);
    toast.show("Demo profile loaded — saved to MongoDB for demo@aortrack.ca");
  };

  return (
    <div className="screen active flex min-h-screen flex-col">
      <div className="topbar">
        <Link href="/" className="logo">
          <div className="logo-icon text-white">
            <LogoMark />
          </div>
          <span className="logo-name">
            AOR<span>Track</span>
          </span>
        </Link>
        <span className="text-[12px] text-[var(--t3)]">
          <span className="dlive" />
          14,872 timelines live
        </span>
        <div className="tr">
          <button type="button" className="bg" onClick={onDemo}>
            Try demo
          </button>
          <Link href="/track" className="br inline-block no-underline">
            Track my application →
          </Link>
        </div>
      </div>

      <div className="hero">
        <div className="eyebrow">🍁 Free · No signup · Community powered</div>
        <h1 className="ht">
          Know exactly where you stand in your <span className="ac">PR journey</span>
        </h1>
        <p className="hs">
          AORTrack uses crowd-sourced data from 14,872 applicants to show real
          processing timelines — not IRCC&apos;s generic 6–8 month estimate.
        </p>
        <div className="hcta">
          <Link href="/track" className="bh no-underline">
            Track my AOR <span>→</span>
          </Link>
          <button type="button" className="bhs" onClick={onDemo}>
            See a sample dashboard
          </button>
        </div>
        <div className="hstats">
          <div>
            <div className="hsv">14.8k</div>
            <div className="hsl">Active timelines</div>
          </div>
          <div>
            <div className="hsv">184d</div>
            <div className="hsl">Avg. CEC General</div>
          </div>
          <div>
            <div className="hsv">96%</div>
            <div className="hsl">Within estimate</div>
          </div>
        </div>
      </div>

      <div className="rstrip">
        <div className="rlbl">Already tracking? Resume with your email</div>
        <div className="rrow">
          <input
            className="ri"
            type="email"
            placeholder="you@email.com"
            value={resumeEmail}
            onChange={(e) => setResumeEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void onResume()}
          />
          <button type="button" className="rb" onClick={() => void onResume()}>
            Load my timeline →
          </button>
        </div>
        <div className={`rerr ${resumeErr ? "is-visible" : ""}`}>
          No profile found for that email.{" "}
          <Link href="/track" className="text-[var(--red)]">
            Start tracking →
          </Link>
        </div>
      </div>

      <div className="fg">
        <div className="fc">
          <div className="fi">📍</div>
          <div className="ft">See your real position</div>
          <div className="fd">
            Know exactly how far you are in your cohort&apos;s queue — not a
            generic government estimate.
          </div>
        </div>
        <div className="fc">
          <div className="fi">👥</div>
          <div className="ft">Cohort comparisons</div>
          <div className="fd">
            Compare milestones with applicants sharing your AOR date, stream,
            and category.
          </div>
        </div>
        <div className="fc">
          <div className="fi">⚠️</div>
          <div className="ft">Live issue alerts</div>
          <div className="fd">
            WES delays, IRCC tracker bugs, and anomalies reported by the
            community in real time.
          </div>
        </div>
      </div>

      <div className="tw">
        <div className="tlbl">
          <span className="dlive" />
          Live community reports
        </div>
        <div>
          {TICKER.map((t) => (
            <div key={t.text} className="ti">
              <span className="ttime">{t.time}</span>
              <span className={`tbg ${t.type}`}>{t.label}</span>
              <span className="ttxt">{t.text}</span>
              <span className="tstream">{t.stream}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
