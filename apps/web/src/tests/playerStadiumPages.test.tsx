import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { MyTeamFormationPage, SpatialHomePage, StadiumExteriorPage } from "../features/stadium/PlayerStadiumPages";

describe("Player Stadium product flow", () => {
  it("renders a labeled STATIC exterior with the approach route", async () => {
    render(<MemoryRouter><StadiumExteriorPage /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "나의 경기장" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "경기장으로 들어가기" })).toHaveAttribute("href", "/home/approach");
  });

  it("keeps formation teammate markers private", async () => {
    render(<MemoryRouter><MyTeamFormationPage /></MemoryRouter>);
    expect(await screen.findByLabelText("동료 등번호 4, DF")).toBeInTheDocument();
    expect(screen.queryByText("데모 선수")).not.toBeInTheDocument();
  });

  it("shows five spatial anchors and next team state outside dashboard cards", async () => {
    render(<MemoryRouter><SpatialHomePage /></MemoryRouter>);
    expect(await screen.findByLabelText("나의 팀 공간 바로가기")).toHaveTextContent("나");
    expect(screen.getAllByTestId("spatial-anchor")).toHaveLength(5);
    expect(screen.getByText("다음 경기 · 데모 일정")).toBeInTheDocument();
  });
});
