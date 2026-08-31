import { describe, expect, it } from "vitest";
import { BASE_STADIUM_RECIPE } from "../three/stadiumWebglV14";
import { resolveSeatPatternColor, resolveStadiumVisualProfile } from "../three/stadiumVisualProfile";

describe("Stadium Builder visual profile", () => {
  it("keeps the canonical non-builder renderer neutral", () => {
    expect(resolveStadiumVisualProfile(BASE_STADIUM_RECIPE)).toMatchObject({
      builderVisuals: false,
      bowlRadiusScale: 1,
      tierRiseScale: 1,
      facadeRibCount: 64,
      clearAlpha: 0,
    });
  });

  it("resolves visibly distinct park daylight and night event art direction", () => {
    const park = resolveStadiumVisualProfile({
      ...BASE_STADIUM_RECIPE,
      bowlProfile: "BALANCED",
      roofProfile: "OPEN_RING",
      standProfile: "SINGLE_BOWL",
      lightingProfile: "DAYLIGHT",
      environmentProfile: "PARK",
      facadeProfile: "LIGHT_FRAME",
    });
    const night = resolveStadiumVisualProfile({
      ...BASE_STADIUM_RECIPE,
      bowlProfile: "STEEP",
      roofProfile: "FULL_CANOPY",
      standProfile: "TRIPLE_DECK",
      lightingProfile: "EVENT",
      environmentProfile: "NIGHT_EVENT",
      facadeProfile: "SOLID_RIB",
    });

    expect(park).toMatchObject({
      builderVisuals: true,
      facadeRibCount: 32,
      clearAlpha: 1,
    });
    expect(night).toMatchObject({
      builderVisuals: true,
      facadeRibCount: 80,
      clearAlpha: 1,
    });
    expect(park.keyIntensity).toBeGreaterThan(night.keyIntensity);
    expect(park.exposure).toBeGreaterThanOrEqual(1.18);
    expect(night.exposure).toBeGreaterThanOrEqual(1.25);
    expect(park.skyTop).not.toBe(night.skyTop);
    expect(park.skyHorizon).not.toBe(night.skyHorizon);
    expect(park.tierRiseScale).not.toBe(night.tierRiseScale);
  });
});

describe("Stadium seat pattern color", () => {
  const recipe = { ...BASE_STADIUM_RECIPE, seatColor: 0x102030, accentColor: 0x80d8ff };

  it("keeps MONO seats uniform and gives DUO a broad accent band", () => {
    expect(resolveSeatPatternColor({ ...recipe, seatPattern: "MONO" }, 0, 120)).toBe(0x102030);
    expect(resolveSeatPatternColor({ ...recipe, seatPattern: "MONO" }, 84, 120)).toBe(0x102030);
    expect(resolveSeatPatternColor({ ...recipe, seatPattern: "DUO" }, 2, 120)).toBe(0x80d8ff);
    expect(resolveSeatPatternColor({ ...recipe, seatPattern: "DUO" }, 20, 120)).toBe(0x102030);
  });

  it("moves GRADIENT seats from near-base to near-accent across a row", () => {
    const first = resolveSeatPatternColor({ ...recipe, seatPattern: "GRADIENT" }, 0, 120);
    const last = resolveSeatPatternColor({ ...recipe, seatPattern: "GRADIENT" }, 119, 120);

    expect(first).not.toBe(last);
    expect(first).not.toBe(0x80d8ff);
    expect(last).not.toBe(0x102030);
  });
});
