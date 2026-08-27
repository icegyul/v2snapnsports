import type {
  CoreScreenId,
  ISODateTime,
  ScreenStateModel,
  UiResourceStateKind,
  VisualMode,
} from "./contracts";
import {
  getScreenStateCopy,
  type CatalogStateKind,
} from "./screen-state-catalog";

export interface ResourceSignals {
  readonly phase: "IDLE" | "LOADING" | "SETTLED";
  readonly online: boolean;
  readonly httpStatus: number | null;
  readonly requestFailed: boolean;
  readonly itemCount: number | null;
  readonly hasCache: boolean;
  readonly cacheAsOf: ISODateTime | null;
  readonly cacheIsStale: boolean;
  readonly responseIsStale: boolean;
}

export type ResourceResolution =
  | { readonly type: "REDIRECT_LOGIN"; readonly destination: "/login" }
  | {
      readonly type: "STATE";
      readonly kind: UiResourceStateKind;
      readonly preserveContent: boolean;
      readonly asOf: ISODateTime | null;
    };

export function resolveResourceState(signals: ResourceSignals): ResourceResolution {
  if (signals.httpStatus === 401) {
    return { type: "REDIRECT_LOGIN", destination: "/login" };
  }

  if (signals.httpStatus === 403) {
    return {
      type: "STATE",
      kind: "FORBIDDEN",
      preserveContent: false,
      asOf: null,
    };
  }

  if (signals.phase === "IDLE") {
    return { type: "STATE", kind: "IDLE", preserveContent: false, asOf: null };
  }

  if (signals.phase === "LOADING" && !signals.hasCache) {
    return { type: "STATE", kind: "LOADING", preserveContent: false, asOf: null };
  }

  if (!signals.online && signals.hasCache) {
    return {
      type: "STATE",
      kind: "OFFLINE",
      preserveContent: true,
      asOf: signals.cacheAsOf,
    };
  }

  if (!signals.online) {
    return { type: "STATE", kind: "OFFLINE", preserveContent: false, asOf: null };
  }

  if (signals.requestFailed && signals.hasCache) {
    return {
      type: "STATE",
      kind: "STALE",
      preserveContent: true,
      asOf: signals.cacheAsOf,
    };
  }

  if (signals.requestFailed) {
    return { type: "STATE", kind: "ERROR", preserveContent: false, asOf: null };
  }

  if (signals.itemCount === 0) {
    return { type: "STATE", kind: "EMPTY", preserveContent: false, asOf: null };
  }

  if (signals.responseIsStale || signals.cacheIsStale) {
    return {
      type: "STATE",
      kind: "STALE",
      preserveContent: true,
      asOf: signals.cacheAsOf,
    };
  }

  return { type: "STATE", kind: "READY", preserveContent: true, asOf: null };
}

export function buildScreenStateModel(
  screen: CoreScreenId,
  resolution: Exclude<ResourceResolution, { readonly type: "REDIRECT_LOGIN" }>,
): ScreenStateModel {
  const announceMode =
    resolution.kind === "ERROR" || resolution.kind === "FORBIDDEN"
      ? "ASSERTIVE"
      : resolution.kind === "LOADING"
        ? "POLITE"
        : "OFF";

  if (
    resolution.kind === "IDLE" ||
    resolution.kind === "READY"
  ) {
    return {
      screen,
      kind: resolution.kind,
      copy: {
        title: "",
        description: "",
        primaryAction: null,
        secondaryAction: null,
      },
      asOf: resolution.asOf,
      preserveContent: resolution.preserveContent,
      announceMode,
    };
  }

  return {
    screen,
    kind: resolution.kind,
    copy: getScreenStateCopy(screen, resolution.kind as CatalogStateKind),
    asOf: resolution.asOf,
    preserveContent: resolution.preserveContent,
    announceMode,
  };
}

const VISUAL_MODE_ORDER: readonly VisualMode[] = ["FULL", "FAST", "LIGHT", "STATIC"];

export interface VisualModeState {
  readonly mode: VisualMode;
  readonly status: "INITIALIZING" | "ACTIVE" | "DEGRADING" | "FAILED";
  readonly failureCount: number;
  readonly lastReason: string | null;
}

export type VisualModeEvent =
  | { readonly type: "MODE_READY"; readonly mode: VisualMode }
  | { readonly type: "MODE_FAILED"; readonly reason: string }
  | { readonly type: "PERFORMANCE_DEGRADED"; readonly reason: string }
  | { readonly type: "FORCE_STATIC"; readonly reason: string }
  | { readonly type: "RETRY" };

export function createVisualModeState(initialMode: VisualMode): VisualModeState {
  return {
    mode: initialMode,
    status: "INITIALIZING",
    failureCount: 0,
    lastReason: null,
  };
}

function nextLowerMode(mode: VisualMode): VisualMode {
  const index = VISUAL_MODE_ORDER.indexOf(mode);
  return VISUAL_MODE_ORDER[Math.min(index + 1, VISUAL_MODE_ORDER.length - 1)] ?? "STATIC";
}

export function reduceVisualMode(
  state: VisualModeState,
  event: VisualModeEvent,
): VisualModeState {
  if (event.type === "MODE_READY") {
    return {
      mode: event.mode,
      status: "ACTIVE",
      failureCount: state.failureCount,
      lastReason: null,
    };
  }

  if (event.type === "FORCE_STATIC") {
    return {
      mode: "STATIC",
      status: "DEGRADING",
      failureCount: state.failureCount + 1,
      lastReason: event.reason,
    };
  }

  if (event.type === "RETRY") {
    return {
      mode: state.mode,
      status: "INITIALIZING",
      failureCount: state.failureCount,
      lastReason: null,
    };
  }

  const nextMode = nextLowerMode(state.mode);
  const atStatic = state.mode === "STATIC";

  return {
    mode: nextMode,
    status: atStatic ? "FAILED" : "DEGRADING",
    failureCount: state.failureCount + 1,
    lastReason: event.reason,
  };
}

