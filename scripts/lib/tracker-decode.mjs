/**
 * Decode tracker API obfuscated row fields → milestone ISO dates.
 */

/** Obfuscated API keys → internal milestone key */
export const TRACKER_FIELD_KEYS = {
  aor: "xuset-kavav-casez-nypek-sybet-synyg-nocan-tyzef-tyxux",
  biometrics: "ximos-bykys-likus-nifob-nomum-nytuh-modoz-hezug-myxyx",
  background: "xepot-nucyl-vycon-nivid-micim-rigal-semag-fyzyz-tixyx",
  medical: "xedac-zyfyn-zylof-cedok-rahem-sirit-tafoh-pygap-poxex",
  p1: "xizon-mupof-fyzys-sogys-lipil-cyvez-lifyr-nyzic-lexix",
  p2: "xocoz-vubum-bifub-mitak-varab-habog-genyl-ginat-kaxyx",
  ecopr: "xufad-nuraz-bapaz-pinyt-gydoz-nenaf-kipah-rapac-texux",
};

export const MILESTONE_KEYS = Object.keys(TRACKER_FIELD_KEYS);

/** @param {unknown} cell */
export function parseTrackerDate(cell) {
  if (cell == null || cell === "") return null;
  const str = String(cell).trim().replace(/\s+/g, " ");
  if (!str) return null;
  // Source uses "Jan 19, 2024" — comma form must not get T12:00:00 appended
  const d = str.includes(",")
    ? new Date(str)
    : new Date(`${str}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

/** @param {string} raw */
export function normalizeCaseNo(raw) {
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  if (/^case-\d+$/i.test(s)) return s;
  const digits = s.replace(/^case-?/i, "").replace(/\D/g, "");
  if (!digits) return null;
  return `case-${digits}`;
}

/**
 * @param {Record<string, unknown>} row
 * @returns {{ caseNo: string, username: string, milestones: Record<string, string|null> } | null}
 */
export function decodeRow(row) {
  const username = row.username;
  if (!Array.isArray(username) || !username[1]) return null;
  const caseNo = normalizeCaseNo(String(username[1]));
  if (!caseNo) return null;

  /** @type {Record<string, string|null>} */
  const milestones = {};
  for (const [key, field] of Object.entries(TRACKER_FIELD_KEYS)) {
    milestones[key] = parseTrackerDate(row[field]);
  }
  return {
    caseNo,
    username: String(username[0] ?? "").trim(),
    milestones,
  };
}

/**
 * §7.1 merge: AOR never overwritten once set; other milestones take earliest date.
 * @param {string|null} dbDate
 * @param {string|null} sourceDate
 * @param {string} key
 */
export function planMilestoneUpdate(dbDate, sourceDate, key) {
  if (key === "aor" && dbDate) {
    if (!sourceDate || sourceDate === dbDate) {
      return { action: "unchanged", proposed: dbDate };
    }
    return {
      action: "skip_aor_locked",
      proposed: dbDate,
      source: sourceDate,
    };
  }
  if (!sourceDate) {
    return { action: "unchanged", proposed: dbDate ?? null };
  }
  if (!dbDate) {
    return { action: "fill", proposed: sourceDate };
  }
  if (sourceDate === dbDate) {
    return { action: "unchanged", proposed: dbDate };
  }
  if (sourceDate < dbDate) {
    return {
      action: "earlier",
      proposed: sourceDate,
      db: dbDate,
      source: sourceDate,
    };
  }
  return {
    action: "skip_regress",
    proposed: dbDate,
    db: dbDate,
    source: sourceDate,
  };
}

/** @param {{ action: string }} plan */
export function wouldApply(plan) {
  return plan.action === "fill" || plan.action === "earlier";
}
