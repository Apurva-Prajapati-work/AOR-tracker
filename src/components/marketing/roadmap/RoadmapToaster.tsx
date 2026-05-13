"use client";

import { useEffect } from "react";
import { IconCheck } from "./roadmap-icons";
import { useRoadmapUi } from "./RoadmapUiContext";

const DISMISS_MS = 2600;

/**
 * Single auto-dismissing toast in the bottom-right corner.
 * Mirrors the `toast(msg)` helper from the sample HTML.
 */
export function RoadmapToaster() {
  const { toast, dismissToast } = useRoadmapUi();

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(dismissToast, DISMISS_MS);
    return () => window.clearTimeout(t);
  }, [toast, dismissToast]);

  if (!toast) return null;

  return (
    <div className="rm-toast" role="status" aria-live="polite" key={toast.id}>
      <IconCheck aria-hidden />
      <span>{toast.message}</span>
    </div>
  );
}
