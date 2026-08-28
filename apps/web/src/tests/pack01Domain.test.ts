import { describe, expect, it } from "vitest";
import { createPack01Domain } from "../../../../packages/pack01/domain";

const coach = { actorUserId: "coach-1", accountState: "ACTIVE" as const, tenantId: "tenant-a", teamIds: ["team-a"], verifiedRoleGrants: [{ role: "COACH" as const, tenantId: "tenant-a", teamIds: ["team-a"], status: "VERIFIED" as const }], guardianRelations: [], consents: [], safeguardingBlocked: false, feature: "CORE" as const, operation: "team:manage" as const, resourceTenantId: "tenant-a", resourceTeamId: "team-a" };

describe("PACK 01 local/dev domain", () => {
  it("creates immutable training plan revisions and rejects stale updates", () => {
    const domain = createPack01Domain();
    const session = domain.createTrainingSession(coach, { teamId: "team-a", objective: "패스 선택" });
    const first = domain.updateTrainingPlan(coach, session.id, { objective: "패스", drills: ["rondo"] }, 1);
    const second = domain.updateTrainingPlan(coach, session.id, { objective: "전환", drills: ["transition"] }, first.version);
    expect(second.version).toBe(3);
    expect(() => domain.updateTrainingPlan(coach, session.id, { objective: "충돌", drills: [] }, first.version)).toThrow("VERSION_CONFLICT");
  });

  it("keeps participation separate from final attendance and denies cross-team changes", () => {
    const domain = createPack01Domain();
    const session = domain.createTrainingSession(coach, { teamId: "team-a", objective: "볼 보호" });
    expect(domain.setParticipation({ ...coach, actorUserId: "player-a", athleteId: "player-a", operation: "player:self-read" }, session.id, "player-a", "GOING").response).toBe("GOING");
    expect(() => domain.setAttendance({ ...coach, teamIds: ["team-b"], verifiedRoleGrants: [{ role: "COACH", tenantId: "tenant-a", teamIds: ["team-b"], status: "VERIFIED" }] }, session.id, "player-a", "PRESENT")).toThrow("TEAM_SCOPE_MISMATCH");
  });

  it("records canonical match events once and enforces roster/lineup captain scope", () => {
    const domain = createPack01Domain();
    const match = domain.createMatch(coach, { teamId: "team-a", opponent: "DEMO B" });
    domain.updateRoster(coach, match.id, ["player-a", "player-b"]);
    domain.updateLineup(coach, match.id, { starters: ["player-a"], substitutes: ["player-b"], captain: "player-a" });
    expect(domain.recordMatchEvent(coach, match.id, { idempotencyKey: "event-1", type: "GOAL", athleteId: "player-a" }).events).toHaveLength(1);
    expect(domain.recordMatchEvent(coach, match.id, { idempotencyKey: "event-1", type: "GOAL", athleteId: "player-a" }).events).toHaveLength(1);
    expect(() => domain.recordMatchEvent(coach, match.id, { idempotencyKey: "event-2", type: "NOT_CANONICAL", athleteId: "player-a" })).toThrow("MATCH_EVENT_TYPE_INVALID");
  });

  it("allows referee match actions only with exact assigned match scope", () => {
    const domain = createPack01Domain();
    const match = domain.createMatch(coach, { teamId: "team-a", opponent: "DEMO B" });
    const referee = { ...coach, actorUserId: "ref-1", operation: "team:manage" as const, verifiedRoleGrants: [{ role: "REFEREE" as const, tenantId: "tenant-a", teamIds: ["team-a"], status: "VERIFIED" as const }] };
    expect(() => domain.createMatchReport(referee, match.id, "보고")).toThrow("REFEREE_ASSIGNMENT_REQUIRED");
    domain.assignReferee(coach, match.id, "ref-1");
    expect(domain.createMatchReport(referee, match.id, "보고").state).toBe("DRAFT");
  });

  it("versions 2D tactics and keeps 3D playback as a static-safe projection", () => {
    const domain = createPack01Domain();
    const tactic = domain.createTactic(coach, { teamId: "team-a", name: "전환" });
    domain.createTacticVersion(coach, tactic.id, { mode: "PLAN_TACTIC", paths: ["pass"] });
    expect(domain.getTacticalPlayback(coach, tactic.id)).toMatchObject({ mode: "STATIC", editable: false });
  });

  it("replays offline field commands once and retains conflicts", () => {
    const domain = createPack01Domain();
    const queue = domain.createOfflineQueue();
    queue.enqueue({ id: "local-1", idempotencyKey: "offline-1", action: "TRAINING_EVENT" });
    expect(queue.reconnect()).toEqual({ applied: ["local-1"], conflicts: [], retryable: [] });
    expect(queue.reconnect()).toEqual({ applied: [], conflicts: [], retryable: [] });
  });
});
