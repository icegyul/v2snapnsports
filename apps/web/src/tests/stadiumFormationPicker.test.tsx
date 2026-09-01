import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FixtureCoreProductAdapter } from "../adapters/fixtureCoreProductAdapter";
import type { CoreFormation } from "../api/coreProductContracts";
import { TeamTacticsField } from "../features/stadium/TeamTacticsField";
import { TACTICS_FORMATION_STORAGE_KEY } from "../features/stadium/teamFormationShapes";

describe("formation picker on the tactical field", () => {
  let formation: CoreFormation;

  beforeEach(async () => {
    window.localStorage.clear();
    formation = await new FixtureCoreProductAdapter().getFormation();
  });

  afterEach(() => cleanup());

  it("offers every shape and starts on the team's own formation", () => {
    render(<TeamTacticsField formation={formation} />);
    const group = screen.getByRole("group", { name: "포메이션 선택" });
    expect(group.querySelectorAll("button")).toHaveLength(4);
    expect(screen.getByRole("button", { name: "포메이션 4-3-3" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("4-3-3", { selector: ".team-tactics-shape" })).toBeInTheDocument();
  });

  it("shows the rest of the shape as open slots without inventing players", () => {
    render(<TeamTacticsField formation={formation} />);
    expect(screen.getAllByTestId("tactics-marker")).toHaveLength(4);
    expect(screen.getAllByTestId("tactics-slot")).toHaveLength(7);
    expect(screen.getByLabelText("팀 전술 필드").getAttribute("data-open-slots")).toBe("7");
  });

  it("relays out the squad when another shape is chosen", () => {
    render(<TeamTacticsField formation={formation} />);
    const before = screen.getByRole("button", { name: "내 위치, 등번호 8, 중앙 미드필더" }).style.left;

    fireEvent.click(screen.getByRole("button", { name: "포메이션 4-2-3-1" }));

    expect(screen.getByText("4-2-3-1", { selector: ".team-tactics-shape" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "포메이션 4-2-3-1" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getAllByTestId("tactics-marker")).toHaveLength(4);
    expect(screen.getAllByTestId("tactics-slot")).toHaveLength(7);
    expect(screen.getByRole("button", { name: "내 위치, 등번호 8, 중앙 미드필더" }).style.left).not.toBe(before);
  });

  it("remembers the chosen shape", () => {
    render(<TeamTacticsField formation={formation} />);
    fireEvent.click(screen.getByRole("button", { name: "포메이션 3-5-2" }));
    expect(window.localStorage.getItem(TACTICS_FORMATION_STORAGE_KEY)).toBe("3-5-2");

    cleanup();
    render(<TeamTacticsField formation={formation} />);
    expect(screen.getByText("3-5-2", { selector: ".team-tactics-shape" })).toBeInTheDocument();
  });

  it("keeps my own card selected across a shape change", () => {
    render(<TeamTacticsField formation={formation} />);
    fireEvent.click(screen.getByRole("button", { name: "동료 등번호 11, FW" }));
    expect(screen.getByLabelText("선수 상세").getAttribute("data-panel-player")).toBe("11");

    fireEvent.click(screen.getByRole("button", { name: "포메이션 4-4-2" }));
    expect(screen.getByLabelText("선수 상세").getAttribute("data-panel-player")).toBe("11");
    expect(screen.getByRole("button", { name: "동료 등번호 11, FW" })).toBeInTheDocument();
  });

  it("labels open slots with the position they are waiting for", () => {
    render(<TeamTacticsField formation={formation} />);
    const slots = screen.getAllByTestId("tactics-slot");
    for (const openSlot of slots) {
      expect(openSlot.textContent?.trim().length).toBeGreaterThan(0);
    }
    expect(slots.some((openSlot) => openSlot.textContent?.includes("GK"))).toBe(true);
  });
});
