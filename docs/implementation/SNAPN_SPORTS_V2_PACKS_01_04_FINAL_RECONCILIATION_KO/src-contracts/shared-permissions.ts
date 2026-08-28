export type FeatureKey = "EPTS" | "CAMERA_AI" | "SPORTS_AI" | "CORE";
export interface PermissionInput {
  authenticated: boolean;
  rolePreferenceOnly?: boolean;
  activeRoleGrant: boolean;
  tenantMatch: boolean;
  teamOrResourceScope: boolean;
  consentSatisfied: boolean;
  safeguardingAllowed: boolean;
  feature: FeatureKey;
  releaseApproved?: boolean;
}
export type PermissionDecision = { allow: true; reason: "ALLOW" } | { allow: false; reason: string };

export function evaluatePermission(input: PermissionInput): PermissionDecision {
  if (!input.authenticated) return { allow: false, reason: "AUTH_REQUIRED" };
  if (input.rolePreferenceOnly || !input.activeRoleGrant) return { allow: false, reason: "ROLE_GRANT_REQUIRED" };
  if (!input.tenantMatch) return { allow: false, reason: "TENANT_SCOPE_DENIED" };
  if (!input.teamOrResourceScope) return { allow: false, reason: "RESOURCE_SCOPE_DENIED" };
  if (!input.consentSatisfied) return { allow: false, reason: "CONSENT_REQUIRED" };
  if (!input.safeguardingAllowed) return { allow: false, reason: "SAFEGUARDING_DENIED" };
  if (input.feature !== "CORE" && !input.releaseApproved) return { allow: false, reason: "FEATURE_HARD_DISABLED" };
  return { allow: true, reason: "ALLOW" };
}

export const HARD_DISABLED_FEATURES = ["EPTS","CAMERA_AI","SPORTS_AI"] as const;
