export const GH = "https://github.com/Get-North-Path/AOR-tracker";
export const DISCORD_INVITE = "https://discord.gg/aortrack";

export function fmtCompactK(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  const s = k >= 10 ? String(Math.round(k)) : k.toFixed(1).replace(/\.0$/, "");
  return `${s}k`;
}
