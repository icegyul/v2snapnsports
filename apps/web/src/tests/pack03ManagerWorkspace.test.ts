import { describe, expect, it } from "vitest";
import { createManagerWorkspaceSession, createMemoryActiveRoleStore } from "../../../../packages/pack03/workspaces";

const grants = [
  { id: "coach-a", role: "COACH" as const, status: "VERIFIED" as const, tenantId: "tenant-a", clubId: "club-a", teamIds: ["team-a"] },
  { id: "referee-a", role: "REFEREE" as const, status: "VERIFIED" as const, tenantId: "tenant-a", clubId: "club-a", teamIds: ["team-a"] },
  { id: "analyst-a", role: "ANALYST" as const, status: "VERIFIED" as const, tenantId: "tenant-a", clubId: "club-a", teamIds: ["team-a"] }
];
const account = { actorUserId: "manager-a", tenantId: "tenant-a", teamIds: ["team-a"], accountState: "ACTIVE" as const, consents: [], guardianRelations: [], safeguardingBlocked: false, feature: "CORE" as const };

describe("PACK 03 manager workspace role ownership", () => {
  it("denies a Manager without a verified grant even when RolePreference says Coach", () => {
    const session = createManagerWorkspaceSession({ ...account, rolePreference: "COACH", grants: [] }, createMemoryActiveRoleStore());
    expect(() => session.switchActiveRole("missing")).toThrow("ROLE_NOT_VERIFIED");
  });

  it("persists an active verified role and removes stale Coach capabilities after switching to Referee", () => {
    const store = createMemoryActiveRoleStore();
    const session = createManagerWorkspaceSession({ ...account, grants }, store);
    session.switchActiveRole("coach-a");
    expect(session.currentWorkspace().role).toBe("COACH");
    expect(session.authorize("COACH_START_SESSION", { tenantId: "tenant-a", clubId: "club-a", teamId: "team-a" }).decision).toBe("ALLOW");
    session.switchActiveRole("referee-a");
    expect(session.currentWorkspace().role).toBe("REFEREE");
    expect(session.authorize("COACH_START_SESSION", { tenantId: "tenant-a", clubId: "club-a", teamId: "team-a" }).decision).toBe("DENY");
    expect(createManagerWorkspaceSession({ ...account, grants }, store).currentWorkspace().role).toBe("REFEREE");
  });

  it("denies expired, wrong-tenant, wrong-team, and wrong-club workspace access", () => {
    const session = createManagerWorkspaceSession({ ...account, grants: [{ ...grants[0], status: "EXPIRED" as const }, grants[1]] }, createMemoryActiveRoleStore());
    expect(() => session.switchActiveRole("coach-a")).toThrow("ROLE_NOT_VERIFIED");
    session.switchActiveRole("referee-a");
    expect(session.authorize("REFEREE_MATCH_CENTER", { tenantId: "tenant-b", clubId: "club-a", teamId: "team-a" })).toMatchObject({ decision: "DENY", reason: "TENANT_MISMATCH" });
    expect(session.authorize("REFEREE_MATCH_CENTER", { tenantId: "tenant-a", clubId: "club-a", teamId: "team-b" })).toMatchObject({ decision: "DENY", reason: "TEAM_SCOPE_MISMATCH" });
    expect(session.authorize("REFEREE_MATCH_CENTER", { tenantId: "tenant-a", clubId: "club-b", teamId: "team-a" })).toMatchObject({ decision: "DENY", reason: "CLUB_SCOPE_MISMATCH" });
  });

  it("projects only the canonical navigation for each active role", () => {
    const session = createManagerWorkspaceSession({ ...account, grants }, createMemoryActiveRoleStore());
    session.switchActiveRole("analyst-a");
    expect(session.currentWorkspace().navigation).toEqual(["전술 보기", "경기 분석", "더보기"]);
    expect(session.authorize("ANALYST_TACTICS_READ", { tenantId: "tenant-a", clubId: "club-a", teamId: "team-a" }).decision).toBe("ALLOW");
    expect(session.authorize("COACH_START_SESSION", { tenantId: "tenant-a", clubId: "club-a", teamId: "team-a" }).decision).toBe("DENY");
  });
});
