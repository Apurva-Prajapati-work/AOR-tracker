import type { WhatsNext } from "./data";

type Props = {
  data: WhatsNext;
};

export function WhatsNextBox({ data }: Props) {
  return (
    <div className="cl-wnext">
      <div className="cl-wnext-t">{data.title}</div>
      {data.items.map((item, idx) => (
        <div className="cl-wnext-i" key={idx}>
          {item}
        </div>
      ))}
    </div>
  );
}
