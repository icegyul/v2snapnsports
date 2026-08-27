import { describe, expect, it } from "vitest";
import { createVisualModeState, reduceVisualMode, resolveCoreResourceState } from "../features/core/coreUiState";

describe("Core UI resource state", () => {
  it("redirects unauthenticated requests to login before rendering cached data", () => {
    expect(resolveCoreResourceState({ phase: "SETTLED", online: true, httpStatus: 401, requestFailed: false, itemCount: 1, hasCache: true, cacheAsOf: "2026-08-28T00:00:00Z", cacheIsStale: false, responseIsStale: false })).toEqual({ type: "REDIRECT_LOGIN", destination: "/login" });
  });

  it("keeps cached content visible as stale after a failed request", () => {
    expect(resolveCoreResourceState({ phase: "SETTLED", online: true, httpStatus: null, requestFailed: true, itemCount: null, hasCache: true, cacheAsOf: "2026-08-28T00:00:00Z", cacheIsStale: false, responseIsStale: false })).toMatchObject({ type: "STATE", kind: "STALE", preserveContent: true });
  });
});

describe("Core UI visual fallback", () => {
  it("degrades FULL through FAST and LIGHT while retaining a usable STATIC mode", () => {
    let state = createVisualModeState("FULL");
    state = reduceVisualMode(state, { type: "MODE_FAILED", reason: "webgl-init" });
    expect(state.mode).toBe("FAST");
    state = reduceVisualMode(state, { type: "PERFORMANCE_DEGRADED", reason: "fps" });
    expect(state.mode).toBe("LIGHT");
    state = reduceVisualMode(state, { type: "MODE_FAILED", reason: "renderer" });
    expect(state.mode).toBe("STATIC");
  });
});
