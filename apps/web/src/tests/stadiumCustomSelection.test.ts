import { describe, expect, it } from "vitest";
import {
  CUSTOM_STADIUM_ID,
  STADIUM_CUSTOM_RECIPE_STORAGE_KEY,
  STADIUM_SELECTION_STORAGE_KEY,
  SERVICE_STADIUM_PRESETS,
  DEFAULT_SERVICE_STADIUM_ID,
  loadCustomStadiumRecipe,
  loadSelectedStadiumId,
  resolveSelectedStadium,
  saveCustomStadiumRecipe,
} from "../features/stadium/stadiumSelection";
import type { StadiumRecipe } from "../three/stadiumWebglV14";

function createMemoryStorage(initial: Record<string, string> = {}) {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

const diyRecipe: StadiumRecipe = {
  tierCount: 2,
  roofCoverage: 0.72,
  crowdDensity: 0.85,
  seatColor: 0x30373d,
  accentColor: 0xa9d4e5,
  columnStyle: "straight",
  presentationProfile: "SERVICE_BUILDER",
  bowlProfile: "STEEP",
  roofProfile: "HALF_CANOPY",
  standProfile: "DOUBLE_DECK",
  seatPattern: "DUO",
  facadeProfile: "SOLID_RIB",
  lightingProfile: "DAYLIGHT",
  environmentProfile: "CIVIC",
};

describe("marketplace-ready preset metadata", () => {
  it("offers at least eight curated stadiums", () => {
    expect(SERVICE_STADIUM_PRESETS.length).toBeGreaterThanOrEqual(8);
  });

  it("labels every preset with a tier for the future item market", () => {
    for (const preset of SERVICE_STADIUM_PRESETS) {
      expect(["FREE", "PREMIUM"]).toContain(preset.tier);
    }
    expect(SERVICE_STADIUM_PRESETS.some((preset) => preset.tier === "PREMIUM")).toBe(true);
    expect(SERVICE_STADIUM_PRESETS[0].tier).toBe("FREE");
  });
});

describe("custom DIY stadium selection", () => {
  it("saves a builder recipe as the active custom stadium", () => {
    const storage = createMemoryStorage();
    saveCustomStadiumRecipe(storage, diyRecipe);

    expect(storage.getItem(STADIUM_SELECTION_STORAGE_KEY)).toBe(CUSTOM_STADIUM_ID);
    const stored = loadCustomStadiumRecipe(storage);
    expect(stored).not.toBeNull();
    expect(stored?.presentationProfile).toBe("SERVICE_HOME");
    expect(stored?.homeView).toBe("INTERIOR");
    expect(stored?.seatColor).toBe(diyRecipe.seatColor);
  });

  it("resolves the custom stadium as a selectable preset", () => {
    const storage = createMemoryStorage();
    saveCustomStadiumRecipe(storage, diyRecipe);

    const selected = resolveSelectedStadium(storage);
    expect(selected.id).toBe(CUSTOM_STADIUM_ID);
    expect(selected.label.length).toBeGreaterThan(0);
    expect(selected.recipe.homeView).toBe("INTERIOR");
  });

  it("falls back to the default when custom is selected but its recipe is missing", () => {
    const storage = createMemoryStorage({ [STADIUM_SELECTION_STORAGE_KEY]: CUSTOM_STADIUM_ID });
    expect(loadSelectedStadiumId(storage)).toBe(DEFAULT_SERVICE_STADIUM_ID);
    expect(resolveSelectedStadium(storage).id).toBe(DEFAULT_SERVICE_STADIUM_ID);
  });

  it("rejects corrupted custom recipes", () => {
    const storage = createMemoryStorage({
      [STADIUM_SELECTION_STORAGE_KEY]: CUSTOM_STADIUM_ID,
      [STADIUM_CUSTOM_RECIPE_STORAGE_KEY]: "{not json",
    });
    expect(loadCustomStadiumRecipe(storage)).toBeNull();
    expect(resolveSelectedStadium(storage).id).toBe(DEFAULT_SERVICE_STADIUM_ID);
  });
});
