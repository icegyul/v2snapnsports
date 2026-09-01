import { describe, expect, it } from "vitest";
import {
  FIXTURE_SESSION_USER,
  FixtureSessionAdapter,
  ProductionSessionAdapter,
  SessionBackendDisabledError,
} from "../adapters/sessionAdapter";

describe("fixture session", () => {
  it("is labelled synthetic so it can never be mistaken for a real sign-in", async () => {
    const snapshot = await new FixtureSessionAdapter().getSession();
    expect(snapshot.source).toBe("SYNTHETIC_FIXTURE");
    expect(snapshot.user?.actorUserId).toBe("demo-player-08");
  });

  it("grants no manager or admin power", () => {
    expect(FIXTURE_SESSION_USER.accountType).toBe("PLAYER");
    expect(FIXTURE_SESSION_USER.verifiedGrants).toHaveLength(0);
  });
});

describe("production session", () => {
  it("refuses until a real backend and credentials exist", async () => {
    await expect(new ProductionSessionAdapter().getSession()).rejects.toBeInstanceOf(SessionBackendDisabledError);
  });

  it("reports the blocked reason rather than inventing a session", async () => {
    await expect(new ProductionSessionAdapter().getSession()).rejects.toMatchObject({
      code: "BLOCKED_CREDENTIAL_NOT_PROVIDED",
    });
  });
});
