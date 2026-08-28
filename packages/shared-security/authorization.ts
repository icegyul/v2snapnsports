export type AccountType = "PLAYER" | "GUARDIAN" | "MANAGER" | "ADMIN";
export type Role = "COACH" | "TEAM_MANAGER" | "CLUB_DIRECTOR" | "REFEREE" | "AGENT" | "ANALYST";
export type Feature = "CORE" | "EPTS" | "CAMERA_AI" | "SPORTS_AI";
export type Operation = "player:self-read" | "team:read" | "team:manage" | "athlete:private-read" | "career:write" | "consent:manage" | "portfolio:share" | "scouting:eligibility" | "scouting:opportunity" | "minor:direct-contact" | "communication:private" | "role:switch" | "admin:operate" | "role:self-grant";
export type DenyReason = "UNAUTHENTICATED" | "ACCOUNT_SUSPENDED" | "ROLE_NOT_VERIFIED" | "TENANT_MISMATCH" | "TEAM_SCOPE_MISMATCH" | "RESOURCE_SCOPE_MISMATCH" | "GUARDIAN_RELATION_REQUIRED" | "CONSENT_REQUIRED" | "CONSENT_REVOKED" | "SAFEGUARDING_BLOCK" | "FEATURE_DISABLED" | "CLUB_SCOPE_MISMATCH";

export interface VerifiedRoleGrant { role: Role; tenantId: string; teamIds?: readonly string[]; status: "VERIFIED" | "REVOKED" | "EXPIRED"; clubId?: string; }
export interface GuardianRelation { athleteId: string; status: "ACTIVE" | "REVOKED" | "PENDING"; }
export interface Consent { purpose: "PORTFOLIO_SHARE" | "SCOUTING" | "MEDIA_SHARE" | "COMMUNICATION"; athleteId: string; status: "ACTIVE" | "REVOKED"; }
export interface AuthorizationContext {
  actorUserId: string | null;
  accountType?: AccountType;
  accountState: "ACTIVE" | "SUSPENDED";
  rolePreference?: Role;
  tenantId: string;
  teamIds: readonly string[];
  athleteId?: string;
  verifiedRoleGrants: readonly VerifiedRoleGrant[];
  guardianRelations: readonly GuardianRelation[];
  consents: readonly Consent[];
  safeguardingBlocked: boolean;
  feature: Feature;
  operation: Operation;
  resourceTenantId?: string;
  resourceTeamId?: string;
  resourceClubId?: string;
  resourceAthleteId?: string;
  requestId?: string;
  rawToken?: string;
  privateBody?: string;
}
export type AuthorizationDecision = { decision: "ALLOW" } | { decision: "DENY"; reason: DenyReason };

const hardDisabled = new Set<Feature>(["EPTS", "CAMERA_AI", "SPORTS_AI"]);
const privileged: Readonly<Record<Operation, Role[]>> = {
  "player:self-read": [], "team:read": [], "team:manage": ["COACH", "TEAM_MANAGER", "CLUB_DIRECTOR"],
  "athlete:private-read": [], "career:write": [], "consent:manage": [], "portfolio:share": [], "scouting:eligibility": [], "scouting:opportunity": ["AGENT", "CLUB_DIRECTOR"], "minor:direct-contact": ["AGENT", "REFEREE", "COACH", "TEAM_MANAGER", "CLUB_DIRECTOR", "ANALYST"],
  "communication:private": [], "role:switch": [], "admin:operate": [], "role:self-grant": ["COACH", "TEAM_MANAGER", "CLUB_DIRECTOR", "REFEREE", "AGENT", "ANALYST"]
};
const consentByOperation: Partial<Record<Operation, Consent["purpose"]>> = { "portfolio:share": "PORTFOLIO_SHARE", "scouting:eligibility": "SCOUTING", "scouting:opportunity": "SCOUTING" };
export const protectedOperationPolicies = Object.freeze({
  getTrainingSession: ["TENANT", "TEAM", "SAFEGUARDING"], updateTrainingAttendance: ["TENANT", "TEAM", "AUDIT", "IDEMPOTENCY"],
  createPortfolioShareGrant: ["SELF", "CONSENT", "SAFEGUARDING", "AUDIT", "IDEMPOTENCY"], revokePortfolioShareGrant: ["SELF", "AUDIT", "IDEMPOTENCY"],
  markCommunicationThreadRead: ["TENANT", "TEAM", "SAFEGUARDING", "AUDIT", "IDEMPOTENCY"],
  adminDecideRoleVerification: ["ADMIN_SCOPE", "AUDIT", "IDEMPOTENCY"], adminTransitionRoleGrantState: ["ADMIN_SCOPE", "AUDIT", "IDEMPOTENCY"]
} as const);

export function authorize(context: AuthorizationContext): AuthorizationDecision {
  if (!context.actorUserId) return { decision: "DENY", reason: "UNAUTHENTICATED" };
  if (context.accountState !== "ACTIVE") return { decision: "DENY", reason: "ACCOUNT_SUSPENDED" };
  if (hardDisabled.has(context.feature)) return { decision: "DENY", reason: "FEATURE_DISABLED" };
  if (context.operation === "role:self-grant" || context.safeguardingBlocked || context.operation === "minor:direct-contact") return { decision: "DENY", reason: "SAFEGUARDING_BLOCK" };
  if (context.resourceTenantId && context.resourceTenantId !== context.tenantId) return { decision: "DENY", reason: "TENANT_MISMATCH" };
  if (context.resourceTeamId && !context.teamIds.includes(context.resourceTeamId)) return { decision: "DENY", reason: "TEAM_SCOPE_MISMATCH" };
  if (context.resourceClubId && !context.verifiedRoleGrants.some((grant) => grant.status === "VERIFIED" && grant.tenantId === context.tenantId && grant.clubId === context.resourceClubId)) return { decision: "DENY", reason: "CLUB_SCOPE_MISMATCH" };
  if (context.accountType === "GUARDIAN" && context.resourceAthleteId && !context.guardianRelations.some((relation) => relation.athleteId === context.resourceAthleteId && relation.status === "ACTIVE")) return { decision: "DENY", reason: "GUARDIAN_RELATION_REQUIRED" };
  if (context.operation === "athlete:private-read" && context.accountType !== "GUARDIAN" && context.resourceAthleteId && context.resourceAthleteId !== context.athleteId) return { decision: "DENY", reason: "RESOURCE_SCOPE_MISMATCH" };
  const requiredConsent = consentByOperation[context.operation];
  if (requiredConsent) {
    const consent = context.consents.find((item) => item.purpose === requiredConsent && item.athleteId === context.resourceAthleteId);
    if (consent?.status === "REVOKED") return { decision: "DENY", reason: "CONSENT_REVOKED" };
    if (!consent) return { decision: "DENY", reason: "CONSENT_REQUIRED" };
  }
  const required = privileged[context.operation];
  if (required.length && !context.verifiedRoleGrants.some((grant) => grant.status === "VERIFIED" && grant.tenantId === context.tenantId && required.includes(grant.role) && (!context.resourceTeamId || !grant.teamIds || grant.teamIds.includes(context.resourceTeamId)))) return { decision: "DENY", reason: "ROLE_NOT_VERIFIED" };
  return { decision: "ALLOW" };
}

export function createAuditEvent(context: AuthorizationContext, decision: AuthorizationDecision) {
  return { eventId: `${context.requestId ?? "local"}:${context.operation}`, occurredAt: new Date().toISOString(), actorUserId: context.actorUserId, tenantId: context.tenantId, operation: context.operation, decision: decision.decision, reasonCode: decision.decision === "DENY" ? decision.reason : "ALLOW", requestId: context.requestId ?? null, resource: { tenantId: context.resourceTenantId ?? null, teamId: context.resourceTeamId ?? null, athleteId: context.resourceAthleteId ?? null } };
}
