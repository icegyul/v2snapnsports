import { ApiActivationDisabledError } from "./client";

export type ReconciledOperation =
  | "getTrainingSession"
  | "updateTrainingAttendance"
  | "getCareerEvents"
  | "getCareerHighlights"
  | "createPortfolioShareGrant"
  | "revokePortfolioShareGrant"
  | "markCommunicationThreadRead"
  | "adminDecideRoleVerification"
  | "adminTransitionRoleGrantState";

export const supportedReconciledOperations: readonly ReconciledOperation[] = [
  "getTrainingSession",
  "updateTrainingAttendance",
  "getCareerEvents",
  "getCareerHighlights",
  "createPortfolioShareGrant",
  "revokePortfolioShareGrant",
  "markCommunicationThreadRead",
  "adminDecideRoleVerification",
  "adminTransitionRoleGrantState"
];

export function resolvePhysicalPath(logicalPath: string): string {
  return logicalPath.replace(/\/v2\/athletes\/([^/]+)\/passport(?=\/|$)/, "/v2/athletes/$1/career");
}

export function createReconciledContractAdapter() {
  return {
    async invoke(_operation: ReconciledOperation, _input: Record<string, unknown>): Promise<never> {
      throw new ApiActivationDisabledError();
    }
  };
}
