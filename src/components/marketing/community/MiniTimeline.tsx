import type { TimelineDot } from "./data";

type Props = {
  dots: TimelineDot[];
};

/**
 * Inline progress timeline rendered between the cohort row and the post body
 * on rich cards (mostly used on PPR success stories).
 */
export function MiniTimeline({ dots }: Props) {
  return (
    <div className="mini-tl" aria-hidden="false">
      {dots.map((dot, idx) => {
        const stateClass = `mt-${dot.state}`;
        const highlight = dot.highlight ? " is-highlight" : "";
        return (
          <span key={`${dot.label}-${idx}`} style={{ display: "contents" }}>
            <div
              className={`mt-dot ${stateClass}${highlight}`}
              title={dot.label}
            />
            {idx < dots.length - 1 ? <div className="mt-line" /> : null}
          </span>
        );
      })}
    </div>
  );
}
