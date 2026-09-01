// The player's own card photo. It never leaves the device: there is no upload
// endpoint, and the photo is deliberately kept out of every shared surface
// (portfolio, scouting, team views) because the athlete may be a minor.
// Storage is this browser's localStorage, and clearing it removes the only
// copy.

export const PLAYER_PHOTO_STORAGE_KEY = "snapn:v2:player-photo";

/** Data-URL budget. localStorage is a ~5MB shared pot, so one photo takes a
 *  small, predictable slice of it; the capture path downscales to fit. */
export const MAX_PHOTO_DATA_URL_BYTES = 320_000;

const SUPPORTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

// SVG is excluded on purpose: it can carry script, and this value is rendered
// straight into an <image> element.
const PHOTO_DATA_URL = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

export interface PlayerPhotoStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type SavePhotoResult =
  | Readonly<{ status: "SAVED" }>
  | Readonly<{ status: "INVALID" }>
  | Readonly<{ status: "TOO_LARGE" }>
  | Readonly<{ status: "BLOCKED" }>;

export function isSupportedPhotoType(type: string): boolean {
  return SUPPORTED_PHOTO_TYPES.includes(type.toLowerCase());
}

export interface PhotoCrop {
  readonly sx: number;
  readonly sy: number;
  readonly size: number;
}

/**
 * Centre-crop rectangle that fills a square from a photo of any shape.
 * `verticalBias` shifts a portrait crop upward (0 = top, 0.5 = centred) so a
 * face near the top of a tall photo survives the crop.
 */
export function coverSquare(width: number, height: number, verticalBias = 0.5): PhotoCrop {
  const size = Math.min(width, height);
  return {
    sx: Math.round((width - size) / 2),
    sy: Math.round((height - size) * verticalBias),
    size,
  };
}

export function loadPlayerPhoto(storage: PlayerPhotoStorage): string | null {
  const stored = storage.getItem(PLAYER_PHOTO_STORAGE_KEY);
  if (!stored || !PHOTO_DATA_URL.test(stored)) return null;
  return stored;
}

export function savePlayerPhoto(storage: PlayerPhotoStorage, dataUrl: string): SavePhotoResult {
  if (!PHOTO_DATA_URL.test(dataUrl)) return { status: "INVALID" };
  if (dataUrl.length > MAX_PHOTO_DATA_URL_BYTES) return { status: "TOO_LARGE" };
  try {
    storage.setItem(PLAYER_PHOTO_STORAGE_KEY, dataUrl);
  } catch {
    return { status: "BLOCKED" };
  }
  return { status: "SAVED" };
}

export function clearPlayerPhoto(storage: PlayerPhotoStorage): void {
  try {
    storage.removeItem(PLAYER_PHOTO_STORAGE_KEY);
  } catch {
    // A browser that refuses to remove also refused to store.
  }
}
