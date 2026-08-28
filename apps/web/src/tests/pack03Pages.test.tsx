import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AppShell } from "../app/AppShell";

afterEach(cleanup);

describe("PACK 03 manager workspace routes", () => {
  it("shows six verified-role workspace choices without treating preference as permission", () => {
    render(<AppShell initialPath="/manager" />);
    expect(screen.getByRole("heading", { name: "매니저 워크스페이스" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /역할로 전환/ })).toHaveLength(6);
    expect(screen.getByText(/선호 역할은 권한이 아닙니다/)).toBeInTheDocument();
  });

  it("switches Coach to Referee and removes Coach-only action immediately", () => {
    render(<AppShell initialPath="/manager" />);
    fireEvent.click(screen.getByRole("button", { name: "COACH 역할로 전환" }));
    expect(screen.getByRole("heading", { name: "코치 워크스페이스" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "훈련 세션 시작" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "REFEREE 역할로 전환" }));
    expect(screen.getByRole("heading", { name: "심판 워크스페이스" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "훈련 세션 시작" })).not.toBeInTheDocument();
  });

  it("keeps Agent opportunity action mediated and Analyst playback static", () => {
    render(<AppShell initialPath="/manager" />);
    fireEvent.click(screen.getByRole("button", { name: "AGENT 역할로 전환" }));
    fireEvent.click(screen.getByRole("button", { name: "보호자 또는 구단 검토 요청" }));
    expect(screen.getByRole("status")).toHaveTextContent("보호자 또는 구단 중재 경로");
    fireEvent.click(screen.getByRole("button", { name: "ANALYST 역할로 전환" }));
    expect(screen.getByText(/STATIC playback/)).toBeInTheDocument();
  });
});
