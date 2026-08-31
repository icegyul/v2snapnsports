import { describe, expect, it } from "vitest";
import { playerNavigation, resolveRouteAccess } from "../routes/routePolicy";

describe("player route policy", () => {
  it("uses the canonical player bottom navigation", () => {
    expect(playerNavigation).toEqual([
      { label: "홈", to: "/home" },
      { label: "훈련", to: "/training" },
      { label: "팀", to: "/home/team" },
      { label: "커리어", to: "/player/me/career" },
      { label: "영상", to: "/video" },
    ]);
  });

  it("hides hard-disabled routes and returns forbidden for unverified manager access", () => {
    expect(resolveRouteAccess({ path: "/epts", role: "PLAYER", verifiedGrants: [] })).toMatchObject({ allowed: false, reason: "FEATURE_HARD_DISABLED" });
    expect(resolveRouteAccess({ path: "/manager", role: "MANAGER", verifiedGrants: [] })).toMatchObject({ allowed: false, reason: "ROLE_GRANT_REQUIRED" });
  });
});
