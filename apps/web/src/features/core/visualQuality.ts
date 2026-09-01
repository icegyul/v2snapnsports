import type { CoreVisualMode } from "../../api/coreProductContracts";

// Which rendering tier a screen runs at. The product picks one, but a person
// on a weak or old phone needs to be able to pin a lighter tier — and support
// needs to be able to hand them a link that does it. `?quality=light` pins,
// `?quality=auto` hands control back.

export const VISUAL_QUALITY_STORAGE_KEY = "snapn:v2:visual-quality";

const MODES: readonly CoreVisualMode[] = ["FULL", "FAST", "LIGHT", "STATIC"];

export interface VisualQualityStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function asMode(value: string | null | undefined): CoreVisualMode | null {
  if (!value) return null;
  const upper = value.trim().toUpperCase();
  return MODES.find((mode) => mode === upper) ?? null;
}

export function readVisualQualityPreference(storage: VisualQualityStorage): CoreVisualMode | null {
  try {
    return asMode(storage.getItem(VISUAL_QUALITY_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function clearVisualQualityPreference(storage: VisualQualityStorage): void {
  try {
    storage.removeItem(VISUAL_QUALITY_STORAGE_KEY);
  } catch {
    // Nothing stored to clear.
  }
}

/**
 * Precedence: an explicit `?quality=` in the link, then a remembered
 * preference, then whatever the product asked for. An unrecognised value is
 * ignored rather than allowed to blank the screen.
 */
export function resolveVisualMode(
  contractMode: CoreVisualMode,
  search: string,
  storage: VisualQualityStorage,
): CoreVisualMode {
  const requested = new URLSearchParams(search).get("quality");

  if (requested && requested.trim().toLowerCase() === "auto") {
    clearVisualQualityPreference(storage);
    return contractMode;
  }

  const pinned = asMode(requested);
  if (pinned) {
    try {
      storage.setItem(VISUAL_QUALITY_STORAGE_KEY, pinned);
    } catch {
      // The pin still applies to this page even if it cannot be remembered.
    }
    return pinned;
  }

  return readVisualQualityPreference(storage) ?? contractMode;
}
