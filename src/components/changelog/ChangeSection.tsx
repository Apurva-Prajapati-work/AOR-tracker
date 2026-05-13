import {
  CHANGE_TYPE_CLASS,
  CHANGE_TYPE_LABEL,
  type ChangeSection as ChangeSectionData,
} from "./data";

type Props = {
  section: ChangeSectionData;
};

export function ChangeSection({ section }: Props) {
  const label = CHANGE_TYPE_LABEL[section.type];
  const chipClass = CHANGE_TYPE_CLASS[section.type];

  return (
    <div>
      <div className="cl-sec-head">
        <span className={`cl-ctype ${chipClass}`}>{label}</span>
      </div>
      <div className="cl-list">
        {section.items.map((item, idx) => (
          <div className="cl-i" key={idx}>
            {item.dot ? <div className={`cl-i-d cl-d-${item.dot}`} /> : null}
            <div
              className="cl-i-txt"
              dangerouslySetInnerHTML={{ __html: item.html }}
            />
            {item.issue ? (
              <a
                href={item.issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="cl-i-n"
              >
                #{item.issue.number}
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
