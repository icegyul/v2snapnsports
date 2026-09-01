import type { ManagerRole } from "../api/contracts";
import { isHardDisabled } from "../lib/featureFlags";

// Which screens a person may open by typing the address. The client guard is
// not the authority — the backend decides, and until one exists nothing here
// grants anything. Its job is the directive's "direct URL deny": a manager or
// admin screen must not render just because someone knows its path.

export type RouteDenyReason = "FEATURE_HARD_DISABLED" | "ROLE_GRANT_REQUIRED" | "ADMIN_ONLY";

export interface RouteGuardActor {
  readonly accountType: "PLAYER" | "GUARDIAN" | "MANAGER" | "ADMIN";
  /** Server-verified grants only. A role preference is not one of these. */
  readonly verifiedGrants: readonly { readonly role: ManagerRole }[];
}

export type RouteGuardResult =
  | Readonly<{ allowed: true }>
  | Readonly<{ allowed: false; reason: RouteDenyReason }>;

const PUBLIC_PREFIXES = ["/login", "/signup", "/invite"];

function matchesPrefix(path: string, prefix: string): boolean {
  // "/manager" must not match "/managerial".
  return path === prefix || path.startsWith(`${prefix}/`);
}

/**
 * Whether a path may only render once we know who is asking. Everything else
 * renders straight away — waiting on a session to show the home screen would
 * put a spinner in front of every visitor.
 */
export function routeNeedsSession(path: string): boolean {
  if (PUBLIC_PREFIXES.some((prefix) => matchesPrefix(path, prefix))) return false;
  return matchesPrefix(path, "/admin") || matchesPrefix(path, "/manager");
}

export function resolveRouteGuard(path: string, actor: RouteGuardActor): RouteGuardResult {
  if (PUBLIC_PREFIXES.some((prefix) => matchesPrefix(path, prefix))) return { allowed: true };

  // A hard-disabled feature is closed to everyone, including admins.
  if (matchesPrefix(path, "/epts") && isHardDisabled("EPTS")) {
    return { allowed: false, reason: "FEATURE_HARD_DISABLED" };
  }

  if (matchesPrefix(path, "/admin")) {
    return actor.accountType === "ADMIN" ? { allowed: true } : { allowed: false, reason: "ADMIN_ONLY" };
  }

  if (matchesPrefix(path, "/manager")) {
    return actor.verifiedGrants.length > 0 ? { allowed: true } : { allowed: false, reason: "ROLE_GRANT_REQUIRED" };
  }

  return { allowed: true };
}

export function routeDenyMessage(reason: RouteDenyReason): { title: string; detail: string } {
  switch (reason) {
    case "FEATURE_HARD_DISABLED":
      return {
        title: "사용할 수 없는 기능입니다",
        detail: "이 기능은 현재 비활성화되어 있습니다.",
      };
    case "ADMIN_ONLY":
      return {
        title: "접근 권한이 없습니다",
        detail: "운영 관리 화면입니다. 관리자 계정으로만 열 수 있습니다.",
      };
    case "ROLE_GRANT_REQUIRED":
      return {
        title: "확인된 역할이 필요합니다",
        detail: "지도자·운영진 화면은 소속 확인이 끝난 뒤에 열립니다. 역할을 선택하는 것만으로는 권한이 생기지 않습니다.",
      };
  }
}
