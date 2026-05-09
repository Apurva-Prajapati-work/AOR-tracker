import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** Canadian maple leaf — same path as brand SVG in HTML samples (viewBox 0 0 100 100). */
export function IconMaple({ size = 22, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden {...p}>
      <path
        d="M50 5C50 5 30 35 8 38L18 48L10 55L30 52L28 70L50 58L72 70L70 52L90 55L82 48L92 38C70 35 50 5 50 5Z"
        fill="currentColor"
      />
      <rect x="44" y="68" width="12" height="22" rx="2" fill="currentColor" />
    </svg>
  );
}

export function IconLanguages({ size = 20, ...p }: IconProps) {
  return (
    <svg {...base} width={size} height={size} {...p} aria-hidden>
      <path d="M5 8h3M6.5 8v8M4 16h5" />
      <path d="M13 8h7M14 8l2.5 8h1L20 8" />
    </svg>
  );
}

export function IconChart({ size = 20, ...p }: IconProps) {
  return (
    <svg {...base} width={size} height={size} {...p} aria-hidden>
      <path d="M3 3v18h18" />
      <path d="M7 16v-4M12 16V8M17 16v-7" />
    </svg>
  );
}

export function IconLaptop({ size = 20, ...p }: IconProps) {
  return (
    <svg {...base} width={size} height={size} {...p} aria-hidden>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M2 18h20" />
    </svg>
  );
}

export function IconGlobe({ size = 20, ...p }: IconProps) {
  return (
    <svg {...base} width={size} height={size} {...p} aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function IconLandmark({ size = 20, ...p }: IconProps) {
  return (
    <svg {...base} width={size} height={size} {...p} aria-hidden>
      <path d="M3 21h18M6 21V7l6-4 6 4v14M9 21v-4h6v4" />
    </svg>
  );
}

export function IconPlus({ size = 20, ...p }: IconProps) {
  return (
    <svg {...base} width={size} height={size} {...p} aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconStar({ size = 18, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function IconMessage({ size = 20, ...p }: IconProps) {
  return (
    <svg {...base} width={size} height={size} {...p} aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function IconThumbsUp({ size = 20, ...p }: IconProps) {
  return (
    <svg {...base} width={size} height={size} {...p} aria-hidden>
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

export function IconWrench({ size = 20, ...p }: IconProps) {
  return (
    <svg {...base} width={size} height={size} {...p} aria-hidden>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

export function IconHourglass({ size = 18, ...p }: IconProps) {
  return (
    <svg {...base} width={size} height={size} {...p} aria-hidden>
      <path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
    </svg>
  );
}

export function IconCheck({ size = 16, ...p }: IconProps) {
  return (
    <svg {...base} width={size} height={size} {...p} aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
