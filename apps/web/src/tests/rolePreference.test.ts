import { describe, expect, it } from "vitest";
import {
  ROLE_PREFERENCE_STORAGE_KEY,
  clearRolePreference,
  isRolePreference,
  readRolePreference,
  writeRolePreference,
} from "../features/auth/rolePreference";

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

describe("what counts as a role preference", () => {
  it("is only the two roles a person may sign up as", () => {
    expect(isRolePreference("PLAYER")).toBe(true);
    expect(isRolePreference("MANAGER")).toBe(true);
  });

  it("never includes guardian, who arrives by invitation", () => {
    expect(isRolePreference("GUARDIAN")).toBe(false);
  });

  it("never includes admin or a manager role", () => {
    expect(isRolePreference("ADMIN")).toBe(false);
    expect(isRolePreference("COACH")).toBe(false);
    expect(isRolePreference("")).toBe(false);
  });
});

describe("storing a preference", () => {
  it("keeps what the person picked", () => {
    const storage = memoryStorage();
    expect(writeRolePreference(storage, "MANAGER")).toBe(true);
    expect(storage.getItem(ROLE_PREFERENCE_STORAGE_KEY)).toBe("MANAGER");
    expect(readRolePreference(storage)).toBe("MANAGER");
  });

  it("refuses to store anything that is not one of the two", () => {
    const storage = memoryStorage();
    expect(writeRolePreference(storage, "ADMIN" as never)).toBe(false);
    expect(readRolePreference(storage)).toBeNull();
  });

  it("ignores a corrupted stored value", () => {
    expect(readRolePreference(memoryStorage({ [ROLE_PREFERENCE_STORAGE_KEY]: "COACH" }))).toBeNull();
  });

  it("can be cleared", () => {
    const storage = memoryStorage();
    writeRolePreference(storage, "PLAYER");
    clearRolePreference(storage);
    expect(readRolePreference(storage)).toBeNull();
  });

  it("keeps working when storage is blocked", () => {
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
    expect(writeRolePreference(blocked, "PLAYER")).toBe(false);
    expect(readRolePreference(blocked)).toBeNull();
  });
});
