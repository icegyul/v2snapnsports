import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { DisabledAuthAdapter, type AuthAdapter } from "../../adapters/authAdapter";
import { checkEmail, checkPassword, describeSignInResult, fieldMessage } from "./credentials";
import "./auth.css";

const defaultAuthAdapter = new DisabledAuthAdapter();

/**
 * Sign-in for V2's own accounts. The form is real; the service behind it is
 * not connected yet, and the screen says so rather than pretending to sign
 * anyone in.
 */
export function LoginPage({ authAdapter }: { readonly authAdapter?: AuthAdapter }) {
  const adapter = authAdapter ?? defaultAuthAdapter;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormMessage("");

    const emailCheck = checkEmail(email);
    const passwordCheck = checkPassword(password);
    setEmailError(emailCheck.ok ? "" : fieldMessage("EMAIL", emailCheck.reason));
    setPasswordError(passwordCheck.ok ? "" : fieldMessage("PASSWORD", passwordCheck.reason));
    if (!emailCheck.ok || !passwordCheck.ok) return;

    setSubmitting(true);
    try {
      const outcome = await adapter.signIn(email.trim(), password);
      if (outcome.status === "FAILED") setFormMessage(describeSignInResult(outcome.failure));
    } catch {
      setFormMessage(describeSignInResult("BACKEND_UNAVAILABLE"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="shell-main auth-main">
      <p className="eyebrow">SNAPN SPORTS</p>
      <h1>로그인</h1>
      <p className="meta">스냅앤스포츠 계정으로 로그인합니다.</p>

      <form className="auth-form" onSubmit={submit} noValidate>
        {/* Explicit label/input pairing: an error nested inside the label
            would become part of the field's accessible name. */}
        <div className="auth-field">
          <label htmlFor="login-email">이메일</label>
          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            aria-invalid={emailError ? "true" : undefined}
            aria-describedby={emailError ? "login-email-error" : undefined}
            onChange={(event) => {
              setEmail(event.target.value);
              if (emailError) setEmailError("");
            }}
          />
          {emailError && <span className="auth-field-error" id="login-email-error">{emailError}</span>}
        </div>

        <div className="auth-field">
          <label htmlFor="login-password">비밀번호</label>
          <input
            id="login-password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            aria-invalid={passwordError ? "true" : undefined}
            aria-describedby={passwordError ? "login-password-error" : undefined}
            onChange={(event) => {
              setPassword(event.target.value);
              if (passwordError) setPasswordError("");
            }}
          />
          {passwordError && <span className="auth-field-error" id="login-password-error">{passwordError}</span>}
        </div>

        <button className="auth-submit" type="submit" disabled={submitting}>
          {submitting ? "확인 중" : "로그인"}
        </button>
      </form>

      {formMessage && <p className="auth-message" role="status">{formMessage}</p>}

      <p className="auth-alt">
        계정이 없으신가요? <Link to="/signup/role">시작하기</Link>
      </p>
      <p className="auth-note">보호자는 선수의 초대 링크로 시작합니다.</p>
    </main>
  );
}
