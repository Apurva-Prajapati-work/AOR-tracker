import type { Contributor } from "./data";

type Props = {
  contributor: Contributor;
};

export function ContributorRow({ contributor }: Props) {
  return (
    <div className="contrib-row">
      <div className="contrib-rank">{contributor.rank}</div>
      <div
        className="contrib-av"
        style={{ background: contributor.avatarColor }}
      >
        {contributor.avatarLabel}
      </div>
      <div className="contrib-name">{contributor.name}</div>
      <div className="contrib-count">{contributor.verifiedCount} verified</div>
    </div>
  );
}
