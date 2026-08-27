import type { ManagerRole } from "../api/contracts";

export type PublicRolePreference = "PLAYER" | "MANAGER";

export const corePlayerRoutes = [
  { path: "/home", label: "나의 경기장" },
  { path: "/home/enter", label: "피치 진입" },
  { path: "/home/position", label: "나의 포지션" },
  { path: "/home/team", label: "나의 팀 공간" },
  { path: "/player/career", label: "커리어 패스포트" }
] as const;

const managerRoutePrefixes: Record<ManagerRole, string> = {
  COACH: "/manager/coach",
  TEAM_MANAGER: "/manager/team",
  CLUB_DIRECTOR: "/manager/club",
  REFEREE: "/manager/referee",
  AGENT: "/manager/agent",
  ANALYST: "/manager/analyst"
};

export function isPublicRolePreference(role: string): role is PublicRolePreference {
  return role === "PLAYER" || role === "MANAGER";
}

export function managerRouteRequiresVerifiedGrant(path: string): boolean {
  return Object.values(managerRoutePrefixes).some((prefix) => path.startsWith(prefix));
}
