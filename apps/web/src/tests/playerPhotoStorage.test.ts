import { describe, expect, it } from "vitest";
import {
  MAX_PHOTO_DATA_URL_BYTES,
  PLAYER_PHOTO_STORAGE_KEY,
  clearPlayerPhoto,
  coverSquare,
  isSupportedPhotoType,
  loadPlayerPhoto,
  savePlayerPhoto,
} from "../features/player/playerPhotoStorage";

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

const tinyJpeg = `data:image/jpeg;base64,${"A".repeat(64)}`;

describe("supported photo types", () => {
  it("takes the formats a phone camera produces", () => {
    expect(isSupportedPhotoType("image/jpeg")).toBe(true);
    expect(isSupportedPhotoType("image/png")).toBe(true);
    expect(isSupportedPhotoType("image/webp")).toBe(true);
    expect(isSupportedPhotoType("image/heic")).toBe(true);
  });

  it("refuses anything that is not an image", () => {
    expect(isSupportedPhotoType("application/pdf")).toBe(false);
    expect(isSupportedPhotoType("text/html")).toBe(false);
    expect(isSupportedPhotoType("image/svg+xml")).toBe(false);
    expect(isSupportedPhotoType("")).toBe(false);
  });
});

describe("coverSquare", () => {
  it("centre-crops a landscape photo to a square", () => {
    expect(coverSquare(1600, 900)).toEqual({ sx: 350, sy: 0, size: 900 });
  });

  it("centre-crops a portrait photo to a square", () => {
    expect(coverSquare(900, 1600)).toEqual({ sx: 0, sy: 350, size: 900 });
  });

  it("leaves an already square photo alone", () => {
    expect(coverSquare(800, 800)).toEqual({ sx: 0, sy: 0, size: 800 });
  });

  it("biases a tall portrait crop toward the face at the top", () => {
    const crop = coverSquare(600, 1800, 0.25);
    expect(crop.size).toBe(600);
    expect(crop.sy).toBe(300);
  });
});

describe("player photo storage", () => {
  it("round-trips a photo", () => {
    const storage = memoryStorage();
    expect(savePlayerPhoto(storage, tinyJpeg).status).toBe("SAVED");
    expect(storage.getItem(PLAYER_PHOTO_STORAGE_KEY)).toBe(tinyJpeg);
    expect(loadPlayerPhoto(storage)).toBe(tinyJpeg);
  });

  it("refuses anything that is not an image data url", () => {
    const storage = memoryStorage();
    expect(savePlayerPhoto(storage, "https://example.com/a.jpg").status).toBe("INVALID");
    expect(savePlayerPhoto(storage, "data:text/html;base64,AAAA").status).toBe("INVALID");
    expect(savePlayerPhoto(storage, "data:image/svg+xml;base64,AAAA").status).toBe("INVALID");
    expect(loadPlayerPhoto(storage)).toBeNull();
  });

  it("refuses a photo too large for the storage budget", () => {
    const storage = memoryStorage();
    const huge = `data:image/jpeg;base64,${"A".repeat(MAX_PHOTO_DATA_URL_BYTES + 10)}`;
    expect(savePlayerPhoto(storage, huge).status).toBe("TOO_LARGE");
    expect(loadPlayerPhoto(storage)).toBeNull();
  });

  it("reports when the browser refuses to store", () => {
    const blocked = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
      removeItem: () => {},
    };
    expect(savePlayerPhoto(blocked, tinyJpeg).status).toBe("BLOCKED");
  });

  it("ignores a corrupted stored value instead of rendering it", () => {
    const storage = memoryStorage({ [PLAYER_PHOTO_STORAGE_KEY]: "javascript:alert(1)" });
    expect(loadPlayerPhoto(storage)).toBeNull();
  });

  it("clears the photo completely, leaving nothing behind", () => {
    const storage = memoryStorage();
    savePlayerPhoto(storage, tinyJpeg);
    clearPlayerPhoto(storage);
    expect(storage.getItem(PLAYER_PHOTO_STORAGE_KEY)).toBeNull();
    expect(loadPlayerPhoto(storage)).toBeNull();
  });
});
