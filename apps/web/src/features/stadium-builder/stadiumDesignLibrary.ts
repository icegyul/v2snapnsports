import type { StadiumBuilderDraft } from "./stadiumBuilderModel";

// A shelf of saved stadium designs. The builder used to keep exactly one
// draft, so starting a second design quietly destroyed the first. Designs live
// in this browser only — the same place the working draft already lived.

export const STADIUM_DESIGN_LIBRARY_KEY = "snapn:v2:stadium-builder:library";

/** Bounded so a shelf of designs cannot eat the shared storage quota. */
export const MAX_SAVED_DESIGNS = 8;

export interface SavedStadiumDesign {
  readonly id: string;
  readonly name: string;
  readonly savedAt: string;
  readonly draft: StadiumBuilderDraft;
}

export interface StadiumDesignStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type SaveDesignResult =
  | Readonly<{ status: "SAVED"; design: SavedStadiumDesign }>
  | Readonly<{ status: "INVALID_NAME" }>
  | Readonly<{ status: "LIMIT_REACHED" }>
  | Readonly<{ status: "BLOCKED" }>;

function isDraft(value: unknown): value is StadiumBuilderDraft {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StadiumBuilderDraft>;
  return candidate.schemaVersion === 1
    && typeof candidate.selectedPresetId === "string"
    && Boolean(candidate.bowl && candidate.roof && candidate.stand && candidate.seat && candidate.facadeLight && candidate.environment);
}

function isDesign(value: unknown): value is SavedStadiumDesign {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SavedStadiumDesign>;
  return typeof candidate.id === "string"
    && typeof candidate.name === "string"
    && typeof candidate.savedAt === "string"
    && isDraft(candidate.draft);
}

function readLibrary(storage: StadiumDesignStorage): SavedStadiumDesign[] {
  let raw: string | null = null;
  try {
    raw = storage.getItem(STADIUM_DESIGN_LIBRARY_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    // A single unreadable entry must not take the whole shelf with it.
    return Array.isArray(parsed) ? parsed.filter(isDesign) : [];
  } catch {
    return [];
  }
}

function writeLibrary(storage: StadiumDesignStorage, designs: readonly SavedStadiumDesign[]): boolean {
  try {
    storage.setItem(STADIUM_DESIGN_LIBRARY_KEY, JSON.stringify(designs));
    return true;
  } catch {
    return false;
  }
}

function nextId(designs: readonly SavedStadiumDesign[]): string {
  const used = new Set(designs.map((design) => design.id));
  let sequence = designs.length + 1;
  while (used.has(`design-${sequence}`)) sequence += 1;
  return `design-${sequence}`;
}

/** Newest first: the shelf opens on what was just worked on. */
export function listDesigns(storage: StadiumDesignStorage): readonly SavedStadiumDesign[] {
  return [...readLibrary(storage)].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function loadDesign(storage: StadiumDesignStorage, id: string): StadiumBuilderDraft | null {
  return readLibrary(storage).find((design) => design.id === id)?.draft ?? null;
}

export function saveDesignAs(
  storage: StadiumDesignStorage,
  name: string,
  draft: StadiumBuilderDraft,
  savedAt: string,
): SaveDesignResult {
  const trimmed = name.trim();
  if (!trimmed) return { status: "INVALID_NAME" };

  const designs = readLibrary(storage);
  if (designs.length >= MAX_SAVED_DESIGNS) return { status: "LIMIT_REACHED" };

  const design: SavedStadiumDesign = { id: nextId(designs), name: trimmed, savedAt, draft };
  if (!writeLibrary(storage, [...designs, design])) return { status: "BLOCKED" };
  return { status: "SAVED", design };
}

export function renameDesign(storage: StadiumDesignStorage, id: string, name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const designs = readLibrary(storage);
  if (!designs.some((design) => design.id === id)) return false;
  return writeLibrary(
    storage,
    designs.map((design) => (design.id === id ? { ...design, name: trimmed } : design)),
  );
}

export function deleteDesign(storage: StadiumDesignStorage, id: string): boolean {
  const designs = readLibrary(storage);
  if (!designs.some((design) => design.id === id)) return false;
  return writeLibrary(storage, designs.filter((design) => design.id !== id));
}
