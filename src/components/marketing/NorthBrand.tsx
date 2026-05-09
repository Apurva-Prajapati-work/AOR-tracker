import Link from "next/link";

export function NorthBrand() {
  return (
    <Link className="nbrand" aria-label="GetNorthPath" href="/">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/Logo.png" alt="GetNorthPath" className="nbrand-mark" width={28} height={28} />
      <h2 className="nbrand-wordmark">
        <span>Get</span>NorthPath
      </h2>
    </Link>
  );
}
