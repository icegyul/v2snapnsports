import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AppShell } from "../app/AppShell";

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
});

describe("design-independent player shell", () => {
  it("renders the canonical player navigation and leaves Community read-only", () => {
    render(<AppShell initialPath="/home" />);

    expect(screen.getByRole("navigation", { name: "플레이어 기본 탐색" })).toHaveTextContent("홈");
    expect(screen.getByRole("navigation", { name: "플레이어 기본 탐색" })).toHaveTextContent("훈련");
    expect(screen.getByRole("navigation", { name: "플레이어 기본 탐색" })).toHaveTextContent("팀");
    expect(screen.getByRole("navigation", { name: "플레이어 기본 탐색" })).toHaveTextContent("커리어");
    expect(screen.getByRole("navigation", { name: "플레이어 기본 탐색" })).toHaveTextContent("영상");
    expect(screen.queryByText("EPTS")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /게시|작성|좋아요|댓글/ })).not.toBeInTheDocument();
  });

  it("starts Player Home at 나의 경기장 and enters the canonical stadium sequence", async () => {
    render(<AppShell initialPath="/home" />);

    expect(await screen.findByRole("heading", { name: "나의 경기장" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "경기장 입장" })).toBeInTheDocument();
    expect(screen.queryByRole("complementary", { name: "경기장 사운드 컨트롤" })).not.toBeInTheDocument();
  });

  it("shows only player and manager on the public role selection route", () => {
    render(<AppShell initialPath="/signup/role" />);

    expect(screen.getByRole("heading", { name: "어떻게 시작할까요?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "선수로 시작" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "매니저로 시작" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /보호자/ })).not.toBeInTheDocument();
    expect(screen.getByText("보호자는 선수 초대 링크로 시작합니다.")).toBeInTheDocument();
  });

  it("keeps teammate identity private while making the player marker distinct", async () => {
    render(<AppShell initialPath="/home/position" />);

    expect(await screen.findByLabelText("나의 포지션 CM, 등번호 8")).toBeInTheDocument();
    expect(screen.getByLabelText("동료 등번호 4, DF")).toBeInTheDocument();
    expect(screen.queryByText("Fixture Player 08")).not.toBeInTheDocument();
  });

  it("loads the heavy Stadium Builder behind an accessible route boundary", async () => {
    render(<AppShell initialPath="/home/builder" />);

    expect(screen.getByRole("status", { name: "스타디움 설계 도구 준비" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "스타디움 설계" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "플레이어 기본 탐색" })).not.toBeInTheDocument();
    expect(screen.queryByRole("complementary", { name: "경기장 사운드 컨트롤" })).not.toBeInTheDocument();
  });

  it("keeps the production address bar in sync with Full Entry navigation", async () => {
    window.history.replaceState({}, "", "/v2/home");
    render(<AppShell />);

    await screen.findByRole("heading", { name: "나의 경기장" });
    fireEvent.click(screen.getByRole("button", { name: "경기장 입장" }));
    await waitFor(() => expect(window.location.pathname).toBe("/v2/home/full"));
  });
});

describe("signing up records a preference, never a permission", () => {
  it("remembers which role the person chose", () => {
    window.localStorage.clear();
    render(<AppShell initialPath="/signup/role" />);

    fireEvent.click(screen.getByRole("button", { name: "매니저로 시작" }));

    expect(screen.getByRole("button", { name: "매니저로 시작" }).getAttribute("aria-pressed")).toBe("true");
    expect(window.localStorage.getItem("snapn:v2:role-preference")).toBe("MANAGER");
  });

  it("says plainly that choosing manager does not open the manager screens", () => {
    window.localStorage.clear();
    render(<AppShell initialPath="/signup/role" />);
    fireEvent.click(screen.getByRole("button", { name: "매니저로 시작" }));
    expect(screen.getByRole("status").textContent).toMatch(/소속 확인/);
  });

  it("leaves the manager screens shut even after choosing manager", () => {
    window.localStorage.clear();
    window.localStorage.setItem("snapn:v2:role-preference", "MANAGER");
    render(<AppShell initialPath="/manager/coach" />);
    expect(screen.getByLabelText("접근 거부")).toBeInTheDocument();
  });
});
