import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppShell } from "../app/AppShell";

describe("PLAY app shell", () => {
  it("shows the landing CTAs at /", () => {
    render(<AppShell initialPath="/" />);
    expect(screen.getByRole("link", { name: /커뮤니티 입장/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /전술 보드 열기/ })).toBeInTheDocument();
  });

  it("renders the community feed with the fixture post", () => {
    render(<AppShell initialPath="/community" />);
    expect(screen.getByRole("heading", { name: "커뮤니티" })).toBeInTheDocument();
    expect(screen.getByText("데모 커뮤니티 게시글")).toBeInTheDocument();
  });

  it("renders the tactics board with the demo formation filled and open slots", () => {
    render(<AppShell initialPath="/tactics" />);
    expect(screen.getByRole("heading", { name: "전술 보드" })).toBeInTheDocument();
    const field = screen.getByLabelText("팀 전술 필드");
    expect(field).toHaveAttribute("data-tactics-teammate-count", "4");
    expect(field).toHaveAttribute("data-open-slots", "6");
  });
});
