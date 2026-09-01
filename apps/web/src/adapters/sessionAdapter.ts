import type { ManagerRole } from "../api/contracts";

// The seam a real V2 sign-in drops into. V2 owns its own accounts — there is
// no Rhymix member integration — but no V2 backend exists yet, so the
// production adapter refuses rather than pretending. Mirrors the
// Fixture/Production split already used for legacy data.

export type SessionAccountType = "PLAYER" | "GUARDIAN" | "MANAGER" | "ADMIN";

export interface SessionUser {
  readonly actorUserId: string;
  readonly accountType: SessionAccountType;
  readonly accountState: "ACTIVE" | "SUSPENDED";
  readonly tenantId: string;
  readonly teamIds: readonly string[];
  /** Server-verified grants. Never derived from a role preference. */
  readonly verifiedGrants: readonly { readonly role: ManagerRole }[];
}

export interface SessionSnapshot {
  readonly source: "SYNTHETIC_FIXTURE" | "PRODUCTION";
  readonly user: SessionUser | null;
}

export interface SessionAdapter {
  getSession(): Promise<SessionSnapshot>;
  /**
   * The session already in hand, if any, so a guarded screen does not flash a
   * spinner at someone who is plainly signed in. An adapter that must ask a
   * server leaves this out; the guard then treats the person as unknown until
   * getSession answers, which denies guarded screens in the meantime.
   */
  peekSession?(): SessionSnapshot | null;
}

/** The demo session. Explicitly synthetic; it grants no manager or admin role. */
export const FIXTURE_SESSION_USER: SessionUser = {
  actorUserId: "demo-player-08",
  accountType: "PLAYER",
  accountState: "ACTIVE",
  tenantId: "tenant-a",
  teamIds: ["team-a"],
  verifiedGrants: [],
};

export class FixtureSessionAdapter implements SessionAdapter {
  peekSession(): SessionSnapshot {
    return { source: "SYNTHETIC_FIXTURE", user: FIXTURE_SESSION_USER };
  }

  async getSession(): Promise<SessionSnapshot> {
    return this.peekSession();
  }
}

export class SessionBackendDisabledError extends Error {
  readonly code = "BLOCKED_CREDENTIAL_NOT_PROVIDED";

  constructor() {
    super("V2 auth backend is not connected. No credentials or endpoint are configured.");
    this.name = "SessionBackendDisabledError";
  }
}

/**
 * Stays disabled until a real V2 auth service and its credentials exist.
 * Enabling this without a backend would present a synthetic session as a real
 * one, which the directive forbids.
 */
export class ProductionSessionAdapter implements SessionAdapter {
  async getSession(): Promise<SessionSnapshot> {
    throw new SessionBackendDisabledError();
  }
}
