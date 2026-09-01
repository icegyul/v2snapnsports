import { describe, expect, it } from "vitest";
import { resolveAuthFailure, signInRedirect } from "../features/auth/authFailure";

describe("what an HTTP status means for the person", () => {
  it("sends 401 back to sign in, because the session is gone", () => {
    expect(resolveAuthFailure(401)).toEqual({ action: "REAUTHENTICATE" });
  });

  it("shows 403 as forbidden, because signing in again would not help", () => {
    expect(resolveAuthFailure(403)).toEqual({ action: "FORBIDDEN" });
  });

  it("leaves other failures to the screen that made the request", () => {
    for (const status of [200, 404, 409, 429, 500, 503]) {
      expect(resolveAuthFailure(status)).toEqual({ action: "NONE" });
    }
  });
});

describe("coming back after signing in", () => {
  it("remembers where the person was headed", () => {
    expect(signInRedirect("/manager/coach")).toBe("/login?next=%2Fmanager%2Fcoach");
  });

  it("keeps the query the person had", () => {
    expect(signInRedirect("/home?quality=light")).toBe("/login?next=%2Fhome%3Fquality%3Dlight");
  });

  it("never bounces back to the sign-in screen itself", () => {
    expect(signInRedirect("/login")).toBe("/login");
    expect(signInRedirect("/login?next=%2Fhome")).toBe("/login");
  });

  it("refuses to send anyone to another site", () => {
    expect(signInRedirect("https://evil.example/steal")).toBe("/login");
    expect(signInRedirect("//evil.example/steal")).toBe("/login");
    expect(signInRedirect("javascript:alert(1)")).toBe("/login");
  });
});
