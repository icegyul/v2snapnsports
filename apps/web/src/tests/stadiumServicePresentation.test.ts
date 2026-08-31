import { describe, expect, it } from "vitest";
import { resolveServiceCamera } from "../three/stadiumServicePresentation";

describe("Stadium service presentation camera", () => {
  it("frames the desktop Home from the entrance approach instead of inside the bowl", () => {
    const camera = resolveServiceCamera("DESKTOP", 0, 1);

    expect(camera.position[2]).toBeGreaterThan(180);
    expect(camera.position[1]).toBeGreaterThanOrEqual(14);
    expect(camera.position[1]).toBeLessThanOrEqual(26);
    expect(camera.target[2]).toBeGreaterThan(35);
    expect(camera.fov).toBeLessThanOrEqual(48);
  });

  it("uses an independently composed lower and wider mobile approach", () => {
    const desktop = resolveServiceCamera("DESKTOP", 0, 1);
    const mobile = resolveServiceCamera("MOBILE", 0, 1);

    expect(mobile.position[1]).toBeLessThan(desktop.position[1]);
    expect(mobile.fov).toBeGreaterThan(desktop.fov);
    expect(mobile.target[2]).toBe(desktop.target[2]);
  });

  it("rises toward an aerial pitch view as the user drags upward", () => {
    const ground = resolveServiceCamera("DESKTOP", 0, 1, 0);
    const mid = resolveServiceCamera("DESKTOP", 0, 1, 0.5);
    const aerial = resolveServiceCamera("DESKTOP", 0, 1, 1);

    // Camera climbs monotonically with rise.
    expect(mid.position[1]).toBeGreaterThan(ground.position[1]);
    expect(aerial.position[1]).toBeGreaterThan(mid.position[1]);
    expect(aerial.position[1]).toBeGreaterThan(120);
    // At full rise the camera looks down into the bowl, not at the entrance.
    expect(aerial.target[1]).toBeLessThan(ground.target[1]);
    expect(aerial.target[2]).toBeLessThan(ground.target[2]);
    // Rise input is clamped.
    expect(resolveServiceCamera("DESKTOP", 0, 1, 4).position[1])
      .toBeCloseTo(aerial.position[1], 5);
    // Omitting rise keeps the original approach pose.
    expect(resolveServiceCamera("DESKTOP", 0, 1).position[1]).toBeCloseTo(ground.position[1], 5);
  });

  it("keeps user orbit bounded around the entrance axis", () => {
    const left = resolveServiceCamera("DESKTOP", -30, 1);
    const right = resolveServiceCamera("DESKTOP", 30, 1);

    expect(left.position[0]).toBeLessThan(0);
    expect(right.position[0]).toBeGreaterThan(0);
    expect(Math.abs(left.position[0])).toBeLessThan(70);
    expect(Math.abs(right.position[0])).toBeLessThan(70);
  });
});
