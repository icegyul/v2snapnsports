export type CoreUiResourceState = "IDLE" | "LOADING" | "READY" | "EMPTY" | "ERROR" | "OFFLINE" | "FORBIDDEN" | "STALE";
export type CoreVisualMode = "FULL" | "FAST" | "LIGHT" | "STATIC";

export interface CoreResourceSignals {
  readonly phase: "IDLE" | "LOADING" | "SETTLED";
  readonly online: boolean;
  readonly httpStatus: number | null;
  readonly requestFailed: boolean;
  readonly itemCount: number | null;
  readonly hasCache: boolean;
  readonly cacheAsOf: string | null;
  readonly cacheIsStale: boolean;
  readonly responseIsStale: boolean;
}

export type CoreResourceResolution =
  | { readonly type: "REDIRECT_LOGIN"; readonly destination: "/login" }
  | { readonly type: "STATE"; readonly kind: CoreUiResourceState; readonly preserveContent: boolean; readonly asOf: string | null };

export function resolveCoreResourceState(signals: CoreResourceSignals): CoreResourceResolution {
  if (signals.httpStatus === 401) return { type: "REDIRECT_LOGIN", destination: "/login" };
  if (signals.httpStatus === 403) return { type: "STATE", kind: "FORBIDDEN", preserveContent: false, asOf: null };
  if (signals.phase === "IDLE") return { type: "STATE", kind: "IDLE", preserveContent: false, asOf: null };
  if (signals.phase === "LOADING" && !signals.hasCache) return { type: "STATE", kind: "LOADING", preserveContent: false, asOf: null };
  if (!signals.online) return { type: "STATE", kind: "OFFLINE", preserveContent: signals.hasCache, asOf: signals.hasCache ? signals.cacheAsOf : null };
  if (signals.requestFailed) return { type: "STATE", kind: signals.hasCache ? "STALE" : "ERROR", preserveContent: signals.hasCache, asOf: signals.hasCache ? signals.cacheAsOf : null };
  if (signals.itemCount === 0) return { type: "STATE", kind: "EMPTY", preserveContent: false, asOf: null };
  if (signals.responseIsStale || signals.cacheIsStale) return { type: "STATE", kind: "STALE", preserveContent: true, asOf: signals.cacheAsOf };
  return { type: "STATE", kind: "READY", preserveContent: true, asOf: null };
}

export interface CoreVisualModeState {
  readonly mode: CoreVisualMode;
  readonly status: "INITIALIZING" | "ACTIVE" | "DEGRADING" | "FAILED";
  readonly failureCount: number;
  readonly lastReason: string | null;
}

export type CoreVisualModeEvent =
  | { readonly type: "MODE_READY"; readonly mode: CoreVisualMode }
  | { readonly type: "MODE_FAILED" | "PERFORMANCE_DEGRADED" | "FORCE_STATIC"; readonly reason: string }
  | { readonly type: "RETRY" };

const visualModeOrder: readonly CoreVisualMode[] = ["FULL", "FAST", "LIGHT", "STATIC"];

export function createVisualModeState(initialMode: CoreVisualMode): CoreVisualModeState {
  return { mode: initialMode, status: "INITIALIZING", failureCount: 0, lastReason: null };
}

export function reduceVisualMode(state: CoreVisualModeState, event: CoreVisualModeEvent): CoreVisualModeState {
  if (event.type === "MODE_READY") return { ...state, mode: event.mode, status: "ACTIVE", lastReason: null };
  if (event.type === "RETRY") return { ...state, status: "INITIALIZING", lastReason: null };
  const nextMode = event.type === "FORCE_STATIC"
    ? "STATIC"
    : visualModeOrder[Math.min(visualModeOrder.indexOf(state.mode) + 1, visualModeOrder.length - 1)] ?? "STATIC";
  return { mode: nextMode, status: nextMode === "STATIC" ? "FAILED" : "DEGRADING", failureCount: state.failureCount + 1, lastReason: event.reason };
}
