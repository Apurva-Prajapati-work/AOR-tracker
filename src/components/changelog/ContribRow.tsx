import type { ContribRow as ContribRowData } from "./data";

type Props = {
  row: ContribRowData;
};

/**
 * Single row of contributor avatars + handles shown beneath a version's
 * change sections.
 *
 * TODO(github-integration): the static seed currently encodes the avatar
 * colour for each contributor. Once we pull from the GitHub API we can drop
 * the colour and use the real avatar_url instead (with the existing circle +
 * border treatment as a fallback while the image loads).
 */
export function ContribRow({ row }: Props) {
  return (
    <div className="cl-contribs">
      <span className="cl-c-label">{row.label}</span>
      {row.contributors.map((c, idx) => (
        <div
          className="cl-cav"
          style={{ background: c.color }}
          key={`${c.initials}-${idx}`}
        >
          {c.initials}
        </div>
      ))}
      <span className="cl-cnames">{row.names}</span>
    </div>
  );
}
