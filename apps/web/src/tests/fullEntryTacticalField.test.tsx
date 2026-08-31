import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CoreFormation, CoreSpatialHome } from "../api/coreProductContracts";
import { FixtureCoreProductAdapter } from "../adapters/fixtureCoreProductAdapter";
import { FullStadiumJourneyScene } from "../features/stadium/FullStadiumJourneyScene";

const mocks = vi.hoisted(() => {
  const renderer = {
    triangleCount: 1,
    resize: vi.fn(),
    render: vi.fn(),
    renderApproach: vi.fn(),
    renderPitchEntry: vi.fn(),
    renderDigitalProjection: vi.fn(),
    renderPlayerPosition: vi.fn(),
    renderTeamFormation: vi.fn(),
    updateScoreboard: vi.fn(),
    destroy: vi.fn(),
  };
  return { renderer, createRenderer: vi.fn(() => renderer) };
});

vi.mock("../three/stadiumWebgl", () => ({
  createStadiumWebglRenderer: () => mocks.createRenderer(),
}));
vi.mock("../features/stadium/stadiumAudioDirector", () => ({
  playStadiumAudioCue: vi.fn(),
}));

let formation: CoreFormation;
let spatial: CoreSpatialHome;

afterEach(() => cleanup());

function renderScene(mode: "STATIC" | "FULL") {
  render(
    <MemoryRouter>
      <FullStadiumJourneyScene mode={mode} formation={formation} spatial={spatial} />
    </MemoryRouter>,
  );
  return screen.getByLabelText("연속 3D 경기장 입장");
}

describe("P0-B immediate tactical field on entry", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: false })),
    });
    const adapter = new FixtureCoreProductAdapter();
    formation = await adapter.getFormation();
    spatial = await adapter.getSpatialHome();
  });

  it("shows the tactical field immediately in STATIC instead of jumping to Spatial Home", () => {
    const surface = renderScene("STATIC");

    expect(surface.getAttribute("data-journey-stage")).toBe("FORMATION");
    expect(surface.getAttribute("data-journey-stage")).not.toBe("SPATIAL_HOME");
    expect(screen.getByText("TEAM TACTICS")).toBeInTheDocument();
    expect(screen.getByText("4-3-3", { selector: ".team-tactics-shape" })).toBeInTheDocument();
    expect(screen.getByText("내 위치 #8 중앙 미드필더")).toBeInTheDocument();
    expect(screen.getByText("연결된 동료 3명")).toBeInTheDocument();
  });

  it("marks my own player as the default selected marker", () => {
    const surface = renderScene("STATIC");

    const tactics = screen.getByLabelText("팀 전술 필드");
    expect(tactics.getAttribute("data-selected-marker")).toBe("OWN");
    const ownMarker = screen.getByRole("button", { name: "내 위치, 등번호 8, 중앙 미드필더" });
    expect(ownMarker.textContent).toContain("#8");
    expect(ownMarker.textContent).toContain("나");
    expect(ownMarker.className).toContain("is-selected");
    expect(surface.getAttribute("data-formation-teammate-count")).toBe("3");
  });

  it("renders exactly the three connected teammates and invents nobody", () => {
    renderScene("STATIC");

    expect(screen.getByRole("button", { name: "동료 등번호 4, DF" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "동료 등번호 7, MF" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "동료 등번호 11, FW" })).toBeInTheDocument();
    expect(screen.getAllByTestId("tactics-marker")).toHaveLength(4);
    expect(screen.queryByText("데모 선수")).not.toBeInTheDocument();
  });

  it("changes the active connection when a teammate is selected", () => {
    renderScene("STATIC");
    const tactics = screen.getByLabelText("팀 전술 필드");

    fireEvent.click(screen.getByRole("button", { name: "동료 등번호 4, DF" }));
    expect(tactics.getAttribute("data-selected-marker")).toBe("4");
    expect(tactics.querySelector("[data-connection-to='4']")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "동료 등번호 11, FW" }));
    expect(tactics.getAttribute("data-selected-marker")).toBe("11");
    expect(tactics.querySelector("[data-connection-to='11']")).not.toBeNull();
    expect(tactics.querySelector("[data-connection-to='4']")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "내 위치, 등번호 8, 중앙 미드필더" }));
    expect(tactics.getAttribute("data-selected-marker")).toBe("OWN");
  });

  it("shows the tactical field first in WebGL mode without auto-running the cinematic", async () => {
    const surface = renderScene("FULL");

    await waitFor(() => expect(surface.getAttribute("data-render-state")).toBe("READY"));
    expect(screen.getByText("TEAM TACTICS")).toBeInTheDocument();
    expect(surface.getAttribute("data-journey-stage")).toBe("FORMATION");
    expect(mocks.renderer.renderTeamFormation).toHaveBeenCalled();
    const call = mocks.renderer.renderTeamFormation.mock.calls.at(-1)!;
    expect(call[0]).toBe(1);
    expect(call[3]).toHaveLength(3);
    expect(mocks.renderer.renderApproach).not.toHaveBeenCalled();
  });

  it("keeps the cinematic journey behind an explicit action", async () => {
    const surface = renderScene("FULL");
    await waitFor(() => expect(surface.getAttribute("data-render-state")).toBe("READY"));

    fireEvent.click(screen.getByRole("button", { name: "시네마틱 입장" }));

    await waitFor(() => expect(mocks.renderer.renderApproach).toHaveBeenCalled());
    expect(surface.getAttribute("data-journey-stage")).toBe("APPROACH");
  });
});
