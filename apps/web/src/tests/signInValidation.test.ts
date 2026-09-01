import { describe, expect, it } from "vitest";
import {
  MIN_PASSWORD_LENGTH,
  checkEmail,
  checkPassword,
  describeSignInResult,
} from "../features/auth/signInValidation";

describe("email", () => {
  it("accepts an address someone would actually sign up with", () => {
    for (const email of ["a@b.co", "player.one@snapnsports.com", "코치@example.kr"]) {
      expect(checkEmail(email)).toEqual({ ok: true });
    }
  });

  it("asks for an address when the box is empty", () => {
    expect(checkEmail("")).toEqual({ ok: false, reason: "EMPTY" });
    expect(checkEmail("   ")).toEqual({ ok: false, reason: "EMPTY" });
  });

  it("rejects something that is not an address", () => {
    for (const email of ["nope", "no@", "@no.com", "a b@c.com", "a@b"]) {
      expect(checkEmail(email)).toEqual({ ok: false, reason: "MALFORMED" });
    }
  });

  it("ignores surrounding spaces the keyboard added", () => {
    expect(checkEmail("  a@b.co  ")).toEqual({ ok: true });
  });
});

describe("password", () => {
  it("accepts one long enough to be worth having", () => {
    expect(checkPassword("a".repeat(MIN_PASSWORD_LENGTH))).toEqual({ ok: true });
  });

  it("asks for a password when the box is empty", () => {
    expect(checkPassword("")).toEqual({ ok: false, reason: "EMPTY" });
  });

  it("says how short is too short", () => {
    expect(checkPassword("a".repeat(MIN_PASSWORD_LENGTH - 1))).toEqual({ ok: false, reason: "TOO_SHORT" });
    expect(MIN_PASSWORD_LENGTH).toBeGreaterThanOrEqual(8);
  });

  it("never trims a password - spaces are part of it", () => {
    expect(checkPassword(`  ${"a".repeat(MIN_PASSWORD_LENGTH)}  `)).toEqual({ ok: true });
  });
});

describe("what the person is told after trying to sign in", () => {
  it("does not reveal whether the address exists", () => {
    const message = describeSignInResult("INVALID_CREDENTIALS");
    expect(message).toMatch(/이메일 또는 비밀번호/);
    expect(message).not.toMatch(/없는 계정|가입되지|존재하지/);
  });

  it("says plainly when sign-in is not connected yet", () => {
    expect(describeSignInResult("BACKEND_UNAVAILABLE")).toMatch(/준비 중/);
  });

  it("explains a suspended account and a rate limit distinctly", () => {
    expect(describeSignInResult("ACCOUNT_SUSPENDED")).toMatch(/정지/);
    expect(describeSignInResult("RATE_LIMITED")).toMatch(/잠시 후/);
    expect(describeSignInResult("ACCOUNT_SUSPENDED")).not.toBe(describeSignInResult("RATE_LIMITED"));
  });
});
