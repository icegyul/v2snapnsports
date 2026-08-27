import { describe, expect, it } from "vitest";
import { mapFormationSlots } from "../features/formation/formation";

describe("formation mapping", () => {
  it("maps the fixture player to the selected central midfield slot", () => {
    const slots = mapFormationSlots("4-3-3", "fixture-player");
    expect(slots.find((slot) => slot.isMe)).toMatchObject({ role: "CM" });
  });
});
