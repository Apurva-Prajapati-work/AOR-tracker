import type { IconType } from "react-icons";
import {
  FaArrowRight,
  FaBolt,
  FaCheck,
  FaCheckCircle,
  FaChevronUp,
  FaClipboardList,
  FaGithub,
  FaPlus,
  FaStar,
} from "react-icons/fa";
import type { RoadmapStatus } from "./data";

/**
 * Single source of truth for every emoji / inline `<svg>` the roadmap page
 * used to carry from the sample HTML.
 *
 * Centralising here keeps the components import-light, lets us swap an icon
 * in one place, and means `data.ts` never has to ship an emoji literal.
 */

// ─── Column / kanban heading icon ────────────────────────────────────────────

const COLUMN_ICON: Record<RoadmapStatus, IconType> = {
  planned: FaClipboardList,
  "in-progress": FaBolt,
  done: FaCheckCircle,
};

export function ColumnIcon({ status }: { status: RoadmapStatus }) {
  const Icon = COLUMN_ICON[status];
  return <Icon aria-hidden />;
}

// ─── Vote chevron used inside .vote-btn ─────────────────────────────────────

export function VoteChevron() {
  return <FaChevronUp aria-hidden />;
}

// ─── Re-exports for misc usage sites ────────────────────────────────────────

export {
  FaArrowRight as IconArrowRight,
  FaCheck as IconCheck,
  FaGithub as IconGitHub,
  FaPlus as IconPlus,
  FaStar as IconStar,
};
