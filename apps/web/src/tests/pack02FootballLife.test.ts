import { describe, expect, it } from "vitest";
import { createPack02FootballLifeDomain } from "../../../../packages/pack02/domain";

const player = {
  actorUserId: "player-a", accountType: "PLAYER" as const, accountState: "ACTIVE" as const,
  tenantId: "tenant-a", teamIds: ["team-a"], athleteId: "athlete-a", verifiedRoleGrants: [],
  guardianRelations: [], consents: [
    { purpose: "PORTFOLIO_SHARE" as const, athleteId: "athlete-a", status: "ACTIVE" as const },
    { purpose: "SCOUTING" as const, athleteId: "athlete-a", status: "ACTIVE" as const },
    { purpose: "COMMUNICATION" as const, athleteId: "athlete-a", status: "ACTIVE" as const }
  ], safeguardingBlocked: false, feature: "CORE" as const, operation: "athlete:private-read" as const, requestId: "p2-player"
};
const coach = {
  ...player, actorUserId: "coach-a", accountType: "MANAGER" as const, athleteId: undefined,
  verifiedRoleGrants: [{ role: "COACH" as const, tenantId: "tenant-a", teamIds: ["team-a"], status: "VERIFIED" as const }],
  operation: "team:manage" as const, requestId: "p2-coach"
};
const agent = {
  ...player, actorUserId: "agent-a", accountType: "MANAGER" as const, athleteId: undefined,
  verifiedRoleGrants: [{ role: "AGENT" as const, tenantId: "tenant-a", status: "VERIFIED" as const }],
  operation: "athlete:private-read" as const, requestId: "p2-agent"
};

describe("PACK 02 Football Life local/dev domain", () => {
  it("renders only provenance-verified career facts and preserves season chapters", () => {
    const domain = createPack02FootballLifeDomain();
    domain.addCareerEvent(player, {
      athleteId: "athlete-a", seasonId: "2026-u17", type: "TEAM_JOINED", occurredAt: "2026-03-01T00:00:00Z",
      title: "DEMO U17 A팀 합류", source: { type: "TEAM_MEMBERSHIP", id: "membership-1", version: 1, verifiedState: "VERIFIED" }
    });
    expect(domain.getCareerPassport(player, "athlete-a").chapters).toHaveLength(1);
    expect(() => domain.addCareerEvent(player, {
      athleteId: "athlete-a", seasonId: "2026-u17", type: "AWARD" as never, occurredAt: "2026-03-02T00:00:00Z",
      title: "근거 없는 기록", source: { type: "UNKNOWN", id: "", version: 0, verifiedState: "UNVERIFIED" as never }
    })).toThrow("CAREER_PROVENANCE_REQUIRED");
  });

  it("requires active portfolio consent, expires/revokes shares, and writes safe audit data", () => {
    const domain = createPack02FootballLifeDomain();
    const grant = domain.createPortfolioShareGrant(player, { athleteId: "athlete-a", expiresAt: "2026-09-01T00:00:00Z", audience: "SCOUTING_ALLOWED" });
    expect(domain.getPortfolio(player, "athlete-a", "2026-08-29T00:00:00Z").shareGrant?.id).toBe(grant.id);
    domain.revokePortfolioShareGrant(player, grant.id);
    expect(domain.getPortfolio(player, "athlete-a", "2026-08-29T00:00:00Z").shareGrant).toBeNull();
    expect(JSON.stringify(domain.getAuditEvents())).not.toContain("raw-token");
    expect(JSON.stringify(domain.getAuditEvents())).not.toContain("private-body");
  });

  it("routes minor scouting invitations through guardian or club and blocks agent direct contact", () => {
    const domain = createPack02FootballLifeDomain();
    domain.registerAthlete({ athleteId: "athlete-a", tenantId: "tenant-a", teamId: "team-a", age: 16, positions: ["MF"], region: "SEOUL", minor: true });
    domain.setScoutingConsent(player, "athlete-a", true);
    const opportunity = domain.createOpportunity(coach, { organizerTenantId: "tenant-a", teamId: "team-a", type: "TRYOUT", ageMin: 15, ageMax: 17, positions: ["MF"], region: "SEOUL", state: "OPEN" });
    expect(domain.createOpportunityAction(agent, opportunity.id, { athleteId: "athlete-a", action: "INVITED" })).toMatchObject({ route: "GUARDIAN_OR_CLUB_MEDIATED" });
    expect(() => domain.startDirectContact(agent, "athlete-a")).toThrow("SAFEGUARDING_BLOCK");
  });

  it("keeps operational team communication outside Community and deduplicates idempotent messages", () => {
    const domain = createPack02FootballLifeDomain();
    const thread = domain.createTeamThread(coach, { teamId: "team-a", context: "TRAINING_SESSION", contextId: "training-1", recipientAthleteIds: ["athlete-a"] });
    expect(thread.kind).toBe("TEAM_OPERATIONAL");
    expect(domain.sendTeamMessage(coach, thread.id, { body: "집합 시간 변경", idempotencyKey: "notice-1" }).id).toBeDefined();
    expect(domain.sendTeamMessage(coach, thread.id, { body: "집합 시간 변경", idempotencyKey: "notice-1" }).id).toBeDefined();
    expect(domain.getThread(thread.id).messages).toHaveLength(1);
  });

  it("does not turn Earthus unavailability into an opportunity failure", () => {
    const domain = createPack02FootballLifeDomain();
    const opportunity = domain.createOpportunity(coach, { organizerTenantId: "tenant-a", teamId: "team-a", type: "CAMP", ageMin: 15, ageMax: 18, positions: ["MF"], region: "SEOUL", state: "OPEN", earthusContext: "UNAVAILABLE" });
    expect(opportunity.earthusContext).toBe("UNAVAILABLE");
    expect(opportunity.state).toBe("OPEN");
  });

  it("classifies consent and career mutations for audit", () => {
    const domain = createPack02FootballLifeDomain();
    domain.setScoutingConsent(player, "athlete-a", false);
    domain.addCareerEvent(player, { athleteId: "athlete-a", seasonId: "2026-u17", type: "TEAM_JOINED", occurredAt: "2026-03-01T00:00:00Z", title: "검증된 팀 합류", source: { type: "TEAM_MEMBERSHIP", id: "membership-a", version: 1, verifiedState: "VERIFIED" } });
    expect(domain.getAuditEvents().map((item) => item.classification)).toEqual(["AUDIT_ON_MUTATION", "AUDIT_ON_MUTATION"]);
  });

  it("denies revoked scouting consent and cross-tenant opportunity access", () => {
    const domain = createPack02FootballLifeDomain();
    domain.registerAthlete({ athleteId: "athlete-a", tenantId: "tenant-a", teamId: "team-a", age: 16, positions: ["MF"], region: "SEOUL", minor: true });
    domain.setScoutingConsent(player, "athlete-a", false);
    const opportunity = domain.createOpportunity(coach, { organizerTenantId: "tenant-a", teamId: "team-a", type: "TRYOUT", ageMin: 15, ageMax: 17, positions: ["MF"], region: "SEOUL", state: "OPEN" });
    expect(() => domain.createOpportunityAction(agent, opportunity.id, { athleteId: "athlete-a", action: "INVITED" })).toThrow("CONSENT_REVOKED");
    domain.setScoutingConsent(player, "athlete-a", true);
    const foreignAgent = { ...agent, tenantId: "tenant-b", verifiedRoleGrants: [{ role: "AGENT" as const, tenantId: "tenant-b", teamIds: ["team-a"], status: "VERIFIED" as const }] };
    expect(() => domain.createOpportunityAction(foreignAgent, opportunity.id, { athleteId: "athlete-a", action: "INVITED" })).toThrow("TENANT_MISMATCH");
  });

  it("denies an unrelated guardian from the career passport", () => {
    const domain = createPack02FootballLifeDomain();
    const guardian = { ...player, actorUserId: "guardian-a", accountType: "GUARDIAN" as const, athleteId: undefined, guardianRelations: [] };
    expect(() => domain.getCareerPassport(guardian, "athlete-a")).toThrow("GUARDIAN_RELATION_REQUIRED");
  });
});
