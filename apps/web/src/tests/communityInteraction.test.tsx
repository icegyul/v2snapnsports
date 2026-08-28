import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CommunityComposerPage, CommunityDetailPage } from "../features/community/CommunityInteractionPages";

describe("fixture-local Community interaction", () => {
  it("keeps a report as a local acknowledgement without exposing hidden content", () => {
    render(<MemoryRouter><CommunityDetailPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "신고" }));
    expect(screen.getByText("신고가 접수되었습니다")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "숨기기" }));
    expect(screen.getByText("숨긴 게시글입니다")).toBeInTheDocument();
    expect(screen.queryByText("데모 커뮤니티 게시글")).not.toBeInTheDocument();
  });

  it("saves sanitized composer text only as a local draft", () => {
    render(<MemoryRouter><CommunityComposerPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("내용"), { target: { value: "<b>안전한</b> 글 javascript:alert(1)" } });
    fireEvent.click(screen.getByRole("button", { name: "임시 저장" }));
    expect(screen.getByText("이 기기 임시 저장됨")).toBeInTheDocument();
    expect(screen.getByText("안전한 글")).toBeInTheDocument();
  });
});
