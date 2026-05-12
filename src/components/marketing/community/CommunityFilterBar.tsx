import { FaSearch } from "react-icons/fa";
import type { FilterChip, SortOption } from "./data";

type Props = {
  chips: FilterChip[];
  sortOptions: SortOption[];
  defaultSort: string;
};

/**
 * Top filter row: milestone chips, search input, sort select.
 *
 * The interactive bits (filtering, debounced search, sort) are no-ops in
 * the marketing preview.
 *
 * TODO(real-data): once we wire this up, lift the active filter / search
 *   / sort into URL search params (so deep links work) and re-fetch the
 *   feed on change. Reference: the same pattern is used on the dashboard
 *   community panel (`CommunityFeedPanel.tsx`) — we can extract a shared
 *   hook when both pages move to live data.
 */
export function CommunityFilterBar({ chips, sortOptions, defaultSort }: Props) {
  return (
    <div className="filter-bar">
      <div className="filter-chips" role="tablist" aria-label="Milestone filters">
        {chips.map((chip) => (
          <button
            type="button"
            key={chip.id}
            className={`chip${chip.active ? " on" : ""}`}
            role="tab"
            aria-selected={chip.active ?? false}
          >
            {chip.dotColor ? (
              <span
                className="chip-dot"
                style={{ background: chip.dotColor }}
                aria-hidden
              />
            ) : null}
            <span>{chip.label}</span>
            {chip.count != null ? (
              <span className="chip-n">{chip.count.toLocaleString()}</span>
            ) : null}
          </button>
        ))}
      </div>

      <label className="search-wrap">
        <FaSearch className="search-icon" aria-hidden />
        <input
          className="search-input"
          type="search"
          placeholder="Search posts…"
          aria-label="Search community posts"
        />
      </label>

      <select
        className="sort-select"
        defaultValue={defaultSort}
        aria-label="Sort posts"
      >
        {sortOptions.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
