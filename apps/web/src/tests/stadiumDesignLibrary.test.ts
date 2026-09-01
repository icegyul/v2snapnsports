import { describe, expect, it } from "vitest";
import { createStadiumBuilderDraft } from "../features/stadium-builder/stadiumBuilderModel";
import {
  MAX_SAVED_DESIGNS,
  STADIUM_DESIGN_LIBRARY_KEY,
  deleteDesign,
  listDesigns,
  loadDesign,
  renameDesign,
  saveDesignAs,
} from "../features/stadium-builder/stadiumDesignLibrary";

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

const draft = createStadiumBuilderDraft();
const other = createStadiumBuilderDraft("night-event-cyan");
const now = "2026-09-01T12:00:00.000Z";
const later = "2026-09-02T09:30:00.000Z";

describe("saving a design", () => {
  it("keeps several designs side by side instead of overwriting one", () => {
    const storage = memoryStorage();
    saveDesignAs(storage, "홈 경기장", draft, now);
    saveDesignAs(storage, "야간 경기장", other, later);

    const designs = listDesigns(storage);
    expect(designs).toHaveLength(2);
    expect(designs.map((design) => design.name)).toContain("홈 경기장");
    expect(designs.map((design) => design.name)).toContain("야간 경기장");
  });

  it("lists the most recently saved design first", () => {
    const storage = memoryStorage();
    saveDesignAs(storage, "먼저", draft, now);
    saveDesignAs(storage, "나중", other, later);
    expect(listDesigns(storage)[0].name).toBe("나중");
  });

  it("gives back exactly the design that was saved", () => {
    const storage = memoryStorage();
    const saved = saveDesignAs(storage, "홈 경기장", other, now);
    expect(saved.status).toBe("SAVED");
    if (saved.status !== "SAVED") return;
    expect(loadDesign(storage, saved.design.id)).toEqual(other);
  });

  it("refuses an empty name rather than saving something unfindable", () => {
    const storage = memoryStorage();
    expect(saveDesignAs(storage, "   ", draft, now).status).toBe("INVALID_NAME");
    expect(listDesigns(storage)).toHaveLength(0);
  });

  it("trims the name so it matches what the person typed", () => {
    const storage = memoryStorage();
    const saved = saveDesignAs(storage, "  우리 홈  ", draft, now);
    expect(saved.status === "SAVED" && saved.design.name).toBe("우리 홈");
  });

  it("stops at the library limit instead of filling up storage", () => {
    const storage = memoryStorage();
    for (let index = 0; index < MAX_SAVED_DESIGNS; index += 1) {
      expect(saveDesignAs(storage, `설계 ${index}`, draft, now).status).toBe("SAVED");
    }
    expect(saveDesignAs(storage, "하나 더", draft, now).status).toBe("LIMIT_REACHED");
    expect(listDesigns(storage)).toHaveLength(MAX_SAVED_DESIGNS);
  });

  it("reports when the browser refuses to store", () => {
    const blocked = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
      removeItem: () => {},
    };
    expect(saveDesignAs(blocked, "홈", draft, now).status).toBe("BLOCKED");
  });
});

describe("managing saved designs", () => {
  it("renames one without touching the others", () => {
    const storage = memoryStorage();
    const first = saveDesignAs(storage, "홈", draft, now);
    saveDesignAs(storage, "원정", other, later);
    if (first.status !== "SAVED") return;

    expect(renameDesign(storage, first.design.id, "우리 홈 경기장")).toBe(true);
    const designs = listDesigns(storage);
    expect(designs.find((design) => design.id === first.design.id)?.name).toBe("우리 홈 경기장");
    expect(designs.map((design) => design.name)).toContain("원정");
  });

  it("refuses to rename to nothing", () => {
    const storage = memoryStorage();
    const saved = saveDesignAs(storage, "홈", draft, now);
    if (saved.status !== "SAVED") return;
    expect(renameDesign(storage, saved.design.id, "  ")).toBe(false);
    expect(listDesigns(storage)[0].name).toBe("홈");
  });

  it("deletes one and leaves the rest", () => {
    const storage = memoryStorage();
    const first = saveDesignAs(storage, "홈", draft, now);
    saveDesignAs(storage, "원정", other, later);
    if (first.status !== "SAVED") return;

    expect(deleteDesign(storage, first.design.id)).toBe(true);
    expect(listDesigns(storage).map((design) => design.name)).toEqual(["원정"]);
  });

  it("says so when asked about a design that is not there", () => {
    const storage = memoryStorage();
    expect(loadDesign(storage, "missing")).toBeNull();
    expect(renameDesign(storage, "missing", "이름")).toBe(false);
    expect(deleteDesign(storage, "missing")).toBe(false);
  });

  it("ignores a corrupted library instead of throwing at the screen", () => {
    const storage = memoryStorage({ [STADIUM_DESIGN_LIBRARY_KEY]: "{not json" });
    expect(listDesigns(storage)).toEqual([]);
    expect(saveDesignAs(storage, "홈", draft, now).status).toBe("SAVED");
    expect(listDesigns(storage)).toHaveLength(1);
  });

  it("drops entries whose stored draft is not a draft", () => {
    const storage = memoryStorage({
      [STADIUM_DESIGN_LIBRARY_KEY]: JSON.stringify([
        { id: "a", name: "좋은 것", savedAt: now, draft },
        { id: "b", name: "깨진 것", savedAt: now, draft: { nope: true } },
      ]),
    });
    expect(listDesigns(storage).map((design) => design.id)).toEqual(["a"]);
  });
});
