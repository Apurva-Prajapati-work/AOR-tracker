import Link from "next/link";
import { IconChevronLeft } from "./track-icons";

/**
 * Top navbar for the standalone `/track` page.
 *
 * Mirrors the markup in `samples/aortrack-track-updated.html`:
 *
 *   - sticky dark-navy bar (64px) flush with the viewport top,
 *   - left: AORTrack logo + wordmark + "by GetNorthPath" tagline,
 *   - right: "← Back to home" link.
 *
 * Uses its own `tk-nav-*` class namespace (consistent with the rest of
 * the track page's `tk-*` scope) so it never fights the shared
 * `.marketing-site .nav` rules used on / and /changelog.
 */
export function TrackNav() {
  return (
    <nav className="tk-nav" aria-label="Track page navigation">
      <Link href="/" className="tk-nav-brand">
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

      <Link href="/" className="tk-nav-back">
        <IconChevronLeft aria-hidden />
        Back to home
      </Link>
    </nav>
  );
}
