// FC-style card presentation data. Everything here is DETERMINISTIC demo
// data derived from shirt number + position — no randomness, no invented
// players — until real per-player stats arrive from the backend.

export type TacticsRole = "GK" | "DF" | "MF" | "FW";

export interface TacticsStat {
  readonly key: "PAC" | "SHO" | "PAS" | "DRI" | "DEF" | "PHY";
  readonly label: string;
  readonly value: number;
}

export interface TacticsCardProfile {
  readonly rating: number;
  readonly role: TacticsRole;
  readonly stats: readonly TacticsStat[];
}

const STAT_LABELS: Record<TacticsStat["key"], string> = {
  PAC: "스피드",
  SHO: "슛",
  PAS: "패스",
  DRI: "드리블",
  DEF: "수비",
  PHY: "피지컬",
};

// Role weighting: which stats a role leans on (+) or trails in (-).
const ROLE_BIAS: Record<TacticsRole, Record<TacticsStat["key"], number>> = {
  GK: { PAC: -18, SHO: -30, PAS: -4, DRI: -22, DEF: 22, PHY: 10 },
  DF: { PAC: -2, SHO: -20, PAS: 2, DRI: -8, DEF: 24, PHY: 12 },
  MF: { PAC: 2, SHO: 0, PAS: 16, DRI: 10, DEF: 0, PHY: 0 },
  FW: { PAC: 12, SHO: 22, PAS: 0, DRI: 12, DEF: -24, PHY: 2 },
};

export function resolveTacticsRole(position: string): TacticsRole {
  const value = position.trim().toUpperCase();
  if (value === "GK" || value.includes("골키퍼")) return "GK";
  if (value === "FW" || value.includes("공격") || value.includes("스트라이커") || value.includes("윙어")) return "FW";
  if (value === "DF" || (value.includes("수비") && !value.includes("미드필더"))) return "DF";
  return "MF";
}

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededValue(seed: number, salt: number): number {
  const mixed = Math.imul(seed ^ Math.imul(salt + 1, 0x9e3779b1), 0x85ebca6b);
  return ((mixed >>> 9) % 1000) / 1000;
}

export function tacticsCardProfile(shirtNumber: string, position: string): TacticsCardProfile {
  const role = resolveTacticsRole(position);
  const seed = hashSeed(`${shirtNumber}|${role}`);
  const rating = 96 + Math.round(seededValue(seed, 0) * 32);

  const keys: readonly TacticsStat["key"][] = ["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"];
  const stats = keys.map((key, index) => {
    const base = rating - 14 + Math.round(seededValue(seed, index + 1) * 20);
    const value = Math.min(135, Math.max(55, base + ROLE_BIAS[role][key]));
    return { key, label: STAT_LABELS[key], value };
  });

  return { rating, role, stats };
}
