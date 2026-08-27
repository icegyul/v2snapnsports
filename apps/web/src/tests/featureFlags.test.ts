import { describe, expect, it } from "vitest";
import { featureFlags, isFeatureVisible } from "../lib/featureFlags";

describe("hard feature flags", () => {
  it("keeps EPTS, Camera AI, and Sports AI absent from user navigation", () => {
    expect(featureFlags.EPTS).toBe(false);
    expect(featureFlags.CAMERA_AI).toBe(false);
    expect(featureFlags.SPORTS_AI).toBe(false);
    expect(isFeatureVisible("EPTS")).toBe(false);
    expect(isFeatureVisible("CAMERA_AI")).toBe(false);
    expect(isFeatureVisible("SPORTS_AI")).toBe(false);
  });
});
