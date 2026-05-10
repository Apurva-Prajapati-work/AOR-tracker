"use client";

import { useEffect } from "react";
import type { ParsedStandaloneHtml } from "@/lib/parse-standalone-html";

export function StandaloneMarketingClient({
  styles,
  bodyInnerHtml,
  scripts,
}: ParsedStandaloneHtml) {
  useEffect(() => {
    document.documentElement.classList.add("aortrack-standalone-page");
    document.body.classList.add("aortrack-standalone-page");
    return () => {
      document.documentElement.classList.remove("aortrack-standalone-page");
      document.body.classList.remove("aortrack-standalone-page");
    };
  }, []);

  useEffect(() => {
    const created: HTMLScriptElement[] = [];
    for (const code of scripts) {
      const s = document.createElement("script");
      s.textContent = code;
      document.body.appendChild(s);
      created.push(s);
    }
    return () => {
      created.forEach((s) => s.remove());
    };
  }, [scripts]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div dangerouslySetInnerHTML={{ __html: bodyInnerHtml }} />
    </>
  );
}
