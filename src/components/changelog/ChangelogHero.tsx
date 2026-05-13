import type { ChangelogData } from "./data";

type Props = {
  hero: ChangelogData["hero"];
};

export function ChangelogHero({ hero }: Props) {
  return (
    <section className="cl-hero">
      <div className="cl-hero-inner">
        <h1>
          What&rsquo;s changed in <em>AORTrack.</em>
        </h1>
        <p className="cl-hero-sub">
          All notable changes per{" "}
          <a
            href="https://keepachangelog.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Keep a Changelog
          </a>
          . Versions follow Semantic Versioning.
        </p>
        <div className="cl-hero-pills">
          <div className="cl-hp">
            Latest <b>{hero.latest}</b>
          </div>
          <div className="cl-hp">
            Released <b>{hero.releasedAt}</b>
          </div>
          <div className="cl-hp">
            Licence <b>{hero.license}</b>
          </div>
          <div className="cl-hp">
            Releases <b>{hero.releaseCount}</b>
          </div>
        </div>
      </div>
    </section>
  );
}
