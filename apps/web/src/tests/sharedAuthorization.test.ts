import { describe, expect, it } from "vitest";
import { authorize, createAuditEvent, protectedOperationPolicies, type AuthorizationContext } from "../lib/sharedAuthorization";

const base: AuthorizationContext = { actorUserId: "player-1", accountState: "ACTIVE", tenantId: "tenant-a", teamIds: ["team-a"], athleteId: "player-1", verifiedRoleGrants: [], guardianRelations: [], consents: [], safeguardingBlocked: false, feature: "CORE", operation: "player:self-read" };

describe("P2 shared authorization and safety", () => {
  it.each([
    ["SEC-001 unauthenticated", { ...base, actorUserId: null }, "UNAUTHENTICATED"],
    ["SEC-002 preference is not permission", { ...base, operation: "team:manage", rolePreference: "COACH" }, "ROLE_NOT_VERIFIED"],
    ["SEC-003 unverified manager", { ...base, operation: "team:manage" }, "ROLE_NOT_VERIFIED"],
    ["SEC-004 cross tenant", { ...base, operation: "team:read", resourceTenantId: "tenant-b" }, "TENANT_MISMATCH"],
    ["SEC-005 cross team", { ...base, operation: "team:read", resourceTeamId: "team-b" }, "TEAM_SCOPE_MISMATCH"],
    ["SEC-006 other athlete private", { ...base, operation: "athlete:private-read", resourceAthleteId: "player-2" }, "RESOURCE_SCOPE_MISMATCH"],
    ["SEC-007 unrelated guardian", { ...base, accountType: "GUARDIAN" as const, operation: "athlete:private-read", resourceAthleteId: "minor-1" }, "GUARDIAN_RELATION_REQUIRED"],
    ["SEC-008 revoked guardian", { ...base, accountType: "GUARDIAN" as const, operation: "athlete:private-read", resourceAthleteId: "minor-1", guardianRelations: [{ athleteId: "minor-1", status: "REVOKED" as const }] }, "GUARDIAN_RELATION_REQUIRED"],
    ["SEC-009 revoked consent", { ...base, operation: "portfolio:share", resourceAthleteId: "player-1", consents: [{ purpose: "PORTFOLIO_SHARE" as const, athleteId: "player-1", status: "REVOKED" as const }] }, "CONSENT_REVOKED"],
    ["SEC-010 agent minor contact", { ...base, operation: "minor:direct-contact", verifiedRoleGrants: [{ role: "AGENT" as const, tenantId: "tenant-a", status: "VERIFIED" as const }] }, "SAFEGUARDING_BLOCK"],
    ["SEC-011 referee private data", { ...base, operation: "athlete:private-read", resourceAthleteId: "minor-1", verifiedRoleGrants: [{ role: "REFEREE" as const, tenantId: "tenant-a", status: "VERIFIED" as const }] }, "RESOURCE_SCOPE_MISMATCH"],
    ["SEC-012 analyst other team", { ...base, operation: "team:read", resourceTeamId: "team-b", verifiedRoleGrants: [{ role: "ANALYST" as const, tenantId: "tenant-a", teamIds: ["team-a"], status: "VERIFIED" as const }] }, "TEAM_SCOPE_MISMATCH"],
    ["SEC-013 self escalation", { ...base, operation: "role:self-grant", verifiedRoleGrants: [{ role: "COACH" as const, tenantId: "tenant-a", status: "VERIFIED" as const }] }, "SAFEGUARDING_BLOCK"],
    ["SEC-014 hard feature", { ...base, feature: "EPTS" as const }, "FEATURE_DISABLED"],
    ["SEC-015 safeguarding block", { ...base, operation: "communication:private", safeguardingBlocked: true }, "SAFEGUARDING_BLOCK"],
  ])("denies %s", (_label, context, reason) => expect(authorize(context as AuthorizationContext)).toMatchObject({ decision: "DENY", reason }));

  it("SEC-016 allows Player self scope", () => expect(authorize(base)).toMatchObject({ decision: "ALLOW" }));
  it("SEC-017 allows a verified Coach for the scoped team", () => expect(authorize({ ...base, operation: "team:manage", verifiedRoleGrants: [{ role: "COACH", tenantId: "tenant-a", teamIds: ["team-a"], status: "VERIFIED" }] })).toMatchObject({ decision: "ALLOW" }));
  it("SEC-018 allows Guardian scope only with active relation", () => expect(authorize({ ...base, accountType: "GUARDIAN", operation: "athlete:private-read", resourceAthleteId: "minor-1", guardianRelations: [{ athleteId: "minor-1", status: "ACTIVE" }] })).toMatchObject({ decision: "ALLOW" }));

  it("maps every protected P1 operation to a policy and redacts audit metadata", () => {
    expect(protectedOperationPolicies).toHaveProperty("createPortfolioShareGrant");
    expect(createAuditEvent({ ...base, requestId: "request-1", operation: "team:manage", rawToken: "secret", privateBody: "sensitive" }, authorize({ ...base, operation: "team:manage", verifiedRoleGrants: [{ role: "COACH", tenantId: "tenant-a", teamIds: ["team-a"], status: "VERIFIED" }] }))).not.toHaveProperty("rawToken");
  });
});
