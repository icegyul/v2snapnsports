import { describe, expect, it } from "vitest";
import {
  DEFAULT_SERVICE_STADIUM_ID,
  SERVICE_STADIUM_PRESETS,
  STADIUM_SELECTION_STORAGE_KEY,
  getServiceStadiumPreset,
  loadSelectedStadiumId,
  resolveSelectedStadiumRecipe,
  saveSelectedStadiumId,
} from "../features/stadium/stadiumSelection";
import { BASE_STADIUM_ACCEPTANCE_RECIPE } from "../three/stadiumWebglV151";

function createMemoryStorage(initial: Record<string, string> = {}) {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

describe("service stadium presets", () => {
  it("offers at least four selectable stadiums with unique ids", () => {
    expect(SERVICE_STADIUM_PRESETS.length).toBeGreaterThanOrEqual(4);
    const ids = SERVICE_STADIUM_PRESETS.map((preset) => preset.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("labels every preset for the picker UI", () => {
    for (const preset of SERVICE_STADIUM_PRESETS) {
      expect(preset.label.length).toBeGreaterThan(0);
      expect(preset.tagline.length).toBeGreaterThan(0);
      expect(preset.swatch.from).toMatch(/^#[0-9a-f]{6}$/i);
      expect(preset.swatch.to).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("targets the SERVICE_HOME presentation for every recipe", () => {
    for (const preset of SERVICE_STADIUM_PRESETS) {
      expect(preset.recipe.presentationProfile).toBe("SERVICE_HOME");
    }
  });

  it("keeps the default stadium identical to the pre-selection home look", () => {
    const fallback = getServiceStadiumPreset(DEFAULT_SERVICE_STADIUM_ID);
    expect(fallback).not.toBeNull();
    expect(fallback?.recipe).toEqual(BASE_STADIUM_ACCEPTANCE_RECIPE);
  });

  it("returns null for an unknown preset id", () => {
    expect(getServiceStadiumPreset("no-such-stadium")).toBeNull();
  });
});

describe("stadium selection persistence", () => {
  it("falls back to the default id when nothing is stored", () => {
    expect(loadSelectedStadiumId(createMemoryStorage())).toBe(DEFAULT_SERVICE_STADIUM_ID);
  });

  it("falls back to the default id when the stored id is unknown", () => {
    const storage = createMemoryStorage({ [STADIUM_SELECTION_STORAGE_KEY]: "deleted-preset" });
    expect(loadSelectedStadiumId(storage)).toBe(DEFAULT_SERVICE_STADIUM_ID);
  });

  it("round-trips a valid selection", () => {
    const storage = createMemoryStorage();
    const target = SERVICE_STADIUM_PRESETS[1].id;
    expect(saveSelectedStadiumId(storage, target)).toBe(true);
    expect(loadSelectedStadiumId(storage)).toBe(target);
  });

  it("rejects saving an unknown preset id", () => {
    const storage = createMemoryStorage();
    expect(saveSelectedStadiumId(storage, "no-such-stadium")).toBe(false);
    expect(loadSelectedStadiumId(storage)).toBe(DEFAULT_SERVICE_STADIUM_ID);
  });

  it("resolves the stored preset recipe for the home renderer", () => {
    const storage = createMemoryStorage();
    const target = SERVICE_STADIUM_PRESETS[1];
    saveSelectedStadiumId(storage, target.id);
    expect(resolveSelectedStadiumRecipe(storage)).toEqual(target.recipe);
  });

  it("resolves the default recipe when storage is empty", () => {
    expect(resolveSelectedStadiumRecipe(createMemoryStorage())).toEqual(BASE_STADIUM_ACCEPTANCE_RECIPE);
  });
});
