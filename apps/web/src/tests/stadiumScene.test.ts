import { describe, expect, it } from "vitest";
import { createDevelopmentScene, projectSceneMode } from "../three/stadiumScene";

describe("Stadium scene scaffold", () => {
  it("keeps a semantic 2D projection in STATIC mode", () => {
    expect(projectSceneMode("STATIC")).toEqual({ renderer: "TWO_DIMENSIONAL", interactive: true, productionSafe: true });
  });

  it("marks incomplete geometry as a development scaffold", () => {
    expect(createDevelopmentScene("FAST")).toMatchObject({ mode: "FAST", status: "DEVELOPMENT_SCAFFOLD", hasFinalAssets: false });
  });
});
