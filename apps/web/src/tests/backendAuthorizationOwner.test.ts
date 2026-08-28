import { describe, expect, it } from "vitest";
import { authorize } from "../../../../packages/shared-security/authorization";
import { createSafeAuditEvent } from "../../../../backend/src/shared/audit";

const base = { actorUserId: "coach", accountState: "ACTIVE" as const, tenantId: "tenant-a", teamIds: ["team-a"], verifiedRoleGrants: [{ role: "COACH" as const, tenantId: "tenant-a", teamIds: ["team-a"], status: "VERIFIED" as const }], guardianRelations: [], consents: [], safeguardingBlocked: false, feature: "CORE" as const, operation: "team:manage" as const, resourceTenantId: "tenant-a", resourceTeamId: "team-a", requestId: "p2-test" };

describe("P2 backend shared owner", () => {
  it("authorizes at the shared backend owner without frontend helper", () => expect(authorize(base)).toMatchObject({ decision: "ALLOW" }));
  it("classifies sensitive mutation audit with redacted payload", () => {
    const record = createSafeAuditEvent({ ...base, rawToken: "secret", privateBody: "private" }, authorize(base));
    expect(record.classification).toBe("AUDIT_ON_MUTATION");
    expect(record.event).not.toHaveProperty("rawToken");
    expect(record.event).not.toHaveProperty("privateBody");
  });
});
