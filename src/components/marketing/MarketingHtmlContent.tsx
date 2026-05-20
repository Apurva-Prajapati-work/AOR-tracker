"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { parseMarketingHtmlFragment } from "@/lib/parse-standalone-html";

type Props = {
  html: string;
  className?: string;
};

function initRevealAnimations(root: HTMLElement) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("shown");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  root.querySelectorAll(".reveal").forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add("shown");
      return;
    }
    io.observe(el);
  });

  return io;
}

/**
 * Renders injected marketing HTML (streams / SEO guides).
 * - Hoists `<style>` so CSS applies on App Router client navigations.
 * - Re-runs inline `<script>` blocks after each navigation (React does not execute them in innerHTML).
 * - Wires `.reveal` scroll animations when scripts are absent or stripped.
 */
export function MarketingHtmlContent({ html, className }: Props) {
  const pathname = usePathname();
  const parsed = useMemo(() => parseMarketingHtmlFragment(html), [html]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const created: HTMLScriptElement[] = [];
    for (const code of parsed.scripts) {
      const s = document.createElement("script");
      s.textContent = code;
      document.body.appendChild(s);
      created.push(s);
    }
    return () => {
      created.forEach((s) => s.remove());
    };
  }, [html, pathname]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const { scripts } = parseMarketingHtmlFragment(html);
    if (scripts.length > 0) return;
    const io = initRevealAnimations(root);
    return () => io.disconnect();
  }, [html, pathname]);

  return (
    <>
      {parsed.styles ? (
        <style dangerouslySetInnerHTML={{ __html: parsed.styles }} />
      ) : null}
      <div
        ref={rootRef}
        className={className}
        dangerouslySetInnerHTML={{ __html: parsed.bodyInnerHtml }}
      />
    </>
  );
}
