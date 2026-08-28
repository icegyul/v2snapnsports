// Domain policy seams consume the canonical shared operation map. They are
// interface-only in P2 and must authorize before future PACK use-cases run.
export { policyByOperationId, protectedOperationPolicyMap } from "../../../../packages/shared-security/p2OperationPolicy";
