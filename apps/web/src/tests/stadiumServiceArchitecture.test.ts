import { describe, expect, it } from "vitest";
import { resolveServiceArchitecture } from "../three/stadiumServiceArchitecture";

describe("Stadium service exterior architecture", () => {
  it("defines a transparent central entrance and monumental front structure", () => {
    const architecture = resolveServiceArchitecture();

    expect(architecture.entrance).toEqual({ width: 52, height: 30, depth: 5, z: 86.2 });
    expect(architecture.buttresses).toHaveLength(6);
    expect(architecture.buttresses.every((item) => item.height >= 28)).toBe(true);
    // Blades must frame the atrium, never stand in front of the lit lobby.
    expect(architecture.buttresses.every((item) => Math.abs(item.x) >= architecture.entrance.width / 2)).toBe(true);
    expect(architecture.perimeterButtressCount).toBe(32);
  });

  it("provides real concourse rhythm and entrance stair depth", () => {
    const architecture = resolveServiceArchitecture();

    expect(architecture.mullionCount).toBe(18);
    expect(architecture.interiorSlabHeights).toEqual([5.5, 11.5, 17.5, 23.5]);
    expect(architecture.stairRuns).toHaveLength(6);
  });

  it("uses a wet plaza larger than the stadium footprint without placeholder skyline props", () => {
    const architecture = resolveServiceArchitecture();

    expect(architecture.plaza.width).toBeGreaterThan(300);
    expect(architecture.plaza.depth).toBeGreaterThan(220);
    expect(architecture.heroSkylineCount).toBe(0);
    expect(architecture.heroTreeCount).toBe(0);
  });
});
