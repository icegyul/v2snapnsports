import { describe, expect, it } from "vitest";
import { getStadiumBuilderMotionProfile } from "../features/stadium-builder/stadiumBuilderMotion";

describe("Stadium Builder motion policy", () => {
  it("gives standard-motion users a restrained panel transition and one-shot preview move", () => {
    const profile = getStadiumBuilderMotionProfile(false);

    expect(profile.panel).toMatchObject({ type: "spring" });
    expect(profile.panelOffset).toBeGreaterThan(0);
    expect(profile.preview.enabled).toBe(true);
    expect(profile.preview.duration).toBeGreaterThanOrEqual(900);
    expect(profile.preview.fromOrbit).not.toBe(profile.preview.toOrbit);
    expect(profile.preview.fromZoom).not.toBe(profile.preview.toZoom);
  });

  it("removes spatial movement when reduced motion is requested", () => {
    const profile = getStadiumBuilderMotionProfile(true);

    expect(profile.panelOffset).toBe(0);
    expect(profile.preview).toEqual({
      enabled: false,
      duration: 0,
      fromOrbit: 0,
      toOrbit: 0,
      fromZoom: 1,
      toZoom: 1,
    });
  });
});
