import { describe, expect, it } from "vitest";
import { createStadiumScene, nextStadiumMode, projectSceneMode } from "../three/stadiumScene";

describe("Stadium scene", () => {
  it("uses a production-safe WebGL renderer for the completed 3D modes", () => {
    expect(projectSceneMode("FULL")).toEqual({ renderer: "WEBGL", interactive: true, productionSafe: true });
    expect(createStadiumScene("FULL")).toMatchObject({
      mode: "FULL",
      status: "READY",
      renderer: "WEBGL",
      assetStrategy: "PROCEDURAL_GEOMETRY",
      orbitDegrees: 20,
    });
  });

  it("keeps an interactive 2D projection as the final safety fallback", () => {
    expect(projectSceneMode("STATIC")).toEqual({ renderer: "TWO_DIMENSIONAL", interactive: true, productionSafe: true });
    expect(createStadiumScene("STATIC")).toMatchObject({ status: "READY", renderer: "TWO_DIMENSIONAL", orbitDegrees: 0 });
  });

  it("degrades render quality deterministically without losing the route", () => {
    expect(["FULL", "FAST", "LIGHT", "STATIC"].map((mode) => nextStadiumMode(mode as "FULL" | "FAST" | "LIGHT" | "STATIC")))
      .toEqual(["FAST", "LIGHT", "STATIC", "STATIC"]);
  });
});
