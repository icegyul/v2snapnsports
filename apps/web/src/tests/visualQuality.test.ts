import { describe, expect, it } from "vitest";
import {
  VISUAL_QUALITY_STORAGE_KEY,
  clearVisualQualityPreference,
  readVisualQualityPreference,
  resolveVisualMode,
} from "../features/core/visualQuality";

function memoryStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
}

describe("resolveVisualMode", () => {
  it("uses what the product asked for when nothing overrides it", () => {
    expect(resolveVisualMode("FULL", "", memoryStorage())).toBe("FULL");
    expect(resolveVisualMode("LIGHT", "", memoryStorage())).toBe("LIGHT");
  });

  it("lets a link pin the quality, whatever the product asked for", () => {
    expect(resolveVisualMode("FULL", "?quality=light", memoryStorage())).toBe("LIGHT");
    expect(resolveVisualMode("FULL", "?quality=STATIC", memoryStorage())).toBe("STATIC");
    expect(resolveVisualMode("FULL", "?foo=1&quality=fast", memoryStorage())).toBe("FAST");
  });

  it("remembers a pinned quality so it survives the next page", () => {
    const storage = memoryStorage();
    expect(resolveVisualMode("FULL", "?quality=light", storage)).toBe("LIGHT");
    expect(storage.getItem(VISUAL_QUALITY_STORAGE_KEY)).toBe("LIGHT");
    expect(resolveVisualMode("FULL", "", storage)).toBe("LIGHT");
  });

  it("hands control back with quality=auto", () => {
    const storage = memoryStorage({ [VISUAL_QUALITY_STORAGE_KEY]: "LIGHT" });
    expect(resolveVisualMode("FULL", "?quality=auto", storage)).toBe("FULL");
    expect(storage.getItem(VISUAL_QUALITY_STORAGE_KEY)).toBeNull();
  });

  it("ignores a quality it does not recognise instead of breaking the screen", () => {
    expect(resolveVisualMode("FULL", "?quality=ultra", memoryStorage())).toBe("FULL");
    expect(resolveVisualMode("FULL", "?quality=", memoryStorage())).toBe("FULL");
  });

  it("ignores a corrupted stored preference", () => {
    const storage = memoryStorage({ [VISUAL_QUALITY_STORAGE_KEY]: "POTATO" });
    expect(resolveVisualMode("FAST", "", storage)).toBe("FAST");
  });

  it("keeps working when storage throws", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    expect(resolveVisualMode("FULL", "?quality=light", blocked)).toBe("LIGHT");
    expect(resolveVisualMode("FULL", "", blocked)).toBe("FULL");
  });
});

describe("reading and clearing the preference", () => {
  it("reports a stored preference and nothing when there is none", () => {
    expect(readVisualQualityPreference(memoryStorage({ [VISUAL_QUALITY_STORAGE_KEY]: "FAST" }))).toBe("FAST");
    expect(readVisualQualityPreference(memoryStorage())).toBeNull();
  });

  it("clears it", () => {
    const storage = memoryStorage({ [VISUAL_QUALITY_STORAGE_KEY]: "FAST" });
    clearVisualQualityPreference(storage);
    expect(readVisualQualityPreference(storage)).toBeNull();
  });
});
