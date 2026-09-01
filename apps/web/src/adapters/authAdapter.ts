import type { SessionUser } from "./sessionAdapter";
import type { SignInFailure } from "../features/auth/credentials";

// Where a real V2 sign-in will attach. V2 owns its own accounts — no Rhymix
// member integration — and until a V2 auth service exists the only honest
// answer is that it is not connected.

export type SignInOutcome =
  | Readonly<{ status: "SIGNED_IN"; user: SessionUser }>
  | Readonly<{ status: "FAILED"; failure: SignInFailure }>;

export interface AuthAdapter {
  signIn(email: string, password: string): Promise<SignInOutcome>;
  signOut(): Promise<void>;
}

/**
 * The adapter in place today. It refuses every sign-in with
 * BACKEND_UNAVAILABLE rather than minting a session, because a fixture
 * session presented as a real one would misrepresent what the product can do.
 */
export class DisabledAuthAdapter implements AuthAdapter {
  readonly blockedReason = "BLOCKED_CREDENTIAL_NOT_PROVIDED";

  async signIn(): Promise<SignInOutcome> {
    return { status: "FAILED", failure: "BACKEND_UNAVAILABLE" };
  }

  async signOut(): Promise<void> {
    // Nothing was ever issued, so there is nothing to revoke.
  }
}
