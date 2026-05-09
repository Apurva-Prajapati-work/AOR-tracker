"use client";

import { useEffect } from "react";

type DeferredStylesheetProps = {
  href: string;
};

/**
 * Loads a stylesheet after mount so it does not block first paint (same pattern as GetNorthPath).
 */
export function DeferredStylesheet({ href }: DeferredStylesheetProps) {
  useEffect(() => {
    const id = `deferred-stylesheet-${hashHref(href)}`;
    if (document.getElementById(id)) return;

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    link.media = "all";
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, [href]);

  return null;
}

function hashHref(href: string): string {
  return href.replace(/[^a-zA-Z0-9]/g, "").slice(0, 48);
}
