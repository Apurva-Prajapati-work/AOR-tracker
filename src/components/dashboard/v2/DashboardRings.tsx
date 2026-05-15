"use client";

import {
  FaBullhorn,
  FaCheckCircle,
  FaRegClock,
} from "react-icons/fa";
import { DN_INFO_CARDS, type DnInfoCard } from "./data";

const CARD_ICONS = {
  journey: FaRegClock,
  "cohort-ppr": FaCheckCircle,
  "weekly-ppr": FaBullhorn,
} as const;

function InfoCard({ card }: { card: DnInfoCard }) {
  const Icon = CARD_ICONS[card.id as keyof typeof CARD_ICONS] ?? FaRegClock;

  return (
    <div className="info-card">
      <div className="card-label">
        <Icon className="card-label-icon" aria-hidden />
        {card.label}
        <button
          type="button"
          className="tooltip-btn"
          title={card.tooltip}
          aria-label={card.tooltip}
        >
          ?
        </button>
      </div>
      <div
        className={`card-val${card.valueTone === "teal" ? " teal" : ""}`}
      >
        {card.value}
      </div>
      <div className="card-note">{card.note}</div>
      <div className="card-explain">{card.explain}</div>
    </div>
  );
}

/**
 * Three stat cards: journey progress, cohort approval rate, weekly approvals.
 *
 * Sample reference: `.cards-row` / `.info-card` in `samples/pr-tracker-redesign.html`.
 */
export function DashboardRings({
  cards = DN_INFO_CARDS,
}: {
  cards?: DnInfoCard[];
} = {}) {
  return (
    <div className="cards-row">
      {cards.map((card) => (
        <InfoCard key={card.id} card={card} />
      ))}
    </div>
  );
}
