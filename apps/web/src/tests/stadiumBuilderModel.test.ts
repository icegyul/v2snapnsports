import { describe, expect, it } from "vitest";
import {
  DEFAULT_STADIUM_BUILDER_PRESET_ID,
  STADIUM_BUILDER_PRESETS,
  STADIUM_BUILDER_STEPS,
  STADIUM_BUILDER_STORAGE_KEY,
  STADIUM_STYLE_FAMILIES,
  applyStadiumBuilderPreset,
  createStadiumBuilderDraft,
  loadStadiumBuilderDraft,
  saveStadiumBuilderDraft,
  stadiumBuilderDraftToRecipe,
  validateStadiumBuilderDraft,
  type StadiumBuilderStorage,
} from "../features/stadium-builder/stadiumBuilderModel";

class MemoryStorage implements StadiumBuilderStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  setRaw(value: string): void {
    this.values.set(STADIUM_BUILDER_STORAGE_KEY, value);
  }
}

describe("Stadium Builder model", () => {
  it("locks the guided seven-step builder order", () => {
    expect(STADIUM_BUILDER_STEPS).toEqual([
      "STYLE",
      "BOWL",
      "ROOF",
      "STAND",
      "SEAT",
      "FACADE_LIGHT",
      "ENVIRONMENT",
    ]);
  });

  it("provides ten generic style families and twenty unique presets", () => {
    expect(STADIUM_STYLE_FAMILIES).toHaveLength(10);
    expect(new Set(STADIUM_STYLE_FAMILIES).size).toBe(10);
    expect(STADIUM_BUILDER_PRESETS).toHaveLength(20);
    expect(new Set(STADIUM_BUILDER_PRESETS.map((preset) => preset.id)).size).toBe(20);

    for (const family of STADIUM_STYLE_FAMILIES) {
      expect(STADIUM_BUILDER_PRESETS.filter((preset) => preset.family === family)).toHaveLength(2);
    }
  });

  it("keeps every shipped preset compatible with the current renderer contract", () => {
    for (const preset of STADIUM_BUILDER_PRESETS) {
      const draft = createStadiumBuilderDraft(preset.id);
      const validation = validateStadiumBuilderDraft(draft);
      expect(validation.errors, preset.id).toEqual([]);
      expect(validation.valid, preset.id).toBe(true);
    }
  });

  it("converts the default builder draft into the existing Three.js recipe", () => {
    const draft = createStadiumBuilderDraft(DEFAULT_STADIUM_BUILDER_PRESET_ID);
    const recipe = stadiumBuilderDraftToRecipe(draft);

    expect(recipe).toEqual({
      tierCount: 3,
      roofCoverage: 0.84,
      crowdDensity: 0.90,
      seatColor: 0x17344f,
      accentColor: 0x159bd2,
      columnStyle: "y",
    });
  });

  it("rejects incompatible roof and stand combinations without silently repairing them", () => {
    const draft = createStadiumBuilderDraft();
    const invalid = {
      ...draft,
      bowl: { ...draft.bowl, tierCount: 3 as const },
      roof: { ...draft.roof, coverage: 0.72, profile: "OPEN_RING" as const },
      stand: { profile: "DOUBLE_DECK" as const },
    };
    const validation = validateStadiumBuilderDraft(invalid);

    expect(validation.valid).toBe(false);
    expect(validation.errors.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      "OPEN_RING_COVERAGE",
      "STAND_TIER_MISMATCH",
    ]));
  });

  it("emits a semantic warning for daylight lighting in a night-event environment", () => {
    const draft = createStadiumBuilderDraft("night-event-cyan");
    const warned = {
      ...draft,
      facadeLight: { ...draft.facadeLight, lighting: "DAYLIGHT" as const },
    };
    const validation = validateStadiumBuilderDraft(warned);

    expect(validation.valid).toBe(true);
    expect(validation.warnings.map((issue) => issue.code)).toContain("NIGHT_DAYLIGHT_MISMATCH");
  });

  it("applies a preset without overwriting the caller revision", () => {
    const initial = { ...createStadiumBuilderDraft(), revision: 7 };
    const changed = applyStadiumBuilderPreset(initial, "open-air-park");

    expect(changed.selectedPresetId).toBe("open-air-park");
    expect(changed.styleFamily).toBe("OPEN_AIR");
    expect(changed.revision).toBe(7);
  });

  it("persists a draft with revision increments and rejects a stale writer", () => {
    const storage = new MemoryStorage();
    const firstDraft = createStadiumBuilderDraft();
    const first = saveStadiumBuilderDraft(storage, firstDraft, 0);
    expect(first.status).toBe("SAVED");
    if (first.status !== "SAVED") throw new Error("expected initial save");
    expect(first.draft.revision).toBe(1);
    expect(loadStadiumBuilderDraft(storage)?.revision).toBe(1);

    const latest = applyStadiumBuilderPreset(first.draft, "green-park-two");
    const second = saveStadiumBuilderDraft(storage, latest, 1);
    expect(second.status).toBe("SAVED");
    if (second.status !== "SAVED") throw new Error("expected second save");
    expect(second.draft.revision).toBe(2);

    const stale = saveStadiumBuilderDraft(storage, first.draft, 1);
    expect(stale.status).toBe("CONFLICT");
    if (stale.status !== "CONFLICT") throw new Error("expected conflict");
    expect(stale.current.revision).toBe(2);
    expect(stale.current.selectedPresetId).toBe("green-park-two");
  });

  it("does not hydrate malformed local drafts", () => {
    const storage = new MemoryStorage();
    storage.setRaw("not json");
    expect(loadStadiumBuilderDraft(storage)).toBeNull();

    storage.setRaw(JSON.stringify({ schemaVersion: 99, revision: 8 }));
    expect(loadStadiumBuilderDraft(storage)).toBeNull();
  });
});
