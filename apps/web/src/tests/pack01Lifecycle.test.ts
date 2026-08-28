import { describe, expect, it } from "vitest";
import { createPack01Domain } from "../../../../packages/pack01/domain";

const coach = { actorUserId: "coach", accountState: "ACTIVE" as const, tenantId: "tenant-a", teamIds: ["team-a"], verifiedRoleGrants: [{ role: "COACH" as const, tenantId: "tenant-a", teamIds: ["team-a"], status: "VERIFIED" as const }], guardianRelations: [], consents: [], safeguardingBlocked: false, feature: "CORE" as const, operation: "team:manage" as const };

describe("PACK 01 canonical lifecycles", () => {
  it("accepts canonical Training transitions without adding PAUSED", () => {
    const domain = createPack01Domain(); const session = domain.createTrainingSession(coach, { teamId: "team-a", objective: "전환" });
    for (const state of ["READY", "CHECK_IN", "LIVE", "ENDED", "PROCESSING", "REVIEW"] as const) expect(domain.transitionTraining(coach, session.id, state, session.version).state).toBe(state);
    expect(() => domain.transitionTraining(coach, session.id, "PAUSED" as never, session.version)).toThrow("TRAINING_TRANSITION_INVALID");
  });
  it("rejects stale Training version and invalid Match transitions", () => {
    const domain = createPack01Domain(); const session = domain.createTrainingSession(coach, { teamId: "team-a", objective: "전환" }); domain.transitionTraining(coach, session.id, "READY", 1);
    expect(() => domain.transitionTraining(coach, session.id, "LIVE", 1)).toThrow("VERSION_CONFLICT");
    const match = domain.createMatch(coach, { teamId: "team-a", opponent: "DEMO" }); expect(() => domain.transitionMatch(coach, match.id, "FINALIZED", 1)).toThrow("MATCH_TRANSITION_INVALID");
  });
  it("accepts all 12 physical canonical Match event types", () => {
    const domain = createPack01Domain(); const match = domain.createMatch(coach, { teamId: "team-a", opponent: "DEMO" }); domain.updateRoster(coach, match.id, ["player-a"]);
    ["MATCH_START", "PERIOD_START", "PERIOD_END", "GOAL", "OWN_GOAL", "SUBSTITUTION", "YELLOW_CARD", "RED_CARD", "INCIDENT", "ADDED_TIME", "MATCH_END", "CORRECTION"].forEach((type, index) => domain.recordMatchEvent(coach, match.id, { idempotencyKey: `event-${index}`, type, athleteId: "player-a" }));
    expect(domain.getMatch(match.id).events).toHaveLength(12);
  });
  it("retries transient offline command, resumes once, and preserves conflicts", () => {
    const queue = createPack01Domain().createOfflineQueue(); queue.enqueue({ id: "local-1", idempotencyKey: "queue-1", action: "MATCH_EVENT", failOnce: true });
    expect(queue.reconnect()).toEqual({ applied: [], conflicts: [], retryable: ["local-1"] }); expect(queue.reconnect()).toEqual({ applied: ["local-1"], conflicts: [], retryable: [] });
    queue.enqueue({ id: "local-2", idempotencyKey: "queue-2", action: "MATCH_EVENT", conflict: true }); expect(queue.reconnect().conflicts).toEqual(["local-2"]);
  });
});
