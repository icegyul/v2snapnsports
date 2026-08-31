import { describe, expect, it } from "vitest";
import { resolveInteriorCamera } from "../three/stadiumServicePresentation";

// Bowl envelope facts from stadiumWebglV14 geometry (default profile):
// tiers span x-radius 58..113 (z = ~0.70x), tier tops at y 33.0, roof
// underside clutter starts at y 36.7. Pitch is 105x68 at y 0.02.
const ROOF_CLEARANCE_Y = 34.5;
const MIN_SAFE_RADIUS = 58;
const MAX_SAFE_RADIUS = 105;

function radiusOf(pose: { position: readonly number[] }): number {
  const [x, , z] = pose.position;
  return Math.hypot(x, z / 0.7);
}

describe("resolveInteriorCamera", () => {
  it("keeps every pose inside the bowl safety envelope", () => {
    for (const viewport of ["DESKTOP", "MOBILE"] as const) {
      for (let orbit = -30; orbit <= 30; orbit += 10) {
        for (const zoom of [0.9, 1, 1.14]) {
          for (const rise of [0, 0.25, 0.5, 0.75, 1]) {
            const pose = resolveInteriorCamera(viewport, orbit, zoom, rise);
            const radius = radiusOf(pose);
            expect(radius).toBeGreaterThanOrEqual(MIN_SAFE_RADIUS);
            expect(radius).toBeLessThanOrEqual(MAX_SAFE_RADIUS);
            expect(pose.position[1]).toBeLessThanOrEqual(ROOF_CLEARANCE_Y);
            expect(pose.position[1]).toBeGreaterThan(8);
          }
        }
      }
    }
  });

  it("stays above the seating line so stands never occlude the camera", () => {
    for (const rise of [0, 0.5, 1]) {
      const pose = resolveInteriorCamera("DESKTOP", 0, 1, rise);
      const radius = radiusOf(pose);
      const seatLineY = 0.6 * (radius - 58) + 3;
      expect(pose.position[1]).toBeGreaterThanOrEqual(seatLineY);
    }
  });

  it("aims at the pitch center", () => {
    const pose = resolveInteriorCamera("DESKTOP", 12, 1, 0.4);
    expect(Math.abs(pose.target[0])).toBeLessThan(8);
    expect(pose.target[1]).toBeGreaterThan(0);
    expect(pose.target[1]).toBeLessThan(6);
    expect(Math.abs(pose.target[2])).toBeLessThan(8);
  });

  it("rise climbs from a low-tier view to an upper-tier overview", () => {
    const low = resolveInteriorCamera("DESKTOP", 0, 1, 0);
    const high = resolveInteriorCamera("DESKTOP", 0, 1, 1);
    expect(low.position[1]).toBeLessThan(21);
    expect(high.position[1]).toBeGreaterThan(29);
    expect(radiusOf(high)).toBeGreaterThan(radiusOf(low));
  });

  it("zoom dollies the camera toward the pitch", () => {
    const far = resolveInteriorCamera("DESKTOP", 0, 0.92, 0.5);
    const near = resolveInteriorCamera("DESKTOP", 0, 1.14, 0.5);
    expect(radiusOf(near)).toBeLessThan(radiusOf(far));
  });

  it("orbit sweeps the camera around the bowl ellipse", () => {
    const center = resolveInteriorCamera("DESKTOP", 0, 1, 0.5);
    const swung = resolveInteriorCamera("DESKTOP", 20, 1, 0.5);
    expect(Math.abs(center.position[0])).toBeLessThan(6);
    expect(center.position[2]).toBeGreaterThan(30);
    expect(Math.abs(swung.position[0])).toBeGreaterThan(20);
    expect(radiusOf(swung)).toBeCloseTo(radiusOf(center), 0);
  });

  it("starts on the +z side so the scoreboard stays in view", () => {
    const pose = resolveInteriorCamera("DESKTOP", 0, 1, 0);
    expect(pose.position[2]).toBeGreaterThan(0);
  });

  it("uses a wider field of view in portrait", () => {
    const desktop = resolveInteriorCamera("DESKTOP", 0, 1, 0.5);
    const mobile = resolveInteriorCamera("MOBILE", 0, 1, 0.5);
    expect(mobile.fov).toBeGreaterThan(desktop.fov);
    expect(desktop.fov).toBeGreaterThanOrEqual(44);
    expect(desktop.fov).toBeLessThanOrEqual(62);
  });

  it("clamps out-of-range inputs instead of leaving the envelope", () => {
    const pose = resolveInteriorCamera("DESKTOP", 900, 9, 7);
    const radius = radiusOf(pose);
    expect(radius).toBeGreaterThanOrEqual(MIN_SAFE_RADIUS);
    expect(radius).toBeLessThanOrEqual(MAX_SAFE_RADIUS);
    expect(pose.position[1]).toBeLessThanOrEqual(ROOF_CLEARANCE_Y);
  });
});
