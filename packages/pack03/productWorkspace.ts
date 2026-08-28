import { createPack01Domain } from "../pack01/domain";
import { createPack02FootballLifeDomain } from "../pack02/domain";
import { createManagerWorkspaceSession } from "./workspaces";

type ManagerSession = ReturnType<typeof createManagerWorkspaceSession>;
const scope = { tenantId: "tenant-a", clubId: "club-a", teamId: "team-a", athleteId: "athlete-a" };
const fixtureCoach = { actorUserId: "fixture-coach", accountState: "ACTIVE" as const, tenantId: "tenant-a", teamIds: ["team-a"], verifiedRoleGrants: [{ role: "COACH" as const, tenantId: "tenant-a", clubId: "club-a", teamIds: ["team-a"], status: "VERIFIED" as const }], guardianRelations: [], consents: [], safeguardingBlocked: false, feature: "CORE" as const, operation: "team:manage" as const };

function requireAllow(session: ManagerSession, action: Parameters<ManagerSession["authorize"]>[0]) {
  const decision = session.authorize(action, scope);
  if (decision.decision === "DENY") throw new Error(decision.reason);
  return session.authorizationContext(action, scope);
}

export function createManagerWorkspaceProducts(session: ManagerSession) {
  const pack01 = createPack01Domain();
  const training = pack01.createTrainingSession(fixtureCoach, { teamId: "team-a", objective: "패스 선택", startAt: "2026-08-29T10:00:00Z" });
  const match = pack01.createMatch(fixtureCoach, { teamId: "team-a", opponent: "FIXTURE B", startAt: "2026-08-30T10:00:00Z" });
  pack01.assignReferee(fixtureCoach, match.id, "manager-a");
  const tactic = pack01.createTactic(fixtureCoach, { teamId: "team-a", name: "전환" });
  pack01.createTacticVersion(fixtureCoach, tactic.id, { mode: "PLAN_TACTIC", paths: ["pass", "move"] });

  const pack02 = createPack02FootballLifeDomain();
  pack02.registerAthlete({ athleteId: "athlete-a", tenantId: "tenant-a", teamId: "team-a", age: 16, positions: ["MF"], region: "SEOUL", minor: true });
  const opportunity = pack02.createOpportunity(fixtureCoach, { organizerTenantId: "tenant-a", teamId: "team-a", type: "TRYOUT", ageMin: 15, ageMax: 17, positions: ["MF"], region: "SEOUL", state: "OPEN", earthusContext: "UNAVAILABLE" });

  return {
    coachOverview() { requireAllow(session, "COACH_START_SESSION"); return { training, pausePersistence: "TIMER_CONTROL_ONLY" as const, noSensorData: true }; },
    startCoachSession() { const context = requireAllow(session, "COACH_START_SESSION"); for (const next of ["READY", "CHECK_IN", "LIVE"] as const) pack01.transitionTraining(context, training.id, next, training.version); return training; },
    createCoachPlanRevision() { const context = requireAllow(session, "COACH_UPDATE_PLAN"); return pack01.updateTrainingPlan(context, training.id, { objective: "전환과 압박", drills: ["rondo", "transition"] }, training.version); },
    finalizeCoachAttendance() { const context = requireAllow(session, "COACH_UPDATE_PLAN"); return pack01.setAttendance(context, training.id, "athlete-a", "PRESENT"); },
    teamSchedule() { const context = requireAllow(session, "TEAM_MANAGER_COORDINATE"); return pack01.getUpcomingSchedule(context); },
    clubOverview() { requireAllow(session, "CLUB_DIRECTOR_OVERVIEW"); return { clubId: "club-a", teamCount: 1, scheduleCount: 2, privateAthleteData: "NOT_PROJECTED" as const }; },
    refereeMatch() { requireAllow(session, "REFEREE_MATCH_CENTER"); return pack01.getMatch(match.id); },
    submitRefereeReport() { const context = requireAllow(session, "REFEREE_MATCH_CENTER"); return pack01.createMatchReport(context, match.id, "fixture official report"); },
    requestAgentOpportunity() { const context = requireAllow(session, "AGENT_OPPORTUNITY"); return pack02.createOpportunityAction(context, opportunity.id, { athleteId: "athlete-a", action: "INVITED" }); },
    analystPlayback() { const context = requireAllow(session, "ANALYST_TACTICS_READ"); return pack01.getTacticalPlayback(context, tactic.id); }
  };
}
