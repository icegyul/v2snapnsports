import type { StadiumRecipe } from "./stadiumWebglV14";

export interface StadiumVisualProfile {
  readonly builderVisuals: boolean;
  readonly bowlRadiusScale: number;
  readonly tierRiseScale: number;
  readonly roofLift: number;
  readonly facadeRibCount: number;
  readonly clearAlpha: 0 | 1;
  readonly skyTop: number;
  readonly skyHorizon: number;
  readonly groundColor: number;
  readonly practicalColor: number;
  readonly keyColor: number;
  readonly keyIntensity: number;
  readonly fillIntensity: number;
  readonly hemisphereIntensity: number;
  readonly exposure: number;
}

function mixColor(left: number, right: number, ratio: number): number {
  const amount = Math.min(1, Math.max(0, ratio));
  const red = Math.round(((left >> 16) & 0xff) + (((right >> 16) & 0xff) - ((left >> 16) & 0xff)) * amount);
  const green = Math.round(((left >> 8) & 0xff) + (((right >> 8) & 0xff) - ((left >> 8) & 0xff)) * amount);
  const blue = Math.round((left & 0xff) + ((right & 0xff) - (left & 0xff)) * amount);
  return (red << 16) | (green << 8) | blue;
}

export function resolveSeatPatternColor(recipe: StadiumRecipe, slot: number, peoplePerRow: number): number {
  const pattern = recipe.seatPattern ?? "DUO";
  if (pattern === "MONO") return recipe.seatColor;
  if (pattern === "DUO") return Math.floor((slot % peoplePerRow) / 12) % 2 === 0 ? recipe.accentColor : recipe.seatColor;
  const progress = (slot % peoplePerRow) / Math.max(1, peoplePerRow - 1);
  return mixColor(recipe.seatColor, recipe.accentColor, 0.08 + progress * 0.84);
}

const ENVIRONMENT_COLORS = {
  URBAN: { skyTop: 0x142330, skyHorizon: 0x6e8794, groundColor: 0x141c21, practicalColor: 0x87cce8 },
  PARK: { skyTop: 0x14302d, skyHorizon: 0x89a99a, groundColor: 0x122019, practicalColor: 0xb8e1bb },
  COASTAL: { skyTop: 0x163747, skyHorizon: 0x8fc0d3, groundColor: 0x10232c, practicalColor: 0xb9eaff },
  CIVIC: { skyTop: 0x182936, skyHorizon: 0x718a96, groundColor: 0x151e23, practicalColor: 0xb8dce9 },
  NIGHT_EVENT: { skyTop: 0x02040a, skyHorizon: 0x1f3654, groundColor: 0x070b10, practicalColor: 0x65d9ff },
} as const;

export function resolveStadiumVisualProfile(recipe: StadiumRecipe): StadiumVisualProfile {
  const builderVisuals = Boolean(
    recipe.bowlProfile
    || recipe.roofProfile
    || recipe.standProfile
    || recipe.seatPattern
    || recipe.facadeProfile
    || recipe.lightingProfile
    || recipe.environmentProfile,
  );
  const environment = recipe.environmentProfile ?? "CIVIC";
  const colors = ENVIRONMENT_COLORS[environment];

  if (!builderVisuals) {
    return {
      builderVisuals: false,
      bowlRadiusScale: 1,
      tierRiseScale: 1,
      roofLift: 0,
      facadeRibCount: 64,
      clearAlpha: 0,
      skyTop: colors.skyTop,
      skyHorizon: colors.skyHorizon,
      groundColor: colors.groundColor,
      practicalColor: colors.practicalColor,
      keyColor: 0xe7eff5,
      keyIntensity: 1.38,
      fillIntensity: 0.38,
      hemisphereIntensity: 0.84,
      exposure: 1.02,
    };
  }

  const lighting = recipe.lightingProfile ?? "BALANCED";
  return {
    builderVisuals: true,
    bowlRadiusScale: recipe.bowlProfile === "COMPACT" ? 0.92 : recipe.bowlProfile === "STEEP" ? 0.97 : 1,
    tierRiseScale: recipe.bowlProfile === "COMPACT" ? 0.9 : recipe.bowlProfile === "STEEP" ? 1.12 : 1,
    roofLift: recipe.roofProfile === "OPEN_RING" ? 0 : recipe.roofProfile === "HALF_CANOPY" ? 1.4 : 2.2,
    facadeRibCount: recipe.facadeProfile === "LIGHT_FRAME" ? 32 : recipe.facadeProfile === "SOLID_RIB" ? 80 : 48,
    clearAlpha: 1,
    skyTop: colors.skyTop,
    skyHorizon: colors.skyHorizon,
    groundColor: colors.groundColor,
    practicalColor: colors.practicalColor,
    keyColor: lighting === "EVENT" ? 0xbadfff : lighting === "DAYLIGHT" ? 0xfff1d4 : 0xe7eff5,
    keyIntensity: lighting === "DAYLIGHT" ? 2.15 : lighting === "EVENT" ? 1.35 : 1.7,
    fillIntensity: lighting === "DAYLIGHT" ? 0.74 : lighting === "EVENT" ? 0.38 : 0.52,
    hemisphereIntensity: lighting === "DAYLIGHT" ? 1.28 : lighting === "EVENT" ? 0.78 : 1.05,
    exposure: lighting === "DAYLIGHT" ? 1.24 : lighting === "EVENT" ? 1.32 : 1.18,
  };
}
