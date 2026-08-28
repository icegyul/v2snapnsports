import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CareerSeasonPage, TrainingDetailPage, VideoDetailPage } from "../features/product/ProductDetailPages";

describe("P0 product detail routes", () => {
  it("changes fixture training participation without metrics", () => {
    render(<MemoryRouter><TrainingDetailPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "늦게 참여" }));
    expect(screen.getByText("참가 상태: LATE")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/피로도|속도|심박|AI 점수/i);
  });

  it("keeps unavailable video detail free of source locator", () => {
    render(<MemoryRouter><VideoDetailPage /></MemoryRouter>);
    expect(screen.getByText("영상을 볼 수 없습니다")).toBeInTheDocument();
    expect(screen.queryByRole("video")).not.toBeInTheDocument();
  });

  it("keeps Career season facts provenance-backed and share disabled", () => {
    render(<MemoryRouter><CareerSeasonPage /></MemoryRouter>);
    expect(screen.getByText("검증된 기록")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "공유 설정" })).toBeDisabled();
  });
});
