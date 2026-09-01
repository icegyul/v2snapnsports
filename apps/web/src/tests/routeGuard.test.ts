import { describe, expect, it } from "vitest";
import { resolveRouteGuard, routeNeedsSession } from "../routes/routeGuard";

const noGrants = { verifiedGrants: [], accountType: "PLAYER" as const };
const coach = { verifiedGrants: [{ role: "COACH" as const }], accountType: "MANAGER" as const };
const admin = { verifiedGrants: [], accountType: "ADMIN" as const };

describe("public routes", () => {
  it("lets anyone reach the ways in", () => {
    for (const path of ["/login", "/signup/role", "/invite/guardian/abc"]) {
      expect(resolveRouteGuard(path, noGrants)).toEqual({ allowed: true });
    }
  });
});

describe("player routes", () => {
  it("open to a signed-in player", () => {
    for (const path of ["/home", "/home/full", "/training", "/matches", "/video", "/player/me/card"]) {
      expect(resolveRouteGuard(path, noGrants).allowed).toBe(true);
    }
  });
});

describe("manager routes", () => {
  it("refuse a player who typed the address", () => {
    const guard = resolveRouteGuard("/manager/coach", noGrants);
    expect(guard).toEqual({ allowed: false, reason: "ROLE_GRANT_REQUIRED" });
  });

  it("refuse the manager landing page without any verified grant", () => {
    expect(resolveRouteGuard("/manager", noGrants).allowed).toBe(false);
  });

  it("open once a verified grant exists", () => {
    expect(resolveRouteGuard("/manager", coach).allowed).toBe(true);
    expect(resolveRouteGuard("/manager/coach", coach).allowed).toBe(true);
  });

  it("stay closed when the grant is not verified", () => {
    const revoked = { verifiedGrants: [], accountType: "MANAGER" as const };
    expect(resolveRouteGuard("/manager/coach", revoked).allowed).toBe(false);
  });
});

describe("admin routes", () => {
  it("refuse a player, and say why", () => {
    const guard = resolveRouteGuard("/admin/audit", noGrants);
    expect(guard).toEqual({ allowed: false, reason: "ADMIN_ONLY" });
  });

  it("refuse a manager holding an ordinary grant", () => {
    expect(resolveRouteGuard("/admin", coach).allowed).toBe(false);
  });

  it("open to an admin account", () => {
    expect(resolveRouteGuard("/admin", admin).allowed).toBe(true);
    expect(resolveRouteGuard("/admin/privacy", admin).allowed).toBe(true);
  });
});

describe("hard-disabled features", () => {
  it("stay closed to everyone, admin included", () => {
    expect(resolveRouteGuard("/epts", admin)).toEqual({ allowed: false, reason: "FEATURE_HARD_DISABLED" });
  });
});

describe("prefix matching", () => {
  it("does not let a lookalike path slip past the manager rule", () => {
    expect(resolveRouteGuard("/manager-notes", noGrants).allowed).toBe(true);
    expect(resolveRouteGuard("/managerial", noGrants).allowed).toBe(true);
  });

  it("guards every path under a protected prefix", () => {
    expect(resolveRouteGuard("/admin/anything/deeper", noGrants).allowed).toBe(false);
    expect(resolveRouteGuard("/manager/coach/detail", noGrants).allowed).toBe(false);
  });
});

describe("routeNeedsSession", () => {
  it("waits only for the screens that could leak", () => {
    expect(routeNeedsSession("/admin")).toBe(true);
    expect(routeNeedsSession("/manager/coach")).toBe(true);
  });

  it("never delays the screens everyone may see", () => {
    for (const path of ["/home", "/training", "/login", "/signup/role", "/player/me/card"]) {
      expect(routeNeedsSession(path)).toBe(false);
    }
  });
});
