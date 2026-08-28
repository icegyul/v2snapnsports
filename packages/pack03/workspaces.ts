import { authorize, type AuthorizationContext, type AuthorizationDecision, type Consent, type GuardianRelation, type Role, type VerifiedRoleGrant } from "../shared-security/authorization";
import { createSafeAuditEvent } from "../../backend/src/shared/audit";

export type ManagerGrant = VerifiedRoleGrant & { id: string; clubId: string; teamIds: readonly string[] };
export type WorkspaceRole = Role;
export type WorkspaceAction = "COACH_START_SESSION" | "COACH_UPDATE_PLAN" | "TEAM_MANAGER_COORDINATE" | "CLUB_DIRECTOR_OVERVIEW" | "REFEREE_MATCH_CENTER" | "AGENT_OPPORTUNITY" | "ANALYST_TACTICS_READ";
export type WorkspaceScope = { tenantId: string; clubId: string; teamId: string; athleteId?: string };
export type WorkspaceDecision = AuthorizationDecision | { decision: "DENY"; reason: "CLUB_SCOPE_MISMATCH" };
export type ActiveRoleStore = { read(actorUserId: string): string | null; write(actorUserId: string, grantId: string): void };

const allowedRoles: Readonly<Record<WorkspaceAction, readonly Role[]>> = {
  COACH_START_SESSION: ["COACH"], COACH_UPDATE_PLAN: ["COACH"], TEAM_MANAGER_COORDINATE: ["TEAM_MANAGER"],
  CLUB_DIRECTOR_OVERVIEW: ["CLUB_DIRECTOR"], REFEREE_MATCH_CENTER: ["REFEREE"], AGENT_OPPORTUNITY: ["AGENT"], ANALYST_TACTICS_READ: ["ANALYST"]
};
const navigation: Readonly<Record<WorkspaceRole, readonly string[]>> = {
  COACH: ["Ground", "Plan", "Session", "Review", "More"], TEAM_MANAGER: ["일정", "조율", "로스터", "커뮤니케이션", "More"],
  CLUB_DIRECTOR: ["클럽", "팀", "일정", "역할", "More"], REFEREE: ["배정 경기", "매치 센터", "리포트", "More"],
  AGENT: ["포트폴리오", "기회", "중재 경로", "More"], ANALYST: ["전술 보기", "경기 분석", "더보기"]
};
function operationFor(action: WorkspaceAction): AuthorizationContext["operation"] { return action === "AGENT_OPPORTUNITY" ? "scouting:opportunity" : action === "COACH_START_SESSION" || action === "COACH_UPDATE_PLAN" || action === "TEAM_MANAGER_COORDINATE" || action === "CLUB_DIRECTOR_OVERVIEW" ? "team:manage" : "team:read"; }

export function createMemoryActiveRoleStore(): ActiveRoleStore {
  const values = new Map<string, string>();
  return { read: (actorUserId) => values.get(actorUserId) ?? null, write: (actorUserId, grantId) => values.set(actorUserId, grantId) };
}
export function createBrowserActiveRoleStore(storage: Pick<Storage, "getItem" | "setItem"> = localStorage): ActiveRoleStore {
  return { read: (actorUserId) => storage.getItem(`snapn-v2:active-role:${actorUserId}`), write: (actorUserId, grantId) => storage.setItem(`snapn-v2:active-role:${actorUserId}`, grantId) };
}

export function createManagerWorkspaceSession(input: { actorUserId: string; tenantId: string; teamIds: readonly string[]; accountState: "ACTIVE" | "SUSPENDED"; rolePreference?: Role; grants: readonly ManagerGrant[]; consents: readonly Consent[]; guardianRelations: readonly GuardianRelation[]; safeguardingBlocked: boolean; feature: AuthorizationContext["feature"] }, store: ActiveRoleStore) {
  const audits: Array<ReturnType<typeof createSafeAuditEvent>> = [];
  let activeGrantId = store.read(input.actorUserId);
  const grantById = (grantId: string | null) => input.grants.find((grant) => grant.id === grantId) ?? null;
  const activeGrant = () => grantById(activeGrantId);
  const assertGrant = () => { const grant = activeGrant(); if (!grant || grant.status !== "VERIFIED" || grant.tenantId !== input.tenantId) throw new Error("ROLE_NOT_VERIFIED"); return grant; };
  const contextFor = (grant: ManagerGrant, operation: AuthorizationContext["operation"], scope: WorkspaceScope): AuthorizationContext => ({ actorUserId: input.actorUserId, accountType: "MANAGER", accountState: input.accountState, rolePreference: input.rolePreference, tenantId: input.tenantId, teamIds: grant.teamIds, verifiedRoleGrants: [grant], guardianRelations: input.guardianRelations, consents: input.consents, safeguardingBlocked: input.safeguardingBlocked, feature: input.feature, operation, resourceTenantId: scope.tenantId, resourceClubId: scope.clubId, resourceTeamId: scope.teamId, resourceAthleteId: scope.athleteId, requestId: `workspace:${grant.id}` });
  return {
    switchActiveRole(grantId: string) { const grant = grantById(grantId); if (!grant || grant.status !== "VERIFIED" || grant.tenantId !== input.tenantId) throw new Error("ROLE_NOT_VERIFIED"); activeGrantId = grant.id; store.write(input.actorUserId, grant.id); const context = contextFor(grant, "role:switch", { tenantId: input.tenantId, clubId: grant.clubId, teamId: grant.teamIds[0] ?? "" }); const decision = authorize(context); if (decision.decision === "DENY") throw new Error(decision.reason); audits.push(createSafeAuditEvent(context, decision)); return grant; },
    currentWorkspace() { const grant = assertGrant(); return { role: grant.role, grantId: grant.id, navigation: navigation[grant.role] }; },
    authorize(action: WorkspaceAction, scope: WorkspaceScope): WorkspaceDecision { const grant = assertGrant(); if (!allowedRoles[action].includes(grant.role)) return { decision: "DENY", reason: "ROLE_NOT_VERIFIED" }; return authorize(contextFor(grant, operationFor(action), scope)); },
    authorizationContext(action: WorkspaceAction, scope: WorkspaceScope) { const grant = assertGrant(); return contextFor(grant, operationFor(action), scope); },
    getAuditEvents() { return [...audits]; }
  };
}
