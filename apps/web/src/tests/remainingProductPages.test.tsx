import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommunityPage, CareerPassportPage, TrainingPage, VideoPage } from "../features/product/RemainingProductPages";

describe("remaining Core UI product pages", () => {
  it("renders a community article with text-only sanitized content", () => {
    render(<MemoryRouter><CommunityPage /></MemoryRouter>);
    expect(screen.getByRole("article")).toHaveTextContent("데모 커뮤니티 게시글");
    expect(screen.queryByText(/<script/i)).not.toBeInTheDocument();
  });

  it("renders training without forbidden performance metrics", () => {
    render(<MemoryRouter><TrainingPage /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "훈련" })).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/피로도|속도|심박|AI 점수/i);
  });

  it("keeps unavailable video generic and never exposes a media locator", () => {
    render(<MemoryRouter><VideoPage /></MemoryRouter>);
    expect(screen.getByText("현재 표시할 수 있는 영상이 없습니다")).toBeInTheDocument();
    expect(screen.queryByRole("video")).not.toBeInTheDocument();
  });

  it("renders only provenance-backed Career events", () => {
    render(<MemoryRouter><CareerPassportPage /></MemoryRouter>);
    expect(screen.getByText("검증된 기록")).toBeInTheDocument();
    expect(screen.queryByText(/potential|AI 평가|프로 가능성/i)).not.toBeInTheDocument();
  });
});
