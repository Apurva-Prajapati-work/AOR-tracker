#!/usr/bin/env node
/**
 * Fetch CEC tracker JSON from tracker → tracker-json/<range>.json
 *
 * Filename convention: 100.json = start 0, 200.json = start 100, etc.
 *
 * Usage:
 *   node scripts/fetch-tracker-json.mjs --all
 *   node scripts/fetch-tracker-json.mjs --from 100 --to 500
 *   npm run tracker:fetch
 *
 * Env (.env / .env.local):
 *   TRACKER_COOKIE     — required (analytics cookies are stripped automatically)
 *   TRACKER_TRACKER    — optional, default cec-express-entry-tracker
 *   TRACKER_DELAY_MS   — optional, default 800
 *   TRACKER_*      — legacy aliases for the TRACKER_* vars above
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "tracker-json");

const STEP = 100;
const AOR_SORT_KEY =
  "xuset-kavav-casez-nypek-sybet-synyg-nocan-tyzef-tyxux";

function envVar(primary, legacy) {
  return process.env[primary]?.trim() || process.env[legacy]?.trim() || "";
}

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const envPath = path.join(root, file);
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!m) continue;
      let value = m[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[m[1]] == null) process.env[m[1]] = value;
    }
  }
}

/** Keep only session cookies — full cookie string can exceed nginx header limits. */
function slimCookie(raw) {
  const keep = new Set(["_honshu_session", "remember_user_token", "l"]);
  return raw
    .split(";")
    .map((part) => part.trim())
    .filter((part) => {
      const name = part.split("=")[0];
      return keep.has(name);
    })
    .join("; ");
}

function parseArgs(argv) {
  const opts = {
    all: false,
    from: null,
    to: null,
    force: false,
    delayMs: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--all") opts.all = true;
    else if (arg === "--force") opts.force = true;
    else if (arg === "--from") opts.from = Number(argv[++i]);
    else if (arg === "--to") opts.to = Number(argv[++i]);
    else if (arg === "--delay") opts.delayMs = Number(argv[++i]);
  }
  return opts;
}

function rangeToStart(range) {
  return range - STEP;
}

function startToRange(start) {
  return start + STEP;
}

function buildCasesUrl(tracker, start) {
  const filter = JSON.stringify({ state: ["Active"] });
  const sort = JSON.stringify([
    [AOR_SORT_KEY, "desc"],
    ["updated", "desc"],
  ]);
  const url = new URL(
    `https://myimmitracker.com/en/ca/trackers/${tracker}/cases`,
  );
  url.searchParams.set("start", String(start));
  url.searchParams.set("filter", filter);
  url.searchParams.set("sort", sort);
  return url.toString();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(tracker, start, cookie) {
  const url = buildCasesUrl(tracker, start);
  const res = await fetch(url, {
    headers: {
      Cookie: cookie,
      Accept: "application/json, text/plain, */*",
      "X-Requested-With": "XMLHttpRequest",
      Referer: `https://myimmitracker.com/en/ca/trackers/${tracker}`,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for start=${start}: ${text.slice(0, 200)}`);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response for start=${start}: ${text.slice(0, 200)}`);
  }

  if (!Array.isArray(data.values)) {
    throw new Error(`Unexpected payload for start=${start} (no values array)`);
  }

  return data;
}

async function main() {
  loadEnv();

  const cookieRaw = envVar("TRACKER_COOKIE", "TRACKER_COOKIE");
  if (!cookieRaw) {
    console.error(
      "TRACKER_COOKIE is not set (TRACKER_COOKIE accepted). Add to .env or .env.local.",
    );
    process.exit(1);
  }

  const cookie = slimCookie(cookieRaw);
  if (!cookie) {
    console.error(
      "TRACKER_COOKIE has no session cookies (_honshu_session / remember_user_token).",
    );
    process.exit(1);
  }

  const tracker =
    envVar("TRACKER_TRACKER", "TRACKER_TRACKER") ||
    "cec-express-entry-tracker";
  const delayMs =
    Number(envVar("TRACKER_DELAY_MS", "TRACKER_DELAY_MS")) ||
    parseArgs(process.argv.slice(2)).delayMs ||
    800;

  const opts = parseArgs(process.argv.slice(2));
  fs.mkdirSync(outDir, { recursive: true });

  let written = 0;
  let rows = 0;

  if (opts.all) {
    const probe = await fetchPage(tracker, 0, cookie);
    const total = probe.total_cases_count ?? 0;
    console.log(`Total cases on tracker: ${total}`);

    const firstPath = path.join(outDir, `${startToRange(0)}.json`);
    if (opts.force || !fs.existsSync(firstPath)) {
      fs.writeFileSync(firstPath, JSON.stringify(probe, null, 4) + "\n");
      written++;
      rows += probe.values.length;
      console.log(`  wrote ${startToRange(0)}.json (${probe.values.length} rows)`);
    } else {
      console.log(`  skip ${startToRange(0)}.json (exists)`);
    }

    for (let start = STEP; start < total; start += STEP) {
      const range = startToRange(start);
      const outPath = path.join(outDir, `${range}.json`);
      if (!opts.force && fs.existsSync(outPath)) {
        console.log(`  skip ${range}.json (exists)`);
        continue;
      }

      await sleep(delayMs);
      const data = await fetchPage(tracker, start, cookie);
      fs.writeFileSync(outPath, JSON.stringify(data, null, 4) + "\n");
      written++;
      rows += data.values.length;
      console.log(`  wrote ${range}.json (start=${start}, ${data.values.length} rows)`);

      if (data.values.length === 0) break;
    }
  } else if (opts.from != null && opts.to != null) {
    for (let range = opts.from; range <= opts.to; range += STEP) {
      const outPath = path.join(outDir, `${range}.json`);
      if (!opts.force && fs.existsSync(outPath)) {
        console.log(`  skip ${range}.json (exists, use --force to overwrite)`);
        continue;
      }

      await sleep(delayMs);
      const start = rangeToStart(range);
      const data = await fetchPage(tracker, start, cookie);
      fs.writeFileSync(outPath, JSON.stringify(data, null, 4) + "\n");
      written++;
      rows += data.values.length;
      console.log(
        `  wrote ${range}.json (start=${start}, ${data.values.length} rows)`,
      );

      if (data.values.length === 0) break;
    }
  } else {
    console.error(
      "Usage: node scripts/fetch-tracker-json.mjs --all | --from 100 --to 500 [--force] [--delay 800]",
    );
    process.exit(1);
  }

  console.log(`Done: ${written} file(s) written, ${rows} rows fetched → ${outDir}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
