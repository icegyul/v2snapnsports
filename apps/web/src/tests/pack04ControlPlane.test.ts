import { describe, expect, it } from "vitest";
import { createAdminControlPlane } from "../../../../packages/pack04/controlPlane";
import { createManagerWorkspaceSession, createMemoryActiveRoleStore } from "../../../../packages/pack03/workspaces";

const base = { actorUserId: "operator-a", accountState: "ACTIVE" as const, tenantId: "tenant-a", teamIds: ["team-a"], verifiedRoleGrants: [], guardianRelations: [], consents: [], safeguardingBlocked: false, feature: "CORE" as const, operation: "admin:operate" as const };
const grants = [
  { id: "verification", role: "ROLE_VERIFICATION_OPERATOR" as const, status: "VERIFIED" as const, tenantId: "tenant-a" },
  { id: "moderator", role: "COMMUNITY_MODERATOR" as const, status: "VERIFIED" as const, tenantId: "tenant-a" },
  { id: "safety", role: "SAFEGUARDING_OFFICER" as const, status: "VERIFIED" as const, tenantId: "tenant-a", caseIds: ["case-a"] },
  { id: "privacy", role: "PRIVACY_OPERATOR" as const, status: "VERIFIED" as const, tenantId: "tenant-a" },
  { id: "migration", role: "MIGRATION_OPERATOR" as const, status: "VERIFIED" as const, tenantId: "tenant-a" },
  { id: "support", role: "SUPPORT" as const, status: "VERIFIED" as const, tenantId: "tenant-a" },
  { id: "system", role: "SYSTEM_ADMIN" as const, status: "VERIFIED" as const, tenantId: "tenant-a" }
];

describe("PACK 04 least-privilege control plane", () => {
  it("denies no-grant and wrong-role safeguarding/private access", () => {
    const control = createAdminControlPlane(base, grants);
    expect(control.authorize(null, "SAFEGUARDING_CASE_READ", { tenantId: "tenant-a", caseId: "case-a" })).toMatchObject({ decision: "DENY" });
    expect(control.authorize("support", "SAFEGUARDING_CASE_READ", { tenantId: "tenant-a", caseId: "case-a" })).toMatchObject({ decision: "DENY" });
    expect(control.authorize("moderator", "PRIVACY_REVIEW", { tenantId: "tenant-a" })).toMatchObject({ decision: "DENY" });
  });

  it("requires evidence and denies self-approval; revoke immediately invalidates PACK 03 role", () => {
    const managerGrant = { id: "coach-a", role: "COACH" as const, status: "VERIFIED" as const, tenantId: "tenant-a", clubId: "club-a", teamIds: ["team-a"] };
    const manager = createManagerWorkspaceSession({ actorUserId: "coach-a", tenantId: "tenant-a", teamIds: ["team-a"], accountState: "ACTIVE", grants: [managerGrant], consents: [], guardianRelations: [], safeguardingBlocked: false, feature: "CORE" }, createMemoryActiveRoleStore());
    manager.switchActiveRole("coach-a");
    const control = createAdminControlPlane(base, grants, [managerGrant]);
    expect(() => control.decideVerification("verification", { targetUserId: "operator-a", evidenceRef: "fixture-evidence", decision: "APPROVE" })).toThrow("SELF_APPROVAL_DENIED");
    expect(() => control.decideVerification("verification", { targetUserId: "coach-a", decision: "APPROVE" })).toThrow("VERIFICATION_EVIDENCE_REQUIRED");
    control.transitionManagerGrant("verification", "coach-a", "REVOKE");
    expect(() => manager.currentWorkspace()).toThrow("ROLE_NOT_VERIFIED");
  });

  it("keeps moderation projection-only and safeguarding case data case-scoped", () => {
    const control = createAdminControlPlane(base, grants);
    expect(control.reviewModeration("moderator", "report-a", "ACTIONED").mode).toBe("LOCAL_PROJECTION_ONLY");
    expect(control.readSafeguardingCase("safety", { tenantId: "tenant-a", caseId: "case-a" })).toMatchObject({ caseId: "case-a", restricted: true });
    expect(control.readSafeguardingCase("system", { tenantId: "tenant-a", caseId: "case-a" })).toMatchObject({ decision: "DENY" });
  });

  it("models privacy deletion, migration, jobs, and feature gates as safe non-production states", () => {
    const control = createAdminControlPlane(base, grants);
    expect(control.advancePrivacyRequest("privacy", "request-a", "DELETE").state).toBe("PRODUCTION_ACTION_BLOCKED");
    expect(control.runMigration("migration", "plan-a", "PRODUCTION").state).toBe("PRODUCTION_BLOCKED");
    expect(control.retryJob("system", "job-a").state).toBe("DEFERRED_INFRA_GATE");
    expect(control.featureGate("system", "EPTS")).toMatchObject({ enabled: false, mutable: false });
  });

  it("keeps Earthus unavailable soft and redacts audit payloads", () => {
    const control = createAdminControlPlane({ ...base, rawToken: "secret", privateBody: "private" }, grants);
    expect(control.earthusHealth()).toMatchObject({ status: "UNAVAILABLE", blocking: false });
    control.systemOverview("system");
    expect(JSON.stringify(control.getAuditEvents())).not.toContain("secret");
    expect(JSON.stringify(control.getAuditEvents())).not.toContain("private");
  });
});
