import { describe, expect, it } from "vitest";
import { corePlayerRoutes, isPublicRolePreference, managerRouteRequiresVerifiedGrant } from "../routes/coreRoutePolicy";

describe("Core UI route policy", () => {
  it("keeps public role selection limited to player and manager preference", () => {
    expect(isPublicRolePreference("PLAYER")).toBe(true);
    expect(isPublicRolePreference("MANAGER")).toBe(true);
    expect(isPublicRolePreference("GUARDIAN")).toBe(false);
  });

  it("uses the canonical player stadium sequence", () => {
    expect(corePlayerRoutes.map((route) => route.path)).toEqual(["/home", "/home/enter", "/home/position", "/home/team", "/player/career"]);
  });

  it("keeps every manager workspace behind a verified grant", () => {
    expect(managerRouteRequiresVerifiedGrant("/manager/coach/ground")).toBe(true);
  });
});
