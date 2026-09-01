import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthAdapter, SignInOutcome } from "../adapters/authAdapter";
import { LoginPage } from "../features/auth/LoginPage";

function renderLogin(adapter?: AuthAdapter) {
  render(<MemoryRouter><LoginPage authAdapter={adapter} /></MemoryRouter>);
}

function fill(email: string, password: string) {
  fireEvent.change(screen.getByLabelText("이메일"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("비밀번호"), { target: { value: password } });
}

function adapterReturning(outcome: SignInOutcome): AuthAdapter {
  return { signIn: vi.fn(async () => outcome), signOut: vi.fn(async () => {}) };
}

afterEach(() => cleanup());

describe("sign-in form", () => {
  it("asks for the fields before sending anything", async () => {
    const adapter = adapterReturning({ status: "FAILED", failure: "INVALID_CREDENTIALS" });
    renderLogin(adapter);

    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    expect(await screen.findByText("이메일을 입력해 주세요.")).toBeInTheDocument();
    expect(screen.getByText("비밀번호를 입력해 주세요.")).toBeInTheDocument();
    expect(adapter.signIn).not.toHaveBeenCalled();
  });

  it("catches a malformed address without a round trip", async () => {
    const adapter = adapterReturning({ status: "FAILED", failure: "INVALID_CREDENTIALS" });
    renderLogin(adapter);

    fill("not-an-address", "longenoughpw");
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    expect(await screen.findByText("이메일 주소 형식을 확인해 주세요.")).toBeInTheDocument();
    expect(adapter.signIn).not.toHaveBeenCalled();
  });

  it("says how long a password must be", async () => {
    renderLogin();
    fill("a@b.co", "short");
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));
    expect(await screen.findByText(/8자 이상/)).toBeInTheDocument();
  });

  it("marks a failing field for assistive technology", async () => {
    renderLogin();
    fill("nope", "longenoughpw");
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));
    await waitFor(() => expect(screen.getByLabelText("이메일").getAttribute("aria-invalid")).toBe("true"));
  });

  it("clears a field error as soon as the person edits it", async () => {
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));
    await screen.findByText("이메일을 입력해 주세요.");

    fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "a@b.co" } });
    expect(screen.queryByText("이메일을 입력해 주세요.")).not.toBeInTheDocument();
  });

  it("sends valid credentials to the adapter, untrimmed password", async () => {
    const adapter = adapterReturning({ status: "FAILED", failure: "INVALID_CREDENTIALS" });
    renderLogin(adapter);

    fill("  a@b.co  ", " keepthespaces ");
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    await waitFor(() => expect(adapter.signIn).toHaveBeenCalledWith("a@b.co", " keepthespaces "));
  });

  it("does not reveal whether the account exists", async () => {
    renderLogin(adapterReturning({ status: "FAILED", failure: "INVALID_CREDENTIALS" }));
    fill("a@b.co", "longenoughpw");
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    const message = await screen.findByRole("status");
    expect(message.textContent).toMatch(/이메일 또는 비밀번호/);
  });

  it("says sign-in is not connected yet, using the shipped adapter", async () => {
    renderLogin();
    fill("a@b.co", "longenoughpw");
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    const message = await screen.findByRole("status");
    expect(message.textContent).toMatch(/준비 중/);
  });

  it("recovers when the adapter throws", async () => {
    const adapter: AuthAdapter = {
      signIn: vi.fn(async () => {
        throw new Error("network down");
      }),
      signOut: vi.fn(async () => {}),
    };
    renderLogin(adapter);
    fill("a@b.co", "longenoughpw");
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    expect((await screen.findByRole("status")).textContent).toMatch(/준비 중/);
  });

  it("offers the way to sign up instead", () => {
    renderLogin();
    expect(screen.getByRole("link", { name: "시작하기" }).getAttribute("href")).toBe("/signup/role");
  });
});
