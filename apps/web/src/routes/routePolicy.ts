import { isHardDisabled } from "../lib/featureFlags";
import type { ManagerRole } from "../api/contracts";

export const playerNavigation = [
  { label: "홈", to: "/home" },
  { label: "훈련", to: "/training" },
  { label: "팀", to: "/home/team" },
  { label: "커리어", to: "/player/me/career" },
  { label: "영상", to: "/video" },
] as const;

export function resolveRouteAccess(input: { path: string; role: "PLAYER" | "MANAGER"; verifiedGrants: Array<{ role: ManagerRole }> }): { allowed: boolean; reason?: string } {
  if (input.path === "/epts" && isHardDisabled("EPTS")) return { allowed: false, reason: "FEATURE_HARD_DISABLED" };
  if (input.path.startsWith("/manager") && input.verifiedGrants.length === 0) return { allowed: false, reason: "ROLE_GRANT_REQUIRED" };
  return { allowed: true };
}
