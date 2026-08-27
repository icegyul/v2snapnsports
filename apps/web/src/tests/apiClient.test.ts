import { describe, expect, it } from "vitest";
import { ApiActivationDisabledError, createDisabledApiClient, normalizeApiError } from "../api/client";

describe("API foundation", () => {
  it("keeps the production transport inactive", async () => {
    await expect(createDisabledApiClient().request({ operationId: "getMe" })).rejects.toBeInstanceOf(ApiActivationDisabledError);
  });

  it("normalizes a scope denial without leaking resource detail", () => {
    expect(normalizeApiError({ code: "TEAM_SCOPE_DENIED", requestId: "req-fixture" })).toEqual({
      code: "TEAM_SCOPE_DENIED",
      requestId: "req-fixture",
      retryable: false
    });
  });
});
