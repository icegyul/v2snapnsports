export type P1BindingStatus = "INTERFACE_ONLY" | "NOT_IMPLEMENTED";

export interface P1OperationBinding {
  readonly operationId: string;
  readonly layer: "interface" | "application" | "domain" | "infrastructure";
  readonly status: P1BindingStatus;
  readonly requiresAudit: boolean;
  readonly requiresIdempotency: boolean;
}

export const p1ReconciledOperationBindings: readonly P1OperationBinding[] = [
  { operationId: "getTrainingSession", layer: "interface", status: "INTERFACE_ONLY", requiresAudit: false, requiresIdempotency: false },
  { operationId: "updateTrainingAttendance", layer: "application", status: "INTERFACE_ONLY", requiresAudit: true, requiresIdempotency: true },
  { operationId: "createPortfolioShareGrant", layer: "application", status: "INTERFACE_ONLY", requiresAudit: true, requiresIdempotency: true },
  { operationId: "revokePortfolioShareGrant", layer: "application", status: "INTERFACE_ONLY", requiresAudit: true, requiresIdempotency: true },
  { operationId: "markCommunicationThreadRead", layer: "application", status: "INTERFACE_ONLY", requiresAudit: true, requiresIdempotency: true },
  { operationId: "adminDecideRoleVerification", layer: "application", status: "INTERFACE_ONLY", requiresAudit: true, requiresIdempotency: true },
  { operationId: "adminTransitionRoleGrantState", layer: "application", status: "INTERFACE_ONLY", requiresAudit: true, requiresIdempotency: true }
];
