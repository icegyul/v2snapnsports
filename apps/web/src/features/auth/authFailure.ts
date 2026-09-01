// What the app does when the server refuses a request. The directive is
// explicit: 401 means re-authenticate, 403 means show a forbidden screen.
// Conflating them sends people to a login form that cannot help them.

export type AuthFailureAction = "REAUTHENTICATE" | "FORBIDDEN" | "NONE";

export function resolveAuthFailure(status: number): { action: AuthFailureAction } {
  if (status === 401) return { action: "REAUTHENTICATE" };
  if (status === 403) return { action: "FORBIDDEN" };
  return { action: "NONE" };
}

/**
 * Where to send someone whose session expired, remembering where they were
 * going. Only same-site paths survive: a `next` that could point off-site
 * would turn the sign-in screen into an open redirect.
 */
export function signInRedirect(currentPath: string): string {
  const isSameSitePath = currentPath.startsWith("/") && !currentPath.startsWith("//");
  if (!isSameSitePath) return "/login";
  if (currentPath === "/login" || currentPath.startsWith("/login?")) return "/login";
  return `/login?next=${encodeURIComponent(currentPath)}`;
}
