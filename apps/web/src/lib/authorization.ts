import type { GuardianRelationship, ManagerRole } from "../api/contracts";

export interface VerifiedRoleGrant {
  role: ManagerRole;
  tenantId: string;
  teamId?: string;
  verified: boolean;
}

export interface AuthorizationActor {
  accountId: string;
  rolePreference: "PLAYER" | "MANAGER" | ManagerRole;
  grants: VerifiedRoleGrant[];
}

export interface AuthorizationInput {
  actor: AuthorizationActor;
  action: "team:manage" | "training:write" | "athlete:private-read" | "communication:send";
  tenantId: string;
  teamId?: string;
  athleteId?: string;
  guardianRelationship?: Pick<GuardianRelationship, "guardianId" | "athleteId" | "active">;
}

export interface AuthorizationDecision {
  allowed: boolean;
  code: "ALLOWED" | "ROLE_PREFERENCE_NOT_AUTHORITY" | "ROLE_GRANT_REQUIRED" | "TEAM_SCOPE_DENIED" | "TENANT_SCOPE_DENIED" | "SUBJECT_SCOPE_DENIED" | "MINOR_DIRECT_CONTACT_BLOCKED";
}

function requiresGrant(action: AuthorizationInput["action"]): boolean {
  return action === "team:manage" || action === "training:write" || action === "communication:send";
}

export function decideAuthorization(input: AuthorizationInput): AuthorizationDecision {
  if (input.action === "athlete:private-read" && input.athleteId) {
    const relationship = input.guardianRelationship;
    if (!relationship || !relationship.active || relationship.guardianId !== input.actor.accountId || relationship.athleteId !== input.athleteId) {
      return { allowed: false, code: "SUBJECT_SCOPE_DENIED" };
    }
    return { allowed: true, code: "ALLOWED" };
  }

  if (!requiresGrant(input.action)) return { allowed: false, code: "ROLE_GRANT_REQUIRED" };

  const verifiedTenantGrants = input.actor.grants.filter((grant) => grant.verified && grant.tenantId === input.tenantId);
  if (verifiedTenantGrants.length === 0) {
    return input.actor.rolePreference === "PLAYER" || input.actor.rolePreference === "MANAGER"
      ? { allowed: false, code: "ROLE_GRANT_REQUIRED" }
      : { allowed: false, code: "ROLE_PREFERENCE_NOT_AUTHORITY" };
  }

  if (input.teamId && !verifiedTenantGrants.some((grant) => grant.teamId === undefined || grant.teamId === input.teamId)) {
    return { allowed: false, code: "TEAM_SCOPE_DENIED" };
  }

  return { allowed: true, code: "ALLOWED" };
}
