import { describe, expect, it } from "vitest";
import {
  getStadiumCrowdMotionProfile,
  shouldAdvanceCrowdFrame,
} from "../features/stadium/stadiumCrowdMotion";

describe("stadium crowd motion profile", () => {
  it("brings the stands alive at a capped frame rate", () => {
    const profile = getStadiumCrowdMotionProfile(false);
    expect(profile.enabled).toBe(true);
    expect(profile.frameIntervalMs).toBeGreaterThanOrEqual(1000 / 32);
    expect(profile.frameIntervalMs).toBeLessThanOrEqual(1000 / 20);
    expect(profile.waveLift).toBeGreaterThan(0);
    expect(profile.swayAmplitude).toBeGreaterThan(0);
  });

  it("keeps the movement subtle enough to read as a crowd, not a trampoline", () => {
    const profile = getStadiumCrowdMotionProfile(false);
    expect(profile.waveLift).toBeLessThanOrEqual(0.45);
    expect(profile.swayAmplitude).toBeLessThanOrEqual(0.08);
    expect(profile.waveSpeed).toBeGreaterThan(0);
    expect(profile.waveSpeed).toBeLessThanOrEqual(1.2);
  });

  it("stands completely still under reduced motion", () => {
    const profile = getStadiumCrowdMotionProfile(true);
    expect(profile.enabled).toBe(false);
    expect(profile.waveLift).toBe(0);
    expect(profile.swayAmplitude).toBe(0);
    expect(profile.waveSpeed).toBe(0);
  });
});

describe("shouldAdvanceCrowdFrame", () => {
  const profile = getStadiumCrowdMotionProfile(false);

  it("throttles to the profile interval", () => {
    expect(shouldAdvanceCrowdFrame(profile, 1000, 1000 + profile.frameIntervalMs + 1, false)).toBe(true);
    expect(shouldAdvanceCrowdFrame(profile, 1000, 1000 + profile.frameIntervalMs - 5, false)).toBe(false);
  });

  it("always draws the first frame", () => {
    expect(shouldAdvanceCrowdFrame(profile, null, 0, false)).toBe(true);
  });

  it("stops while the page is hidden so a background tab costs nothing", () => {
    expect(shouldAdvanceCrowdFrame(profile, 1000, 9000, true)).toBe(false);
  });

  it("never draws for a disabled profile", () => {
    const still = getStadiumCrowdMotionProfile(true);
    expect(shouldAdvanceCrowdFrame(still, null, 0, false)).toBe(false);
    expect(shouldAdvanceCrowdFrame(still, 1000, 9000, false)).toBe(false);
  });
});
