import { evaluatePermission, HARD_DISABLED_FEATURES } from "../src-contracts/shared-permissions.js";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const base = {
  authenticated: true,
  activeRoleGrant: true,
  tenantMatch: true,
  teamOrResourceScope: true,
  consentSatisfied: true,
  safeguardingAllowed: true,
  feature: "CORE" as const
};

assert(!evaluatePermission({ ...base, tenantMatch: false }).allow, "cross-tenant must deny");
assert(!evaluatePermission({ ...base, rolePreferenceOnly: true }).allow, "RolePreference must not authorize");
assert(!evaluatePermission({ ...base, safeguardingAllowed: false }).allow, "safeguarding must hard deny");
for (const feature of HARD_DISABLED_FEATURES) {
  assert(!evaluatePermission({ ...base, feature, releaseApproved: false }).allow, `${feature} must remain hard disabled`);
}
