import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AppShell } from "../app/AppShell";

afterEach(cleanup);

describe("design-independent player shell", () => {
  it("renders the canonical player navigation and leaves Community read-only", () => {
    render(<AppShell initialPath="/home" />);

    expect(screen.getByRole("navigation", { name: "플레이어 기본 탐색" })).toHaveTextContent("HOME");
    expect(screen.getByRole("navigation", { name: "플레이어 기본 탐색" })).toHaveTextContent("TRAINING");
    expect(screen.getByRole("navigation", { name: "플레이어 기본 탐색" })).toHaveTextContent("COMMUNITY");
    expect(screen.queryByText("EPTS")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /게시|작성|좋아요|댓글/ })).not.toBeInTheDocument();
  });

  it("starts Player Home at 나의 경기장 and enters the canonical stadium sequence", async () => {
    render(<AppShell initialPath="/home" />);

    expect(await screen.findByRole("heading", { name: "나의 경기장" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "경기장으로 들어가기" })).toHaveAttribute("href", "/home/full");
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
});
