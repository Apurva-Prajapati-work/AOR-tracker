import Image from "next/image";
import Link from "next/link";

export function NorthBrand() {
  return (
    <Link className="nbrand" aria-label="GetNorthPath" href="/">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/Logo.png"
        alt=""
        className="fg-brand-mark"
        width={28}
        height={28}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/Logo-text.png"
        alt=""
        className="fg-brand-mark"
        width={100}
        height={44}
      />
    </Link>
  );
}
