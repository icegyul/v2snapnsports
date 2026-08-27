import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RouteStatePanel } from "../components/RouteStatePanel";

describe("common application states", () => {
  it.each([
    ["LOADING", "불러오는 중"],
    ["EMPTY", "표시할 내용이 없습니다"],
    ["ERROR", "다시 시도"],
    ["OFFLINE", "오프라인"],
    ["FORBIDDEN", "접근할 수 없습니다"],
    ["STALE", "마지막 동기화"]
  ] as const)("renders %s state", (state, text) => {
    render(<RouteStatePanel state={state} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });
});
