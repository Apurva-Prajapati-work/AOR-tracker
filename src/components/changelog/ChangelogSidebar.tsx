import { shortDateTag, type Version } from "./data";

type Props = {
  versions: Version[];
  unreleasedTag: string;
  unreleasedId?: string;
  /** External links shown beneath the version list. */
  externalLinks?: { href: string; label: string; external?: boolean }[];
};

const DEFAULT_EXTERNAL_LINKS: NonNullable<Props["externalLinks"]> = [
  { href: "/roadmap", label: "← Public Roadmap" },
  {
    href: "https://github.com/Get-North-Path/AOR-tracker/releases",
    label: "GitHub Releases ↗",
    external: true,
  },
  { href: "/feedback", label: "Give Feedback" },
];

/**
 * Sticky left-rail version navigator.
 *
 * The list is derived from the versions array: the first entry (`isLatest`)
 * gets the green dot + "Latest" tag; the rest get an outline dot + a short
 * date label.
 *
 * TODO(github-integration): once versions come from GitHub, the "is current"
 *   highlighting (scroll-spy) should be wired up with an IntersectionObserver
 *   in a small client component sibling. Today we mark `isLatest` as the
 *   default "current" entry on first paint.
 */
export function ChangelogSidebar({
  versions,
  unreleasedTag,
  unreleasedId = "unreleased",
  externalLinks = DEFAULT_EXTERNAL_LINKS,
}: Props) {
  return (
    <nav className="cl-nav" aria-label="Version navigator">
      <div className="cl-nav-label">Versions</div>

      <a href={`#${unreleasedId}`} className="cl-link">
        <div className="cl-vdot b" />
        Unreleased
        <span className="cl-vtag">{unreleasedTag}</span>
      </a>

      {versions.map((v) => {
        const isLatest = !!v.isLatest;
        const linkClass = `cl-link${isLatest ? " is-current" : ""}`;
        const dotClass = `cl-vdot${isLatest ? " g" : ""}`;
        const tag = isLatest ? "Latest" : shortDateTag(v.date);
        return (
          <a key={v.id} href={`#${v.id}`} className={linkClass}>
            <div className={dotClass} />
            {v.version}
            <span className="cl-vtag">{tag}</span>
          </a>
        );
      })}

      <div className="cl-div" />

      {externalLinks.map((link) =>
        link.external ? (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="cl-link xs"
          >
            {link.label}
          </a>
        ) : (
          <a key={link.href} href={link.href} className="cl-link xs">
            {link.label}
          </a>
        ),
      )}
    </nav>
  );
}
