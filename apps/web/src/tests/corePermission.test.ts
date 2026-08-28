import { describe, expect, it } from "vitest";
import { decideAuthorization } from "../lib/authorization";

describe("Core Product permission boundary", () => {
  const coach = { accountId: "coach-1", rolePreference: "MANAGER" as const, grants: [{ role: "COACH" as const, tenantId: "tenant-a", teamId: "team-a", verified: true }] };

  it("denies a verified role grant outside its tenant", () => {
    expect(decideAuthorization({ actor: coach, action: "team:manage", tenantId: "tenant-b", teamId: "team-a" })).toMatchObject({ allowed: false, code: "TENANT_SCOPE_DENIED" });
  });

  it("denies a verified role grant outside its team", () => {
    expect(decideAuthorization({ actor: coach, action: "team:manage", tenantId: "tenant-a", teamId: "team-b" })).toMatchObject({ allowed: false, code: "TEAM_SCOPE_DENIED" });
  });

  it("keeps a guardian outside the linked minor's private data", () => {
    expect(decideAuthorization({ actor: { accountId: "guardian-1", rolePreference: "PLAYER", grants: [] }, action: "athlete:private-read", tenantId: "tenant-a", athleteId: "minor-1" })).toMatchObject({ allowed: false, code: "SUBJECT_SCOPE_DENIED" });
  });
});
