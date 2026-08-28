import { authorize, type AuthorizationContext, type Consent, type Operation } from "../shared-security/authorization";
import { createSafeAuditEvent } from "../../backend/src/shared/audit";

export type CareerEventType = "TEAM_JOINED" | "TEAM_LEFT" | "SEASON_STARTED" | "SEASON_COMPLETED" | "POSITION_CHANGED" | "TRAINING_MILESTONE" | "MATCH_PARTICIPATION" | "COACH_APPROVED_MILESTONE" | "REPRESENTATIVE_VIDEO_ADDED" | "USER_SELECTED_HIGHLIGHT";
export type OpportunityType = "TRYOUT" | "CAMP" | "ACADEMY_TEST" | "CONSULTATION";
export type OpportunityState = "DRAFT" | "OPEN" | "CLOSED" | "CANCELLED";
export type CommunicationContext = "TEAM" | "TRAINING_SESSION" | "MATCH" | "SCHEDULE_CHANGE" | "GUARDIAN_COMMUNICATION" | "OPPORTUNITY_MEDIATED";
export type ShareAudience = "PRIVATE" | "PLAYER_GUARDIAN" | "CLUB" | "SCOUTING_ALLOWED";

type AthleteProfile = { athleteId: string; tenantId: string; teamId: string; age: number; positions: string[]; region: string; minor: boolean };
type CareerEvent = { id: string; athleteId: string; seasonId: string; type: CareerEventType; occurredAt: string; title: string; source: { type: string; id: string; version: number; verifiedState: "VERIFIED" } };
type ShareGrant = { id: string; athleteId: string; expiresAt: string; audience: ShareAudience; mediatedBy?: "GUARDIAN" | "CLUB"; revokedAt?: string };
type Opportunity = { id: string; organizerTenantId: string; teamId: string; type: OpportunityType; ageMin: number; ageMax: number; positions: string[]; region: string; state: OpportunityState; earthusContext: "AVAILABLE" | "UNAVAILABLE" };
type TeamThread = { id: string; kind: "TEAM_OPERATIONAL"; teamId: string; context: CommunicationContext; contextId: string; recipientAthleteIds: string[]; messages: Array<{ id: string; body: string; idempotencyKey: string }> };
type OpportunityAction = { id: string; opportunityId: string; athleteId: string; action: "INTERESTED" | "INVITED" | "DECLINED" | "GUARDIAN_APPROVED" | "CLUB_APPROVED"; route: "DIRECT_PORTFOLIO" | "GUARDIAN_OR_CLUB_MEDIATED" };

const careerTypes = new Set<CareerEventType>(["TEAM_JOINED", "TEAM_LEFT", "SEASON_STARTED", "SEASON_COMPLETED", "POSITION_CHANGED", "TRAINING_MILESTONE", "MATCH_PARTICIPATION", "COACH_APPROVED_MILESTONE", "REPRESENTATIVE_VIDEO_ADDED", "USER_SELECTED_HIGHLIGHT"]);

function assertAllow(context: AuthorizationContext, operation: Operation, resource: Partial<AuthorizationContext> = {}) {
  const decision = authorize({ ...context, ...resource, operation });
  if (decision.decision === "DENY") throw new Error(decision.reason);
  return { context: { ...context, ...resource, operation } as AuthorizationContext, decision };
}

function assertSelfOrGuardian(context: AuthorizationContext, athleteId: string) {
  if (context.accountType !== "GUARDIAN" && context.athleteId !== athleteId) throw new Error("RESOURCE_SCOPE_MISMATCH");
  return assertAllow(context, "athlete:private-read", { resourceAthleteId: athleteId });
}

export function createPack02FootballLifeDomain() {
  let sequence = 0;
  const id = (prefix: string) => `${prefix}-${++sequence}`;
  const athletes = new Map<string, AthleteProfile>();
  const careerEvents: CareerEvent[] = [];
  const shareGrants = new Map<string, ShareGrant>();
  const opportunities = new Map<string, Opportunity>();
  const opportunityActions: OpportunityAction[] = [];
  const threads = new Map<string, TeamThread>();
  const audits: Array<ReturnType<typeof createSafeAuditEvent>> = [];
  const revokedConsent = new Set<string>();
  const audit = (context: AuthorizationContext, operation: Operation, resource: Partial<AuthorizationContext> = {}) => {
    const entry = assertAllow(context, operation, resource);
    audits.push(createSafeAuditEvent(entry.context, entry.decision));
  };
  const consentState = (context: AuthorizationContext, athleteId: string, purpose: Consent["purpose"]) => {
    const current = revokedConsent.has(`${athleteId}:${purpose}`) ? "REVOKED" : context.consents.find((item) => item.athleteId === athleteId && item.purpose === purpose)?.status;
    return [{ purpose, athleteId, status: current ?? "REVOKED" } as Consent];
  };
  const assertScouting = (context: AuthorizationContext, athleteId: string, operation: "scouting:eligibility" | "scouting:opportunity", resourceTeamId?: string, resourceTenantId?: string) =>
    assertAllow(context, operation, { resourceAthleteId: athleteId, resourceTeamId, resourceTenantId, consents: consentState(context, athleteId, "SCOUTING") });

  return {
    registerAthlete(profile: AthleteProfile) {
      athletes.set(profile.athleteId, { ...profile, positions: [...profile.positions] });
      return athletes.get(profile.athleteId)!;
    },
    setScoutingConsent(context: AuthorizationContext, athleteId: string, active: boolean) {
      assertSelfOrGuardian(context, athleteId);
      if (active) revokedConsent.delete(`${athleteId}:SCOUTING`); else revokedConsent.add(`${athleteId}:SCOUTING`);
      audit(context, "consent:manage", { resourceAthleteId: athleteId });
      return { athleteId, purpose: "SCOUTING" as const, status: active ? "ACTIVE" as const : "REVOKED" as const };
    },
    addCareerEvent(context: AuthorizationContext, input: Omit<CareerEvent, "id">) {
      assertSelfOrGuardian(context, input.athleteId);
      if (!careerTypes.has(input.type) || !input.source?.type || !input.source.id || input.source.version < 1 || input.source.verifiedState !== "VERIFIED") throw new Error("CAREER_PROVENANCE_REQUIRED");
      const event = { ...input, id: id("career-event") };
      careerEvents.push(event);
      audit(context, "career:write", { resourceAthleteId: input.athleteId });
      return event;
    },
    getCareerPassport(context: AuthorizationContext, athleteId: string) {
      assertSelfOrGuardian(context, athleteId);
      const events = careerEvents.filter((event) => event.athleteId === athleteId).sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
      const chapters = [...new Set(events.map((event) => event.seasonId))].map((seasonId) => ({ seasonId, events: events.filter((event) => event.seasonId === seasonId) }));
      return { athleteId, events, chapters, legacyWallProjection: events.map((event) => ({ careerEventId: event.id, title: event.title })) };
    },
    createPortfolioShareGrant(context: AuthorizationContext, input: { athleteId: string; expiresAt: string; audience: ShareAudience; mediatedBy?: "GUARDIAN" | "CLUB" }) {
      assertSelfOrGuardian(context, input.athleteId);
      const athlete = athletes.get(input.athleteId);
      if (input.audience === "SCOUTING_ALLOWED" && athlete?.minor && !input.mediatedBy) throw new Error("GUARDIAN_OR_CLUB_MEDIATION_REQUIRED");
      const entry = assertAllow(context, "portfolio:share", { resourceAthleteId: input.athleteId, consents: consentState(context, input.athleteId, "PORTFOLIO_SHARE") });
      const grant = { ...input, id: id("share-grant") };
      shareGrants.set(grant.id, grant);
      audits.push(createSafeAuditEvent(entry.context, entry.decision));
      return grant;
    },
    revokePortfolioShareGrant(context: AuthorizationContext, grantId: string) {
      const grant = shareGrants.get(grantId);
      if (!grant) throw new Error("NOT_FOUND");
      assertSelfOrGuardian(context, grant.athleteId);
      grant.revokedAt = new Date().toISOString();
      audit(context, "portfolio:share", { resourceAthleteId: grant.athleteId, consents: consentState(context, grant.athleteId, "PORTFOLIO_SHARE") });
      return grant;
    },
    getPortfolio(context: AuthorizationContext, athleteId: string, now: string) {
      assertSelfOrGuardian(context, athleteId);
      const shareGrant = [...shareGrants.values()].find((grant) => grant.athleteId === athleteId && !grant.revokedAt && grant.expiresAt > now) ?? null;
      return { athleteId, shareGrant, containsDirectContact: false, containsHealthOrPrivateCoachNotes: false };
    },
    createOpportunity(context: AuthorizationContext, input: Omit<Opportunity, "id" | "earthusContext"> & { earthusContext?: Opportunity["earthusContext"] }) {
      assertAllow(context, "team:manage", { resourceTenantId: input.organizerTenantId, resourceTeamId: input.teamId });
      const opportunity = { ...input, id: id("opportunity"), earthusContext: input.earthusContext ?? "UNAVAILABLE" };
      opportunities.set(opportunity.id, opportunity);
      audit(context, "team:manage", { resourceTenantId: opportunity.organizerTenantId, resourceTeamId: opportunity.teamId });
      return opportunity;
    },
    createOpportunityAction(context: AuthorizationContext, opportunityId: string, input: { athleteId: string; action: OpportunityAction["action"] }) {
      const opportunity = opportunities.get(opportunityId);
      const athlete = athletes.get(input.athleteId);
      if (!opportunity || !athlete) throw new Error("NOT_FOUND");
      if (opportunity.state !== "OPEN") throw new Error("OPPORTUNITY_NOT_OPEN");
      if (athlete.age < opportunity.ageMin || athlete.age > opportunity.ageMax || !athlete.positions.some((position) => opportunity.positions.includes(position)) || athlete.region !== opportunity.region) throw new Error("OPPORTUNITY_INELIGIBLE");
      const entry = assertScouting(context, athlete.athleteId, "scouting:opportunity", opportunity.teamId, athlete.tenantId);
      const action = { id: id("opportunity-action"), opportunityId, athleteId: athlete.athleteId, action: input.action, route: athlete.minor ? "GUARDIAN_OR_CLUB_MEDIATED" as const : "DIRECT_PORTFOLIO" as const };
      opportunityActions.push(action);
      audits.push(createSafeAuditEvent(entry.context, entry.decision));
      return action;
    },
    startDirectContact(context: AuthorizationContext, athleteId: string) {
      const athlete = athletes.get(athleteId);
      if (!athlete) throw new Error("NOT_FOUND");
      if (athlete.minor) return assertAllow(context, "minor:direct-contact", { resourceAthleteId: athleteId });
      return assertScouting(context, athleteId, "scouting:eligibility", athlete.teamId, athlete.tenantId);
    },
    createTeamThread(context: AuthorizationContext, input: { teamId: string; context: CommunicationContext; contextId: string; recipientAthleteIds: string[] }) {
      assertAllow(context, "team:manage", { resourceTeamId: input.teamId });
      const thread = { id: id("communication-thread"), kind: "TEAM_OPERATIONAL" as const, ...input, recipientAthleteIds: [...input.recipientAthleteIds], messages: [] };
      threads.set(thread.id, thread);
      audit(context, "team:manage", { resourceTeamId: input.teamId });
      return thread;
    },
    sendTeamMessage(context: AuthorizationContext, threadId: string, input: { body: string; idempotencyKey: string }) {
      const thread = threads.get(threadId);
      if (!thread) throw new Error("NOT_FOUND");
      assertAllow(context, "team:manage", { resourceTeamId: thread.teamId });
      const existing = thread.messages.find((message) => message.idempotencyKey === input.idempotencyKey);
      if (existing) return existing;
      const message = { id: id("communication-message"), ...input };
      thread.messages.push(message);
      audit(context, "communication:private", { resourceTeamId: thread.teamId });
      return message;
    },
    getThread(threadId: string) { const thread = threads.get(threadId); if (!thread) throw new Error("NOT_FOUND"); return thread; },
    getAuditEvents() { return [...audits]; },
    getOpportunityActions() { return [...opportunityActions]; }
  };
}
