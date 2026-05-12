"use client";

type Props = {
  /** How many new posts are pending. Bar is hidden when 0. */
  count: number;
  /** Click handler that "loads" the pending posts (prepends them). */
  onLoad: () => void;
};

/**
 * Fixed pill at the top of the viewport that slides down from above when
 * new posts arrive. Mirrors `.new-post-bar` from the HTML sample.
 *
 * TODO(real-data): when SSE/Socket.IO lands, increment `count` from a
 *   "community:new-post" event on the existing `community-broadcast`
 *   channel. `onLoad` should call `revalidatePath('/community')` and clear
 *   the pending count.
 */
export function NewPostBar({ count, onLoad }: Props) {
  const isVisible = count > 0;
  const label = `${count} new post${count > 1 ? "s" : ""} — click to load`;

  return (
    <button
      type="button"
      className={`new-post-bar${isVisible ? " show" : ""}`}
      onClick={onLoad}
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
    >
      <span className="dot" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
