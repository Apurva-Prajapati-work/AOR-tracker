import Link from "next/link";
import { IconGitHub } from "./landing-icons";

const GH = "https://github.com/Get-North-Path/AOR-tracker";

export function MarketingFooter() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="fg-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Logo.png" alt="" className="nbrand-mark" width={22} height={22} />
            AORTrack
          </div>
          <p className="fg-desc">
            Free, open-source Canadian PR processing time tracker. Community-powered timelines
            from real applicants. Built by GetNorthPath.
          </p>
          <div className="fg-badge">
            <IconGitHub />
            MIT License · Open Source
          </div>
        </div>
        <div>
          <div className="fg-head">Tracker</div>
          <Link href="/track" className="fg-link">
            Start Tracking
          </Link>
          <Link href="/dashboard/stats" className="fg-link">
            Processing Stats
          </Link>
          <Link href="/roadmap" className="fg-link">
            Public Roadmap
          </Link>
          <Link href="/changelog" className="fg-link">
            Changelog
          </Link>
          <Link href="/hero-animation" className="fg-link">
            Hero Animation
          </Link>
        </div>
        <div>
          <div className="fg-head">Community</div>
          <a href={`${GH}/issues`} target="_blank" rel="noopener noreferrer" className="fg-link">
            Feedback &amp; Issues
          </a>
          <a href={GH} target="_blank" rel="noopener noreferrer" className="fg-link">
            GitHub
          </a>
          <a
            href="https://www.getnorthpath.com/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="fg-link"
          >
            Blog
          </a>
        </div>
        <div>
          <div className="fg-head">GetNorthPath</div>
          <a
            href="https://www.getnorthpath.com"
            target="_blank"
            rel="noopener noreferrer"
            className="fg-link"
          >
            Main Site
          </a>
          <a
            href="https://www.getnorthpath.com/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="fg-link"
          >
            Book a Consultation
          </a>
          <a
            href="https://www.getnorthpath.com/pathways"
            target="_blank"
            rel="noopener noreferrer"
            className="fg-link"
          >
            PR Pathways
          </a>
        </div>
      </div>
      <div className="footer-btm">
        <p className="footer-btm-text">
          © {new Date().getFullYear()} GetNorthPath Inc. AORTrack is free &amp; open source (MIT). Not
          affiliated with IRCC.
          <span className="footer-btm-sep" aria-hidden>
            {" "}
            ·{" "}
          </span>
          track.getnorthpath.com
        </p>
      </div>
    </footer>
  );
}
