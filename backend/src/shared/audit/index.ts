import type { AuthorizationContext, AuthorizationDecision } from "../../../../packages/shared-security/authorization";
import { createAuditEvent } from "../../../../packages/shared-security/authorization";

export type AuditClassification = "AUDIT_REQUIRED" | "SECURITY_LOG_ONLY" | "AUDIT_ON_MUTATION" | "AUDIT_ON_DENY" | "NO_SECURITY_AUDIT_REQUIRED";

export function classifyAudit(operation: AuthorizationContext["operation"], decision: AuthorizationDecision): AuditClassification {
  if (decision.decision === "DENY") return operation === "player:self-read" ? "NO_SECURITY_AUDIT_REQUIRED" : "AUDIT_ON_DENY";
  return ["team:manage", "portfolio:share", "role:self-grant"].includes(operation) ? "AUDIT_ON_MUTATION" : "SECURITY_LOG_ONLY";
}

export function createSafeAuditEvent(context: AuthorizationContext, decision: AuthorizationDecision) {
  return { classification: classifyAudit(context.operation, decision), event: createAuditEvent(context, decision) };
}
