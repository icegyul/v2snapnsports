import { describe, expect, it } from "vitest";
import { createPack01Domain } from "../../../../packages/pack01/domain";

const coach = { actorUserId: "coach", accountState: "ACTIVE" as const, tenantId: "tenant-a", teamIds: ["team-a"], verifiedRoleGrants: [{ role: "COACH" as const, tenantId: "tenant-a", teamIds: ["team-a"], status: "VERIFIED" as const }], guardianRelations: [], consents: [], safeguardingBlocked: false, feature: "CORE" as const, operation: "team:manage" as const, requestId: "audit-1" };

describe("PACK 01 final evidence gaps", () => {
  it("projects ordered team-scoped Training and Match schedule routes", () => {
    const d = createPack01Domain(); const training = d.createTrainingSession(coach, { teamId: "team-a", objective: "패스", startAt: "2026-08-29T10:00:00Z" }); const match = d.createMatch(coach, { teamId: "team-a", opponent: "DEMO", startAt: "2026-08-30T10:00:00Z" });
    expect(d.getUpcomingSchedule(coach).map((x) => x.targetRoute)).toEqual([`/training/${training.id}`, `/matches/${match.id}`]);
    expect(() => d.getUpcomingSchedule({ ...coach, teamIds: ["team-b"] })).toThrow("TEAM_SCOPE_MISMATCH");
  });
  it("writes safe P2 audit evidence once for sensitive mutation and offline replay", () => {
    const d = createPack01Domain(); const session = d.createTrainingSession(coach, { teamId: "team-a", objective: "패스" }); d.transitionTraining(coach, session.id, "READY", 1);
    const audit = d.getAuditEvents(); expect(audit).toHaveLength(1); expect(audit[0]).not.toHaveProperty("rawToken");
    const queue = d.createOfflineQueue(); queue.enqueue({ id: "offline", idempotencyKey: "audit-once", action: "TRAINING_EVENT" }); queue.reconnect(); queue.reconnect(); expect(d.getAuditEvents().filter((x) => x.event.eventId.includes("audit-once"))).toHaveLength(1);
  });
});
