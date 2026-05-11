"use client";

import Link from "next/link";
import { IconArrowRight, IconGitHub } from "./landing-icons";
import { NorthBrand } from "./NorthBrand";

const GH = "https://github.com/Get-North-Path/AOR-tracker";

export function MarketingNav() {
  return (
    <nav className="nav">
      <NorthBrand />
      <div className="nav-links">
        <Link href="/#how">How It Works</Link>
        <Link href="/#streams">Streams</Link>
        <Link href="/#timeline">Timeline</Link>
        <Link href="/#feedback">Contribute</Link>
        <a href={GH} target="_blank" rel="noopener noreferrer" className="nav-oss">
          <IconGitHub />
          Open Source
        </a>
      </div>
      <Link href="/track" className="nav-cta">
        Track My AOR <IconArrowRight />
      </Link>
    </nav>
  );
}
