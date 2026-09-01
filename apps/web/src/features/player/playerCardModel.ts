import { resolveTacticsRole, tacticsCardProfile, type TacticsRole, type TacticsStat } from "../stadium/teamTacticsCards";

// Presentation model for the player's own card. Identity comes from the
// product contract; the rating and stats are the same deterministic demo
// values the tactical field shows, so one player reads identically on both
// screens until real data arrives.

export type PlayerCardTier = "BRONZE" | "SILVER" | "GOLD";

export interface PlayerCardIdentity {
  readonly displayName: string;
  readonly shirtNumber: string;
  readonly primaryPosition: string;
  readonly secondaryPosition?: string;
}

export interface PlayerCardFace {
  readonly displayName: string;
  readonly shirtNumber: string;
  readonly position: string;
  /** Short code printed on the card face, e.g. CM, LW, GK. */
  readonly positionCode: string;
  readonly secondaryPosition: string | null;
  readonly role: TacticsRole;
  readonly rating: number;
  readonly tier: PlayerCardTier;
  readonly stats: readonly TacticsStat[];
}

export interface CareerHighlight {
  readonly id: string;
  readonly title: string;
  readonly seasonId: string;
  readonly date: string;
  readonly verified: boolean;
}

export interface CareerSummary {
  readonly seasons: number;
  readonly records: number;
  readonly verified: number;
  readonly highlights: readonly CareerHighlight[];
}

export interface CareerChapterLike {
  readonly seasonId: string;
  readonly events: readonly {
    readonly id: string;
    readonly title: string;
    readonly occurredAt: string;
    readonly source?: { readonly verifiedState?: string };
  }[];
}

const POSITION_CODES = ["GK", "LB", "LCB", "CB", "RCB", "RB", "LWB", "RWB", "CDM", "DM", "CM", "CAM", "AM", "LM", "RM", "LW", "RW", "CF", "ST"] as const;

const KOREAN_POSITION_CODES: readonly (readonly [string, string])[] = [
  ["골키퍼", "GK"],
  ["왼쪽 풀백", "LB"],
  ["오른쪽 풀백", "RB"],
  ["수비형 미드필더", "CDM"],
  ["공격형 미드필더", "CAM"],
  ["중앙 미드필더", "CM"],
  ["왼쪽 윙", "LW"],
  ["오른쪽 윙", "RW"],
  ["스트라이커", "ST"],
  ["공격수", "ST"],
  ["센터백", "CB"],
  ["중앙 수비수", "CB"],
  ["측면 수비수", "RB"],
];

const ROLE_FALLBACK_CODE: Record<TacticsRole, string> = { GK: "GK", DF: "CB", MF: "CM", FW: "ST" };

/** The short code a card prints, from either a Korean label or an existing code. */
export function positionCode(position: string): string {
  const upper = position.trim().toUpperCase();
  if ((POSITION_CODES as readonly string[]).includes(upper)) return upper;
  for (const [korean, code] of KOREAN_POSITION_CODES) {
    if (position.includes(korean)) return code;
  }
  return ROLE_FALLBACK_CODE[resolveTacticsRole(position)];
}

export function cardTierForRating(rating: number): PlayerCardTier {
  if (rating >= 120) return "GOLD";
  if (rating >= 105) return "SILVER";
  return "BRONZE";
}

export function buildPlayerCardFace(player: PlayerCardIdentity): PlayerCardFace {
  const profile = tacticsCardProfile(player.shirtNumber, player.primaryPosition);
  return {
    displayName: player.displayName,
    shirtNumber: player.shirtNumber,
    position: player.primaryPosition,
    positionCode: positionCode(player.primaryPosition),
    secondaryPosition: player.secondaryPosition ?? null,
    role: resolveTacticsRole(player.primaryPosition),
    rating: profile.rating,
    tier: cardTierForRating(profile.rating),
    stats: profile.stats,
  };
}

export function summarizeCareer(chapters: readonly CareerChapterLike[]): CareerSummary {
  const highlights: CareerHighlight[] = [];
  for (const chapter of chapters) {
    for (const event of chapter.events) {
      highlights.push({
        id: event.id,
        title: event.title,
        seasonId: chapter.seasonId,
        date: event.occurredAt.slice(0, 10),
        verified: event.source?.verifiedState === "VERIFIED",
      });
    }
  }
  // Newest first: a career screen opens on what just happened.
  highlights.sort((a, b) => b.date.localeCompare(a.date));

  return {
    seasons: chapters.length,
    records: highlights.length,
    verified: highlights.filter((highlight) => highlight.verified).length,
    highlights,
  };
}
