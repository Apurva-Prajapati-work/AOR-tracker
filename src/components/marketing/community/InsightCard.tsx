import { IconArrowRight } from "../landing-icons";
import { InsightToneIcon } from "./community-icons";
import type { Insight } from "./data";

type Props = {
  insight: Insight;
};

const TONE_CLASS: Record<Insight["tone"], string> = {
  amber: "ic-amber",
  green: "ic-green",
  red: "ic-red",
  blue: "ic-blue",
};

export function InsightCard({ insight }: Props) {
  return (
    <div className={`insight-card ${TONE_CLASS[insight.tone]}`}>
      <div className="ic-top">
        <div className="ic-icon" aria-hidden>
          <InsightToneIcon tone={insight.tone} />
        </div>
        <div className="ic-title">{insight.title}</div>
      </div>
      <div className="ic-body">{insight.body}</div>
      <div className="ic-foot">
        <span>{insight.reporters}</span>
        <span>{insight.age}</span>
      </div>
      {insight.link ? (
        <a href={insight.link.href} className="ic-link">
          <span>{insight.link.label}</span>
          <IconArrowRight size={11} />
        </a>
      ) : null}
    </div>
  );
}
