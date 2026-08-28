import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CoreStateBoundary } from "../components/CoreStateBoundary";

describe("Core state boundary", () => {
  it.each(["LOADING", "EMPTY", "ERROR", "OFFLINE", "FORBIDDEN", "STALE"] as const)("renders %s without exposing protected children", (state) => {
    render(<CoreStateBoundary state={state}><p>보호된 내용</p></CoreStateBoundary>);

    expect(screen.getByTestId(`core-state-${state.toLowerCase()}`)).toBeInTheDocument();
    expect(screen.queryByText("보호된 내용")).not.toBeInTheDocument();
  });

  it("keeps cached content only for offline and stale states", () => {
    render(<CoreStateBoundary state="STALE" preserveContent><p>캐시된 내용</p></CoreStateBoundary>);
    expect(screen.getByText("캐시된 내용")).toBeInTheDocument();
  });
});
