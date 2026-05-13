import type { Unreleased } from "./data";

type Props = {
  data: Unreleased;
};

/**
 * "In Progress" / Unreleased section above the version blocks.
 *
 * TODO(github-integration): in the GitHub-backed version, the items list
 * here should be derived from open issues labelled `in-progress` (or the
 * milestone for the next release tag). The `noteHtml` "Expected" line can
 * be replaced with the milestone's due_on field.
 */
export function UnreleasedBlock({ data }: Props) {
  return (
    <div className="cl-unreleased-wrap" id="unreleased">
      <div className="cl-unreleased">
        <div className="cl-ur-top">
          <div className="cl-ur-badge">{data.badge}</div>
          <div className="cl-ur-title">{data.title}</div>
        </div>
        {data.items.map((item, idx) => (
          <div className="cl-ur-i" key={idx}>
            {item}
          </div>
        ))}
        <div
          className="cl-ur-note"
          dangerouslySetInnerHTML={{ __html: data.noteHtml }}
        />
      </div>
    </div>
  );
}
