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
