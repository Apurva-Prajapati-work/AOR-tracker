"use client";

import { useEffect, useState } from "react";

type Phase = "in" | "out" | "done";

const VISIBLE_MS = 1500;
const FADE_MS = 600;

export function LandingLoadingAnimation() {
  const [phase, setPhase] = useState<Phase>("in");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      setPhase("done");
      return;
    }

    const tFade = window.setTimeout(() => setPhase("out"), VISIBLE_MS);
    const tDone = window.setTimeout(
      () => setPhase("done"),
      VISIBLE_MS + FADE_MS,
    );

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(tFade);
      window.clearTimeout(tDone);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={`aor-ll ${phase === "out" ? "aor-ll--out" : "aor-ll--in"}`}
      aria-hidden="true"
      role="presentation"
    >
      <div className="aor-ll__bg" />
      <div className="aor-ll__veil" />

      <div className="aor-ll__center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Logo.png"
          alt=""
          className="aor-ll__leaf"
          width={120}
          height={120}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/animation-text.png"
          alt="AORTrack"
          className="aor-ll__text"
          width={820}
          height={220}
        />
        <div className="aor-ll__tag">
          <span className="aor-ll__dot" />
          <span>track.getnorthpath.com</span>
        </div>
      </div>

      <style>{`
        .aor-ll{
          position:fixed;inset:0;z-index:2147483000;overflow:hidden;
          background:#eef4ee;
          transition:opacity ${FADE_MS}ms ease, visibility ${FADE_MS}ms ease;
          will-change:opacity;
        }
        .aor-ll--out{opacity:0;visibility:hidden;pointer-events:none;}

        .aor-ll__bg{
          position:absolute;inset:-2% -2%;
          background-image:url('/animation-bg.png');
          background-size:cover;
          background-position:center 40%;
          transform:scale(1.06);
          animation:aor-ll-zoom 1100ms cubic-bezier(.2,.6,.2,1) both;
        }
        .aor-ll__veil{
          position:absolute;inset:0;
          background:
            radial-gradient(ellipse 80% 70% at 50% 50%, rgba(255,255,255,0) 30%, rgba(238,244,238,0.55) 85%, rgba(238,244,238,0.85) 100%),
            linear-gradient(180deg, rgba(238,244,238,0.25) 0%, rgba(238,244,238,0) 35%);
          pointer-events:none;
        }

        .aor-ll__center{
          position:absolute;inset:0;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:18px;padding:0 24px;text-align:center;
        }

        .aor-ll__leaf{
          height:clamp(60px,8.2vw,90px);
          width:auto;
          opacity:0;
          filter:drop-shadow(0 8px 24px rgba(176,33,32,0.22));
          animation:aor-ll-leaf 520ms cubic-bezier(.34,1.56,.64,1) 80ms forwards;
        }
        .aor-ll__text{
          height:clamp(52px,8.5vw,108px);
          width:auto;
          opacity:0;
          filter:drop-shadow(0 6px 22px rgba(176,33,32,0.18));
          animation:aor-ll-text 560ms cubic-bezier(.34,1.56,.64,1) 220ms forwards;
        }
        .aor-ll__tag{
          display:inline-flex;align-items:center;gap:8px;
          font-family:'DM Mono', ui-monospace, monospace;
          font-size:clamp(12px,1.1vw,14px);
          letter-spacing:.08em;
          color:var(--red);
          opacity:0;
          animation:aor-ll-tag 480ms ease-out 420ms forwards;
        }
        .aor-ll__dot{
          width:6px;height:6px;border-radius:50%;
          background:#b02120;
          box-shadow:0 0 0 4px rgba(176,33,32,0.18);
          animation:aor-ll-pulse 1.4s ease-in-out infinite;
        }

        @keyframes aor-ll-zoom{
          from{transform:scale(1.10);}
          to{transform:scale(1);}
        }
        @keyframes aor-ll-leaf{
          0%{opacity:0;transform:translateY(-16px) scale(.85);}
          100%{opacity:1;transform:translateY(0) scale(1);}
        }
        @keyframes aor-ll-text{
          0%{opacity:0;transform:translateY(18px) scale(.94);}
          100%{opacity:1;transform:translateY(0) scale(1);}
        }
        @keyframes aor-ll-tag{
          from{opacity:0;transform:translateY(6px);}
          to{opacity:.85;transform:translateY(0);}
        }
        @keyframes aor-ll-pulse{
          0%,100%{box-shadow:0 0 0 4px rgba(176,33,32,0.18);}
          50%{box-shadow:0 0 0 8px rgba(176,33,32,0.05);}
        }

        @media (prefers-reduced-motion: reduce){
          .aor-ll__bg,.aor-ll__leaf,.aor-ll__text,.aor-ll__tag,.aor-ll__dot{
            animation:none !important;
            opacity:1 !important;
            transform:none !important;
          }
        }
      `}</style>
    </div>
  );
}
