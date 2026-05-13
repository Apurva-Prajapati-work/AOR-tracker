"use client";

import { DN_SHARE } from "./data";
import { useDashboardNewUi } from "./DashboardNewContext";
import { IconCopy, IconGithub, IconWhatsapp } from "./dashboard-icons";

/**
 * On-page Share card (Section `share-sec`).
 *
 * Sample reference: <div id="share-sec"> in `aortrack-dashboard.html`.
 *
 * The "real" share infrastructure (`ensureShareTokenForEmailAction` →
 * `/s/<token>`) already lives in `DashboardShareTab.tsx`. When this page is
 * promoted, replace `DN_SHARE.shareUrl` with the live `shareUrl` from
 * `useDashboard()` and forward `shareLinkError` for failure states.
 */
export function DashboardShareSection() {
  const { showToast } = useDashboardNewUi();

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(DN_SHARE.shareUrl);
      showToast("Link copied to clipboard");
    } catch {
      showToast("Could not copy — please copy manually");
    }
  };

  const onWhatsapp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(
      `Tracking my PR journey on AORTrack: ${DN_SHARE.shareUrl}`,
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const onGithub = () => {
    window.open(DN_SHARE.githubUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="share-sec" style={{ marginTop: 26 }}>
      <div className="sec-head">
        <div>
          <div className="sec-title">Share My Journey</div>
          <div className="sec-sub">
            Read-only link — no personal data exposed
          </div>
        </div>
      </div>
      <div className="share-card">
        <div className="share-card-label">Your shareable profile link:</div>
        <div className="share-url">{DN_SHARE.shareUrlDisplay}</div>
        <div className="share-btns">
          <button type="button" className="sh-btn copy" onClick={onCopy}>
            <IconCopy aria-hidden />
            Copy Link
          </button>
          <button type="button" className="sh-btn wa" onClick={onWhatsapp}>
            <IconWhatsapp aria-hidden />
            WhatsApp
          </button>
          <button type="button" className="sh-btn gh" onClick={onGithub}>
            <IconGithub aria-hidden />
            Star on GitHub
          </button>
        </div>
      </div>
    </section>
  );
}
