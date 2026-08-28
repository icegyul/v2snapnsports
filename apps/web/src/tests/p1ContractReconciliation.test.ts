import { describe, expect, it } from "vitest";
import { createReconciledContractAdapter, resolvePhysicalPath, supportedReconciledOperations } from "../api/p1ContractReconciliation";

describe("P1 OpenAPI and schema reconciliation", () => {
  it("maps Career logical paths to the one physical aggregate root", () => {
    expect(resolvePhysicalPath("/v2/athletes/player-1/passport")).toBe("/v2/athletes/player-1/career");
    expect(resolvePhysicalPath("/v2/athletes/player-1/career")).toBe("/v2/athletes/player-1/career");
  });

  it("keeps only approved reconciled operations in the frontend binding registry", () => {
    expect(supportedReconciledOperations).toContain("getTrainingSession");
    expect(supportedReconciledOperations).toContain("createPortfolioShareGrant");
    expect(supportedReconciledOperations).not.toContain("createMatch");
  });

  it("keeps production behavior disabled while exposing interface-only operations", async () => {
    const adapter = createReconciledContractAdapter();
    await expect(adapter.invoke("markCommunicationThreadRead", { threadId: "fixture-thread" })).rejects.toMatchObject({ name: "ApiActivationDisabledError" });
  });
});
