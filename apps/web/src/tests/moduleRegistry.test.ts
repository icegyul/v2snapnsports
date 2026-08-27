import { describe, expect, it } from "vitest";
import { backendModules } from "../../../../backend/src/moduleRegistry";

describe("backend module foundation", () => {
  it("maps every canonical foundation module to the four-layer boundary", () => {
    expect(backendModules.map((module) => module.name)).toEqual(expect.arrayContaining([
      "identity", "organization", "team", "player", "guardian", "role", "schedule", "training", "match", "tactics", "stadium", "community", "media", "notification", "career", "scouting", "communication", "safeguarding", "privacy", "earthus", "admin"
    ]));
    expect(backendModules.every((module) => module.layers.join("/") === "domain/application/infrastructure/interface")).toBe(true);
  });
});
