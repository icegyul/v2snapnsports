import { describe, expect, it } from "vitest";
import { createManagerWorkspaceSession, createMemoryActiveRoleStore } from "../../../../packages/pack03/workspaces";
import { createManagerWorkspaceProducts } from "../../../../packages/pack03/productWorkspace";

const grants = [
  { id: "coach", role: "COACH" as const, status: "VERIFIED" as const, tenantId: "tenant-a", clubId: "club-a", teamIds: ["team-a"] },
  { id: "manager", role: "TEAM_MANAGER" as const, status: "VERIFIED" as const, tenantId: "tenant-a", clubId: "club-a", teamIds: ["team-a"] },
  { id: "director", role: "CLUB_DIRECTOR" as const, status: "VERIFIED" as const, tenantId: "tenant-a", clubId: "club-a", teamIds: ["team-a"] },
  { id: "referee", role: "REFEREE" as const, status: "VERIFIED" as const, tenantId: "tenant-a", clubId: "club-a", teamIds: ["team-a"] },
  { id: "agent", role: "AGENT" as const, status: "VERIFIED" as const, tenantId: "tenant-a", clubId: "club-a", teamIds: ["team-a"] },
  { id: "analyst", role: "ANALYST" as const, status: "VERIFIED" as const, tenantId: "tenant-a", clubId: "club-a", teamIds: ["team-a"] }
];
const session = createManagerWorkspaceSession({ actorUserId: "manager-a", tenantId: "tenant-a", teamIds: ["team-a"], accountState: "ACTIVE", grants, consents: [{ purpose: "SCOUTING", athleteId: "athlete-a", status: "ACTIVE" }], guardianRelations: [], safeguardingBlocked: false, feature: "CORE" }, createMemoryActiveRoleStore());

describe("PACK 03 cross-pack workspace projections", () => {
  it("uses PACK 01 session lifecycle for Coach rather than a new Training state machine", () => {
    const products = createManagerWorkspaceProducts(session);
    session.switchActiveRole("coach");
    expect(products.startCoachSession().state).toBe("LIVE");
    expect(products.createCoachPlanRevision().version).toBeGreaterThan(1);
  });

  it("uses PACK 01 schedule for Team Manager and exact referee assignment for report", () => {
    const products = createManagerWorkspaceProducts(session);
    session.switchActiveRole("manager");
    expect(products.teamSchedule().map((item) => item.type)).toContain("TRAINING");
    session.switchActiveRole("referee");
    expect(products.submitRefereeReport().state).toBe("DRAFT");
  });

  it("keeps Agent opportunity mediated and Analyst tactical playback read-only", () => {
    const products = createManagerWorkspaceProducts(session);
    session.switchActiveRole("agent");
    expect(products.requestAgentOpportunity().route).toBe("GUARDIAN_OR_CLUB_MEDIATED");
    session.switchActiveRole("analyst");
    expect(products.analystPlayback()).toMatchObject({ mode: "STATIC", editable: false });
  });
});
