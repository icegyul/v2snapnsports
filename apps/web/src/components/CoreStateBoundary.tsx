import type { PropsWithChildren } from "react";
import type { RouteState } from "./RouteStatePanel";
import { RouteStatePanel } from "./RouteStatePanel";

interface CoreStateBoundaryProps extends PropsWithChildren {
  readonly state: RouteState | "READY";
  readonly preserveContent?: boolean;
}

export function CoreStateBoundary({ state, preserveContent = false, children }: CoreStateBoundaryProps) {
  if (state === "READY") return <>{children}</>;
  const retainsCache = preserveContent && (state === "OFFLINE" || state === "STALE");
  return <section className="core-state-boundary" data-testid={`core-state-${state.toLowerCase()}`}>
    <RouteStatePanel state={state} />
    {retainsCache ? children : null}
  </section>;
}
