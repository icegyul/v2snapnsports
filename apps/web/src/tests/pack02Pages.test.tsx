import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach } from "vitest";
import { describe, expect, it } from "vitest";
import { AppShell } from "../app/AppShell";

afterEach(cleanup);

describe("PACK 02 Football Life routes", () => {
  it("shows only a provenance-backed career passport", () => {
    render(<AppShell initialPath="/player/me/career" />);
    expect(screen.getByRole("heading", { name: "커리어 패스포트" })).toBeInTheDocument();
    expect(screen.getByText("검증된 기록")).toBeInTheDocument();
    expect(screen.queryByTestId("pro-potential-score")).not.toBeInTheDocument();
    expect(screen.queryByTestId("ai-career-evaluation")).not.toBeInTheDocument();
  });

  it("keeps team communication separate and deduplicates a local operational message", () => {
    render(<AppShell initialPath="/communication" />);
    expect(screen.getByRole("heading", { name: "팀 커뮤니케이션" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "운영 메시지 보내기" }));
    expect(screen.getByRole("status")).toHaveTextContent("운영 메시지가 저장되었습니다");
  });

  it("routes a minor opportunity to guardian or club mediation", () => {
    render(<AppShell initialPath="/opportunities" />);
    fireEvent.click(screen.getByRole("button", { name: "기회 검토 요청" }));
    expect(screen.getByRole("status")).toHaveTextContent("보호자 또는 구단 검토 경로");
  });

  it("creates only a mediated portfolio share and supports revocation", () => {
    render(<AppShell initialPath="/player/me/portfolio" />);
    fireEvent.click(screen.getByRole("button", { name: "보호자 또는 구단 경유 공유 설정" }));
    expect(screen.getByRole("status")).toHaveTextContent("공유 범위가 설정되었습니다");
    fireEvent.click(screen.getByRole("button", { name: "공유 철회" }));
    expect(screen.getByRole("status")).toHaveTextContent("공유가 철회되었습니다");
  });
});
