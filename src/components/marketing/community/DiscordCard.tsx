import { IconArrowRight } from "../landing-icons";
import { IconDiscord } from "./community-icons";
import type { CommunityPageData } from "./data";

type Props = {
  data: CommunityPageData["discord"];
};

export function DiscordCard({ data }: Props) {
  return (
    <div className="discord-card">
      <div className="dc-icon" aria-hidden>
        <IconDiscord />
      </div>
      <div className="dc-title">{data.title}</div>
      <div className="dc-sub">{data.sub}</div>
      <a
        href={data.href}
        target="_blank"
        rel="noopener noreferrer"
        className="dc-btn"
      >
        <span>{data.buttonLabel}</span>
        <IconArrowRight size={12} />
      </a>
    </div>
  );
}
