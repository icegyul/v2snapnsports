import { isHardDisabled } from "../lib/featureFlags";
import type { ManagerRole } from "../api/contracts";

export const playerNavigation = [
  { label: "HOME", to: "/home" },
  { label: "TRAINING", to: "/training" },
  { label: "COMMUNITY", to: "/community" },
  { label: "VIDEO", to: "/video" },
  { label: "MORE", to: "/more" }
] as const;

export function resolveRouteAccess(input: { path: string; role: "PLAYER" | "MANAGER"; verifiedGrants: Array<{ role: ManagerRole }> }): { allowed: boolean; reason?: string } {
  if (input.path === "/epts" && isHardDisabled("EPTS")) return { allowed: false, reason: "FEATURE_HARD_DISABLED" };
  if (input.path.startsWith("/manager") && input.verifiedGrants.length === 0) return { allowed: false, reason: "ROLE_GRANT_REQUIRED" };
  return { allowed: true };
}
