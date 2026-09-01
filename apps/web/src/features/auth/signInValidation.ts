// Client-side checks on what someone typed, and the words they are told
// afterwards. These catch obvious mistakes before a request is made; the
// server is still the one that decides whether a sign-in succeeds.

/** Long enough to be worth having, short enough that people still use it. */
export const MIN_PASSWORD_LENGTH = 8;

export type FieldCheck =
  | Readonly<{ ok: true }>
  | Readonly<{ ok: false; reason: "EMPTY" | "MALFORMED" | "TOO_SHORT" }>;

// Deliberately loose: an address only has to look like one here, because the
// authority on whether it exists is the server, and over-strict patterns
// reject real addresses.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;

export function checkEmail(value: string): FieldCheck {
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, reason: "EMPTY" };
  return EMAIL_SHAPE.test(trimmed) ? { ok: true } : { ok: false, reason: "MALFORMED" };
}

export function checkPassword(value: string): FieldCheck {
  // Never trimmed: leading and trailing spaces are part of a password.
  if (value.length === 0) return { ok: false, reason: "EMPTY" };
  return value.length >= MIN_PASSWORD_LENGTH ? { ok: true } : { ok: false, reason: "TOO_SHORT" };
}

export type SignInFailure =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_SUSPENDED"
  | "RATE_LIMITED"
  | "BACKEND_UNAVAILABLE";

export function describeSignInResult(failure: SignInFailure): string {
  switch (failure) {
    case "INVALID_CREDENTIALS":
      // One message for both wrong-address and wrong-password: telling them
      // apart would let anyone test which addresses are registered.
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    case "ACCOUNT_SUSPENDED":
      return "정지된 계정입니다. 팀 운영진에게 문의해 주세요.";
    case "RATE_LIMITED":
      return "로그인 시도가 많습니다. 잠시 후 다시 시도해 주세요.";
    case "BACKEND_UNAVAILABLE":
      return "로그인 기능은 아직 준비 중입니다. 서버 연결이 끝나면 사용할 수 있습니다.";
  }
}

export function fieldMessage(field: "EMAIL" | "PASSWORD", reason: "EMPTY" | "MALFORMED" | "TOO_SHORT"): string {
  if (field === "EMAIL") {
    return reason === "EMPTY" ? "이메일을 입력해 주세요." : "이메일 주소 형식을 확인해 주세요.";
  }
  return reason === "EMPTY"
    ? "비밀번호를 입력해 주세요."
    : `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`;
}
