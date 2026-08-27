import { useState } from "react";
import type { RouteState } from "../components/RouteStatePanel";

export function useFoundationState(initial: RouteState = "LOADING") {
  return useState<RouteState>(initial);
}
