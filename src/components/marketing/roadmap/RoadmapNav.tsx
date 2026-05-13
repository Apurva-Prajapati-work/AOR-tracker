import Link from "next/link";
import { NorthBrand } from "../NorthBrand";
import { IconGitHub, IconPlus } from "./roadmap-icons";

type Props = {
  pageLabel?: string;
  /** URL to /changelog. */
  changelogHref: string;
  /** Public repo URL. */
  repoHref: string;
  /** Feature request entry point. */
  feedbackHref: string;
};

/**
 * Roadmap-page-only top nav (own classes `rm-nav-*` / `rm-nbtn` so it never
 * fights the shared `.marketing-site .nav` rules). Mirrors the sample HTML
 * but uses react-icons instead of inline SVGs.
 */
export function RoadmapNav({
  pageLabel = "Public Roadmap",
  changelogHref,
  repoHref,
  feedbackHref,
}: Props) {
  return (
    <nav className="rm-nav" aria-label="Roadmap navigation">
      <div className="rm-nav-left">
        <NorthBrand />
        <span className="rm-nav-sep" aria-hidden="true" />
        <span className="rm-nav-page">{pageLabel}</span>
      </div>

      <div className="rm-nav-right">
        <Link href={changelogHref} className="rm-nbtn">
          Changelog
        </Link>
        <a
          href={repoHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rm-nbtn"
        >
          <IconGitHub aria-hidden />
          GitHub
        </a>
        <Link href={feedbackHref} className="rm-nbtn red">
          <IconPlus aria-hidden />
          Request Feature
        </Link>
      </div>
    </nav>
  );
}
