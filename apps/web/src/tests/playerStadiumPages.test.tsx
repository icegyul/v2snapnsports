import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { MyTeamFormationPage, SpatialHomePage, StadiumExteriorPage } from "../features/stadium/PlayerStadiumPages";

describe("Player Stadium product flow", () => {
  it("renders the completed 3D stadium hero, state layer and player identity", async () => {
    render(<MemoryRouter><StadiumExteriorPage /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "나의 경기장" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "경기장을 눌러 입장하세요" })).toHaveAttribute("data-requested-mode", "FULL");
    expect(screen.getByText("나의 공간 · #8 중앙 미드필더")).toBeInTheDocument();
    expect(screen.getByText("다음 경기 · 데모 일정")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "경기장으로 들어가기" })).toHaveAttribute("href", "/home/approach");
  });

  it("keeps formation teammate markers private", async () => {
    render(<MemoryRouter><MyTeamFormationPage /></MemoryRouter>);
    expect(await screen.findByLabelText("동료 등번호 4, DF")).toBeInTheDocument();
    expect(screen.queryByText("데모 선수")).not.toBeInTheDocument();
  });

  it("shows five spatial anchors and next team state outside dashboard cards", async () => {
    render(<MemoryRouter><SpatialHomePage /></MemoryRouter>);
    const spatialMap = await screen.findByLabelText("나의 팀 공간 바로가기");
    expect(spatialMap).toHaveTextContent("나");
    expect(screen.getAllByTestId("spatial-anchor")).toHaveLength(5);
    expect(within(spatialMap.parentElement!).getByText("다음 경기 · 데모 일정")).toBeInTheDocument();
  });
});
