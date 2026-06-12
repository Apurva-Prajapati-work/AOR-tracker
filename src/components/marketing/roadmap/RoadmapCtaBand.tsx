import { IconArrowRight, IconPlus } from "./roadmap-icons";

type Props = {
  feedbackHref: string;
  issuesHref: string;
};

/**
 * Dark navy CTA band above the kanban — links contributors to open their own
 * GitHub issues (see CONTRIBUTING.md).
 */
export function RoadmapCtaBand({ feedbackHref, issuesHref }: Props) {
  return (
    <div className="rm-cta-band">
      <div className="rm-ctab-text">
        <h3>Don&apos;t see what you need?</h3>
        <p>
          Open a GitHub Issue yourself — pick a template for bugs, features,
          data fixes, or docs. A free GitHub account is required.
        </p>
      </div>
      <div className="rm-ctab-btns">
        <a
          href={feedbackHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rm-btn rm-btn-r"
        >
          <IconPlus aria-hidden />
          Open GitHub Issue
        </a>
        <a
          href={issuesHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rm-btn rm-btn-g"
        >
          View GitHub Issues
          <IconArrowRight aria-hidden />
        </a>
      </div>
    </div>
  );
}
