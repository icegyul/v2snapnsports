import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { StadiumBuilderPage } from "../features/stadium-builder/StadiumBuilderPage";

vi.mock("../features/stadium-builder/StadiumBuilderPreview", () => ({
  StadiumBuilderPreview: () => <div aria-label="경기장 Builder 3D 미리보기" />,
}));

describe("Stadium Builder commercial workspace", () => {
  beforeEach(() => window.localStorage.clear());

  it("presents seven Korean creation stages and real visual controls", async () => {
    render(<MemoryRouter><StadiumBuilderPage /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: "스타디움 설계" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /단계/ })).toHaveLength(7);

    fireEvent.click(screen.getByRole("button", { name: "6단계 외관·조명" }));
    expect(await screen.findByLabelText("외관 구조")).toBeInTheDocument();
    expect(screen.getByLabelText("조명 장면")).toBeInTheDocument();
    expect(screen.getByText("저장하지 않은 변경이 있습니다.")).toBeInTheDocument();
  });
});
