import { describe, expect, it } from "vitest";
import { buildPlayerCardFace, cardTierForRating, summarizeCareer } from "../features/player/playerCardModel";

const player = {
  id: "demo-player-08",
  displayName: "데모 선수",
  shirtNumber: "8",
  primaryPosition: "중앙 미드필더",
  secondaryPosition: "수비형 미드필더",
};

const chapters = [
  {
    seasonId: "fixture-2026",
    events: [
      {
        id: "career-1",
        title: "FIXTURE U17 A팀 합류",
        occurredAt: "2026-03-01T00:00:00Z",
        source: { verifiedState: "VERIFIED" },
      },
      {
        id: "career-2",
        title: "리그 데뷔",
        occurredAt: "2026-04-11T00:00:00Z",
        source: { verifiedState: "UNVERIFIED" },
      },
    ],
  },
  {
    seasonId: "fixture-2025",
    events: [
      {
        id: "career-3",
        title: "아카데미 등록",
        occurredAt: "2025-09-02T00:00:00Z",
        source: { verifiedState: "VERIFIED" },
      },
    ],
  },
];

describe("card tiers", () => {
  it("reads a rating as a bronze, silver or gold card", () => {
    expect(cardTierForRating(132)).toBe("GOLD");
    expect(cardTierForRating(120)).toBe("GOLD");
    expect(cardTierForRating(119)).toBe("SILVER");
    expect(cardTierForRating(105)).toBe("SILVER");
    expect(cardTierForRating(104)).toBe("BRONZE");
    expect(cardTierForRating(90)).toBe("BRONZE");
  });
});

describe("buildPlayerCardFace", () => {
  it("carries the player's own identity onto the card", () => {
    const face = buildPlayerCardFace(player);
    expect(face.shirtNumber).toBe("8");
    expect(face.displayName).toBe("데모 선수");
    expect(face.position).toBe("중앙 미드필더");
    expect(face.role).toBe("MF");
  });

  it("uses the same demo rating the tactical card shows", () => {
    const face = buildPlayerCardFace(player);
    expect(face.rating).toBeGreaterThanOrEqual(90);
    expect(face.rating).toBeLessThanOrEqual(132);
    expect(face.stats).toHaveLength(6);
    expect(face.tier).toBe(cardTierForRating(face.rating));
  });

  it("is deterministic so the card never changes between visits", () => {
    expect(buildPlayerCardFace(player)).toEqual(buildPlayerCardFace(player));
  });

  it("keeps the secondary position when there is one", () => {
    expect(buildPlayerCardFace(player).secondaryPosition).toBe("수비형 미드필더");
    expect(buildPlayerCardFace({ ...player, secondaryPosition: undefined }).secondaryPosition).toBeNull();
  });
});

describe("summarizeCareer", () => {
  it("counts seasons, records and how many are verified", () => {
    const summary = summarizeCareer(chapters);
    expect(summary.seasons).toBe(2);
    expect(summary.records).toBe(3);
    expect(summary.verified).toBe(2);
  });

  it("lists highlights newest first", () => {
    const summary = summarizeCareer(chapters);
    expect(summary.highlights.map((highlight) => highlight.id)).toEqual(["career-2", "career-1", "career-3"]);
    expect(summary.highlights[0].date).toBe("2026-04-11");
    expect(summary.highlights[0].verified).toBe(false);
    expect(summary.highlights[1].verified).toBe(true);
  });

  it("handles a player with no career records yet", () => {
    const summary = summarizeCareer([]);
    expect(summary).toEqual({ seasons: 0, records: 0, verified: 0, highlights: [] });
  });
});
