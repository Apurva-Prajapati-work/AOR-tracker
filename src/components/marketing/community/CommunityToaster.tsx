"use client";

import { ToastToneIcon } from "./community-icons";
import type { ToastTone } from "./CommunityUiContext";

export type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

type Props = {
  /**
   * Currently visible toast (null = none). The shell only ever keeps one
   * toast at a time (matches the HTML sample's behaviour: each new toast
   * replaces the previous one). Auto-dismiss is owned by the shell so
   * timeouts don't double-fire across renders.
   */
  toast: ToastItem | null;
};

/**
 * Renders the single active toast in the bottom-right. Green and amber
 * tones get a leading react-icon (check / warning); the "default" tone is
 * icon-less.
 */
export function CommunityToaster({ toast }: Props) {
  if (!toast) return null;

  const toneClass = toast.tone === "default" ? "" : ` ${toast.tone}`;

  return (
    <div className={`toast${toneClass}`} role="status" aria-live="polite">
      <ToastToneIcon tone={toast.tone} />
      <span>{toast.message}</span>
    </div>
  );
}
