import { describe, expect, it } from "vitest";
import { moduleBoundaryFiles } from "../../../../backend/src/moduleBoundaryFiles";

describe("backend module boundary files", () => {
  it("gives each canonical backend module the four canonical layers", () => {
    expect(moduleBoundaryFiles.every((module) => module.layers.join("/") === "domain/application/infrastructure/interface")).toBe(true);
    expect(moduleBoundaryFiles.map((module) => module.name)).toContain("safeguarding");
  });
});
