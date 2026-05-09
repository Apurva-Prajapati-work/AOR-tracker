"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NorthBrand } from "./NorthBrand";

const GH = "https://github.com/Get-North-Path/AOR-tracker";

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export function MarketingNav() {
  const pathname = usePathname();
  const isRoadmap = pathname.startsWith("/roadmap");

  if (isRoadmap) {
    return (
      <nav className="nav rm-nav-page-hide">
        <div className="flex min-w-0 items-center">
          <NorthBrand />
          <div className="nav-sep" aria-hidden />
          <div className="nav-page">Public Roadmap</div>
        </div>
        <div className="nav-right">
          <a href={GH} target="_blank" rel="noopener noreferrer" className="nbtn">
            <GitHubIcon />
            GitHub
          </a>
          <a
            href={`${GH}/issues/new`}
            target="_blank"
            rel="noopener noreferrer"
            className="nbtn red"
          >
            + Request Feature
          </a>
        </div>
      </nav>
    );
  }

  return (
    <nav className="nav">
      <NorthBrand />
      <div className="nav-links">
        <Link href="/#how">How It Works</Link>
        <Link href="/#streams">Streams</Link>
        <Link href="/#timeline">Timeline</Link>
        <Link href="/#feedback">Contribute</Link>
        <a href={GH} target="_blank" rel="noopener noreferrer" className="nav-oss">
          <GitHubIcon />
          Open Source
        </a>
      </div>
      <Link href="/track" className="nav-cta">
        Track My AOR →
      </Link>
    </nav>
  );
}
