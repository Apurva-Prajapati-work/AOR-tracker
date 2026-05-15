import { humanizeCohortKey } from "@/lib/cohort";
import { MILESTONE_DEFS } from "@/lib/constants";
import type { MilestoneKey } from "@/lib/types";

const WEBHOOK_TIMEOUT_MS = 4000;

function shouldSkipDiscordForEmail(emailNorm: string): boolean {
  if (emailNorm === "demo@aortrack.ca") return true;
  if (emailNorm.startsWith("aortracker.demo.")) return true;
  return false;
}

export function milestoneLabelForKey(key: string): string {
  return MILESTONE_DEFS.find((d) => d.key === key)?.label ?? key;
}

export type DiscordNotifyPayload =
  | {
      kind: "profile_saved";
      email: string;
      cohortKey: string;
      stream: string;
      type: string;
      province: string;
      aorDate: string;
    }
  | {
      kind: "milestone";
      email: string;
      cohortKey: string;
      stream: string;
      type: string;
      province: string;
      milestoneKey: MilestoneKey;
      milestoneLabel: string;
      date: string | null;
    };

function baseDescriptionLines(payload: {
  email: string;
  stream: string;
  type: string;
  province: string;
  cohortKey: string;
}): string[] {
  const human = humanizeCohortKey(payload.cohortKey);
  return [
    `**Email:** ${payload.email}`,
    `**Stream:** ${payload.stream}`,
    `**Type:** ${payload.type}`,
    `**Province:** ${payload.province}`,
    `**Cohort key:** \`${payload.cohortKey}\``,
    `**Cohort:** ${human}`,
  ];
}

function embedTitle(payload: DiscordNotifyPayload): string {
  switch (payload.kind) {
    case "profile_saved":
      return "Profile saved (onboarding / update)";
    case "milestone":
      return "Milestone updated";
  }
}

function embedDescription(payload: DiscordNotifyPayload): string {
  const lines = baseDescriptionLines(payload);
  if (payload.kind === "profile_saved") {
    const aor = payload.aorDate?.trim();
    lines.push(`**AOR date:** ${aor || "—"}`);
  }
  if (payload.kind === "milestone") {
    const dateLine = payload.date?.trim() ? payload.date : "cleared";
    lines.push(
      `**Milestone:** ${payload.milestoneLabel} (\`${payload.milestoneKey}\`)`,
    );
    lines.push(`**Date:** ${dateLine}`);
  }
  return lines.join("\n");
}

export async function notifyDiscordProfileEvent(
  payload: DiscordNotifyPayload,
): Promise<void> {
  const url = process.env.DISCORD_WEBHOOK_URL?.trim();
  if (!url) return;
  if (shouldSkipDiscordForEmail(payload.email)) return;

  const body = JSON.stringify({
    embeds: [
      {
        title: embedTitle(payload),
        description: embedDescription(payload),
        color: 0x5865f2,
        timestamp: new Date().toISOString(),
      },
    ],
  });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), WEBHOOK_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(
        "[discord-webhook] non-OK response",
        res.status,
        res.statusText,
        text.slice(0, 500),
      );
    }
  } catch (e) {
    console.warn("[discord-webhook] request failed", e);
  } finally {
    clearTimeout(timer);
  }
}
