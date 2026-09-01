import { describe, expect, it } from "vitest";
import {
  DEFAULT_FORMATION_ID,
  FORMATION_SHAPES,
  buildFormationLineup,
  getFormationShape,
  resolveFormationId,
} from "../features/stadium/teamFormationShapes";

const player = { shirtNumber: "8", primaryPosition: "중앙 미드필더" };
const teammates = [
  { shirtNumber: "4", position: "DF", x: 22, y: 35 },
  { shirtNumber: "7", position: "MF", x: 72, y: 44 },
  { shirtNumber: "11", position: "FW", x: 70, y: 22 },
];

describe("formation shapes", () => {
  it("offers the four common shapes with 4-3-3 as the default", () => {
    expect(FORMATION_SHAPES.map((shape) => shape.id)).toEqual(["4-3-3", "4-4-2", "3-5-2", "4-2-3-1"]);
    expect(DEFAULT_FORMATION_ID).toBe("4-3-3");
  });

  it("gives every shape eleven slots, one of them a keeper", () => {
    for (const shape of FORMATION_SHAPES) {
      expect(shape.slots).toHaveLength(11);
      expect(shape.slots.filter((slot) => slot.role === "GK")).toHaveLength(1);
    }
  });

  it("matches each label to its outfield line counts", () => {
    for (const shape of FORMATION_SHAPES) {
      const lines = shape.id.split("-").map(Number);
      expect(lines.reduce((sum, count) => sum + count, 0)).toBe(10);
      expect(shape.slots.filter((slot) => slot.role === "DF")).toHaveLength(lines[0]);
      expect(shape.slots.filter((slot) => slot.role === "FW")).toHaveLength(lines[lines.length - 1]);
    }
  });

  it("keeps every slot inside the pitch and uniquely identified", () => {
    for (const shape of FORMATION_SHAPES) {
      const ids = new Set(shape.slots.map((slot) => slot.id));
      expect(ids.size).toBe(11);
      for (const slot of shape.slots) {
        expect(Math.abs(slot.x)).toBeLessThanOrEqual(47);
        expect(Math.abs(slot.z)).toBeLessThanOrEqual(29);
      }
    }
  });

  it("resolves known ids and falls back to the default", () => {
    expect(resolveFormationId("3-5-2")).toBe("3-5-2");
    expect(resolveFormationId("4-3-3")).toBe("4-3-3");
    expect(resolveFormationId("9-9-9")).toBe(DEFAULT_FORMATION_ID);
    expect(resolveFormationId(null)).toBe(DEFAULT_FORMATION_ID);
  });
});

describe("buildFormationLineup", () => {
  it("fills only real people and leaves the rest of the shape empty", () => {
    for (const shape of FORMATION_SHAPES) {
      const lineup = buildFormationLineup(shape, player, teammates);
      expect(lineup).toHaveLength(11);
      expect(lineup.filter((entry) => entry.kind === "OWN")).toHaveLength(1);
      expect(lineup.filter((entry) => entry.kind === "TEAMMATE")).toHaveLength(3);
      expect(lineup.filter((entry) => entry.kind === "EMPTY")).toHaveLength(7);
    }
  });

  it("never invents a shirt number", () => {
    const lineup = buildFormationLineup(getFormationShape("4-4-2"), player, teammates);
    const shirts = lineup
      .filter((entry) => entry.kind !== "EMPTY")
      .map((entry) => entry.shirtNumber)
      .sort();
    expect(shirts).toEqual(["11", "4", "7", "8"]);
  });

  it("puts my own player in a slot matching my role", () => {
    for (const shape of FORMATION_SHAPES) {
      const own = buildFormationLineup(shape, player, teammates).find((entry) => entry.kind === "OWN")!;
      expect(own.slot.role).toBe("MF");
    }
  });

  it("places teammates in slots matching their own roles", () => {
    const lineup = buildFormationLineup(getFormationShape("4-3-3"), player, teammates);
    const roleOf = (shirtNumber: string) =>
      lineup.find((entry) => entry.kind !== "EMPTY" && entry.shirtNumber === shirtNumber)!.slot.role;
    expect(roleOf("4")).toBe("DF");
    expect(roleOf("7")).toBe("MF");
    expect(roleOf("11")).toBe("FW");
  });

  it("gives each person a distinct slot", () => {
    const lineup = buildFormationLineup(getFormationShape("3-5-2"), player, teammates);
    const slotIds = lineup.map((entry) => entry.slot.id);
    expect(new Set(slotIds).size).toBe(11);
  });

  it("is deterministic for the same input", () => {
    const first = buildFormationLineup(getFormationShape("4-2-3-1"), player, teammates);
    const second = buildFormationLineup(getFormationShape("4-2-3-1"), player, teammates);
    expect(first).toEqual(second);
  });

  it("keeps working when nobody is connected yet", () => {
    const lineup = buildFormationLineup(getFormationShape("4-3-3"), player, []);
    expect(lineup.filter((entry) => entry.kind === "EMPTY")).toHaveLength(10);
    expect(lineup.filter((entry) => entry.kind === "OWN")).toHaveLength(1);
  });

  it("returns entries in slot order so rendering stays stable", () => {
    const shape = getFormationShape("4-4-2");
    const lineup = buildFormationLineup(shape, player, teammates);
    expect(lineup.map((entry) => entry.slot.id)).toEqual(shape.slots.map((slot) => slot.id));
  });
});
