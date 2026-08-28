import { describe, expect, it } from "vitest";
import { policyByOperationId, protectedOperationPolicyMap } from "../../../../packages/shared-security/p2OperationPolicy";

describe("P2 protected operation coverage", () => {
  it("P2-OP-001 classifies all 73 reconciled operations exactly once", () => {
    expect(protectedOperationPolicyMap).toHaveLength(73);
    expect(new Set(protectedOperationPolicyMap.map((entry) => entry.operationId)).size).toBe(73);
  });
  it("P2-OP-002 through P2-OP-004 bind every protected operation to gates, backend seam, and audit class", () => {
    const protectedEntries = protectedOperationPolicyMap.filter((entry) => entry.accessClass === "PROTECTED");
    expect(protectedEntries.every((entry) => entry.gates.length > 0 && entry.backendBinding === "INTERFACE_ONLY" && entry.auditClassification.length > 0)).toBe(true);
    expect(Object.keys(policyByOperationId)).toHaveLength(73);
  });
  it("P2-OP-005 keeps public operations free of privileged-role gates", () => {
    expect(protectedOperationPolicyMap.filter((entry) => entry.accessClass === "PUBLIC").every((entry) => !entry.gates.includes("VERIFIED_ROLE_GRANT") && entry.backendBinding === "NOT_REQUIRED")).toBe(true);
  });
  it("P2-OP-010 and P2-OP-011 protect sensitive scouting, communication, and admin operations", () => {
    expect(policyByOperationId.createOpportunityAction.gates).toContain("SAFEGUARDING");
    expect(policyByOperationId.sendCommunicationMessage.gates).toContain("SAFEGUARDING");
    expect(policyByOperationId.adminDecideRoleVerification.gates).toContain("ADMIN_SCOPE");
    expect(policyByOperationId.adminDecideRoleVerification.auditClassification).toBe("AUDIT_REQUIRED");
  });
});
