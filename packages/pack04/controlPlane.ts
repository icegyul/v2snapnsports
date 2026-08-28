import { authorize, type AuthorizationContext } from "../shared-security/authorization";
import { createSafeAuditEvent } from "../../backend/src/shared/audit";
import type { ManagerGrant } from "../pack03/workspaces";

export type AdminRole = "SYSTEM_ADMIN" | "SUPPORT" | "ROLE_VERIFICATION_OPERATOR" | "COMMUNITY_MODERATOR" | "SAFEGUARDING_OFFICER" | "PRIVACY_OPERATOR" | "MIGRATION_OPERATOR";
export type AdminGrant = { id: string; role: AdminRole; status: "VERIFIED" | "REVOKED" | "EXPIRED"; tenantId: string; caseIds?: readonly string[] };
export type AdminCapability = "SYSTEM_OVERVIEW" | "SUPPORT_LOOKUP" | "ROLE_VERIFY" | "MODERATION_REVIEW" | "SAFEGUARDING_CASE_READ" | "PRIVACY_REVIEW" | "MIGRATION_SIMULATION" | "JOB_MEDIA_READ";
type AdminScope = { tenantId: string; caseId?: string };
type AdminDecision = { decision: "ALLOW" } | { decision: "DENY"; reason: string };
const rolesFor: Readonly<Record<AdminCapability, readonly AdminRole[]>> = { SYSTEM_OVERVIEW: ["SYSTEM_ADMIN"], SUPPORT_LOOKUP: ["SUPPORT"], ROLE_VERIFY: ["ROLE_VERIFICATION_OPERATOR"], MODERATION_REVIEW: ["COMMUNITY_MODERATOR"], SAFEGUARDING_CASE_READ: ["SAFEGUARDING_OFFICER"], PRIVACY_REVIEW: ["PRIVACY_OPERATOR"], MIGRATION_SIMULATION: ["MIGRATION_OPERATOR"], JOB_MEDIA_READ: ["SYSTEM_ADMIN"] };

export function createAdminControlPlane(base: AuthorizationContext, grants: readonly AdminGrant[], managerGrants: ManagerGrant[] = []) {
  const audits: Array<ReturnType<typeof createSafeAuditEvent>> = [];
  const context = (scope: AdminScope): AuthorizationContext => ({ ...base, operation: "admin:operate", resourceTenantId: scope.tenantId });
  const decide = (grantId: string | null, capability: AdminCapability, scope: AdminScope): AdminDecision => {
    const shared = authorize(context(scope)); if (shared.decision === "DENY") return shared;
    const grant = grants.find((item) => item.id === grantId); if (!grant || grant.status !== "VERIFIED") return { decision: "DENY", reason: "ADMIN_GRANT_REQUIRED" };
    if (grant.tenantId !== scope.tenantId) return { decision: "DENY", reason: "TENANT_MISMATCH" };
    if (!rolesFor[capability].includes(grant.role)) return { decision: "DENY", reason: "ADMIN_CAPABILITY_DENIED" };
    if (capability === "SAFEGUARDING_CASE_READ" && (!scope.caseId || !grant.caseIds?.includes(scope.caseId))) return { decision: "DENY", reason: "SAFEGUARDING_CASE_SCOPE_DENIED" };
    return { decision: "ALLOW" };
  };
  const audit = (grantId: string, capability: AdminCapability, scope: AdminScope) => { const decision = decide(grantId, capability, scope); if (decision.decision === "DENY") throw new Error(decision.reason); audits.push(createSafeAuditEvent(context(scope), { decision: "ALLOW" })); };
  return {
    authorize: decide,
    decideVerification(grantId: string, input: { targetUserId: string; evidenceRef?: string; decision: "APPROVE" | "REJECT" }) { audit(grantId, "ROLE_VERIFY", { tenantId: base.tenantId }); if (input.targetUserId === base.actorUserId) throw new Error("SELF_APPROVAL_DENIED"); if (!input.evidenceRef) throw new Error("VERIFICATION_EVIDENCE_REQUIRED"); return { state: input.decision === "APPROVE" ? "APPROVED" as const : "REJECTED" as const, evidenceRef: input.evidenceRef }; },
    transitionManagerGrant(grantId: string, targetGrantId: string, transition: "REVOKE" | "EXPIRE") { audit(grantId, "ROLE_VERIFY", { tenantId: base.tenantId }); const target = managerGrants.find((item) => item.id === targetGrantId); if (!target) throw new Error("NOT_FOUND"); target.status = transition === "REVOKE" ? "REVOKED" : "EXPIRED"; return target; },
    reviewModeration(grantId: string, reportId: string, state: "TRIAGED" | "ACTIONED" | "CLOSED" | "DISMISSED") { audit(grantId, "MODERATION_REVIEW", { tenantId: base.tenantId }); return { reportId, state, mode: "LOCAL_PROJECTION_ONLY" as const, communityWriteOwner: "LEGACY" as const }; },
    readSafeguardingCase(grantId: string, scope: Required<AdminScope>) { const decision = decide(grantId, "SAFEGUARDING_CASE_READ", scope); return decision.decision === "DENY" ? decision : { caseId: scope.caseId, restricted: true, projection: "REFERENCE_ONLY" as const }; },
    advancePrivacyRequest(grantId: string, requestId: string, action: "EXPORT" | "CORRECT" | "DELETE" | "RESTRICT") { audit(grantId, "PRIVACY_REVIEW", { tenantId: base.tenantId }); return { requestId, action, state: action === "DELETE" ? "PRODUCTION_ACTION_BLOCKED" as const : "LOCAL_REVIEW" as const }; },
    runMigration(grantId: string, planId: string, environment: "LOCAL" | "REHEARSAL" | "STAGING" | "PRODUCTION") { audit(grantId, "MIGRATION_SIMULATION", { tenantId: base.tenantId }); return { planId, environment, state: environment === "PRODUCTION" ? "PRODUCTION_BLOCKED" as const : "SIMULATION_ONLY" as const }; },
    retryJob(grantId: string, jobId: string) { audit(grantId, "JOB_MEDIA_READ", { tenantId: base.tenantId }); return { jobId, state: "DEFERRED_INFRA_GATE" as const, mediaMutation: false }; },
    featureGate(grantId: string, key: "EPTS" | "CAMERA_AI" | "SPORTS_AI") { audit(grantId, "SYSTEM_OVERVIEW", { tenantId: base.tenantId }); return { key, enabled: false, mutable: false, productionActivation: "BLOCKED" as const }; },
    earthusHealth() { return { status: "UNAVAILABLE" as const, blocking: false, diagnostic: "No provider result available" }; },
    systemOverview(grantId: string) { audit(grantId, "SYSTEM_OVERVIEW", { tenantId: base.tenantId }); return { tenants: "PROJECTION_ONLY", featureGates: "READ_ONLY", privateMessages: "NOT_PROJECTED", safeguardingCases: "SPECIALIST_SCOPE_REQUIRED" }; },
    getAuditEvents() { return [...audits]; }
  };
}
