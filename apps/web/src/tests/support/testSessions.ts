import type { SessionAdapter, SessionSnapshot, SessionUser } from "../../adapters/sessionAdapter";

// Sessions for tests that need to reach a guarded screen. Everything here is
// synthetic, and grants are stated explicitly so a test can never quietly rely
// on ambient permission.
export function sessionAdapterFor(user: SessionUser | null): SessionAdapter {
  const snapshot: SessionSnapshot = { source: "SYNTHETIC_FIXTURE", user };
  return {
    peekSession: () => snapshot,
    async getSession(): Promise<SessionSnapshot> {
      return snapshot;
    },
  };
}

export const managerSession: SessionUser = {
  actorUserId: "test-manager",
  accountType: "MANAGER",
  accountState: "ACTIVE",
  tenantId: "tenant-a",
  teamIds: ["team-a"],
  verifiedGrants: [{ role: "COACH" }],
};

export const adminSession: SessionUser = {
  actorUserId: "test-admin",
  accountType: "ADMIN",
  accountState: "ACTIVE",
  tenantId: "tenant-a",
  teamIds: [],
  verifiedGrants: [],
};
