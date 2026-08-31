import { describe, expect, it } from "vitest";
import { getStadiumHomeMotionProfile } from "../features/stadium/stadiumHomeMotion";

describe("Stadium Home Motion and Anime.js policy", () => {
  it("uses restrained UI presence and a single cinematic camera push", () => {
    const profile = getStadiumHomeMotionProfile(false);

    expect(profile.ui.itemOffset).toBeGreaterThan(0);
    expect(profile.ui.stagger).toBeGreaterThan(0);
    expect(profile.camera.enabled).toBe(true);
    expect(profile.camera.duration).toBeGreaterThanOrEqual(1200);
    expect(profile.camera.fromOrbit).not.toBe(profile.camera.toOrbit);
    expect(profile.camera.fromZoom).toBeLessThan(profile.camera.toZoom);
  });

  it("removes spatial movement for reduced-motion users", () => {
    const profile = getStadiumHomeMotionProfile(true);

    expect(profile.ui.itemOffset).toBe(0);
    expect(profile.ui.stagger).toBe(0);
    expect(profile.camera).toEqual({
      enabled: false,
      duration: 0,
      fromOrbit: 0,
      toOrbit: 0,
      fromZoom: 1,
      toZoom: 1,
    });
  });
});
