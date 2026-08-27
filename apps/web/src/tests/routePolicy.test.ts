import { describe, expect, it } from "vitest";
import { playerNavigation, resolveRouteAccess } from "../routes/routePolicy";

describe("player route policy", () => {
  it("uses the canonical player bottom navigation", () => {
    expect(playerNavigation.map((item) => item.label)).toEqual(["HOME", "TRAINING", "COMMUNITY", "VIDEO", "MORE"]);
  });

  it("hides hard-disabled routes and returns forbidden for unverified manager access", () => {
    expect(resolveRouteAccess({ path: "/epts", role: "PLAYER", verifiedGrants: [] })).toMatchObject({ allowed: false, reason: "FEATURE_HARD_DISABLED" });
    expect(resolveRouteAccess({ path: "/manager", role: "MANAGER", verifiedGrants: [] })).toMatchObject({ allowed: false, reason: "ROLE_GRANT_REQUIRED" });
  });
});
