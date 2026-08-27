import { describe, expect, it } from "vitest";
import { decideAuthorization } from "../lib/authorization";

describe("authorization foundation", () => {
  it("does not turn a manager role preference into authority", () => {
    expect(decideAuthorization({
      actor: { accountId: "fixture-player", rolePreference: "CLUB_DIRECTOR", grants: [] },
      action: "team:manage",
      tenantId: "tenant-a",
      teamId: "team-a"
    })).toMatchObject({ allowed: false, code: "ROLE_PREFERENCE_NOT_AUTHORITY" });
  });

  it("denies a verified grant outside its team scope", () => {
    expect(decideAuthorization({
      actor: { accountId: "fixture-coach", rolePreference: "COACH", grants: [{ role: "COACH", tenantId: "tenant-a", teamId: "team-a", verified: true }] },
      action: "training:write",
      tenantId: "tenant-a",
      teamId: "team-b"
    })).toMatchObject({ allowed: false, code: "TEAM_SCOPE_DENIED" });
  });

  it("denies an unrelated guardian access to a minor", () => {
    expect(decideAuthorization({
      actor: { accountId: "guardian-b", rolePreference: "PLAYER", grants: [] },
      action: "athlete:private-read",
      tenantId: "tenant-a",
      teamId: "team-a",
      athleteId: "minor-a",
      guardianRelationship: { guardianId: "guardian-b", athleteId: "minor-b", active: true }
    })).toMatchObject({ allowed: false, code: "SUBJECT_SCOPE_DENIED" });
  });
});
