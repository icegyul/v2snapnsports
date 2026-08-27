import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "../app/AppShell";

describe("design-independent player shell", () => {
  it("renders the canonical player navigation and leaves Community read-only", () => {
    render(<AppShell initialPath="/home" />);

    expect(screen.getByRole("navigation", { name: "플레이어 기본 탐색" })).toHaveTextContent("HOME");
    expect(screen.getByRole("navigation", { name: "플레이어 기본 탐색" })).toHaveTextContent("TRAINING");
    expect(screen.getByRole("navigation", { name: "플레이어 기본 탐색" })).toHaveTextContent("COMMUNITY");
    expect(screen.queryByText("EPTS")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /게시|작성|좋아요|댓글/ })).not.toBeInTheDocument();
  });
});
