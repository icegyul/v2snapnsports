import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FixtureCoreProductAdapter } from "../adapters/fixtureCoreProductAdapter";
import type { CoreFormation } from "../api/coreProductContracts";
import { TeamTacticsField } from "../features/stadium/TeamTacticsField";
import { resolveTacticsRole, tacticsCardProfile } from "../features/stadium/teamTacticsCards";

describe("tactics card profiles (deterministic demo data)", () => {
  it("maps positions to the four card roles", () => {
    expect(resolveTacticsRole("DF")).toBe("DF");
    expect(resolveTacticsRole("MF")).toBe("MF");
    expect(resolveTacticsRole("FW")).toBe("FW");
    expect(resolveTacticsRole("GK")).toBe("GK");
    expect(resolveTacticsRole("중앙 미드필더")).toBe("MF");
    expect(resolveTacticsRole("수비형 미드필더")).toBe("MF");
    expect(resolveTacticsRole("측면 수비수")).toBe("DF");
    expect(resolveTacticsRole("공격수")).toBe("FW");
    expect(resolveTacticsRole("골키퍼")).toBe("GK");
    expect(resolveTacticsRole("알 수 없음")).toBe("MF");
  });

  it("is deterministic for the same player", () => {
    const first = tacticsCardProfile("7", "MF");
    const second = tacticsCardProfile("7", "MF");
    expect(first).toEqual(second);
  });

  it("keeps ratings and stats inside the demo display range", () => {
    for (const [shirt, position] of [["4", "DF"], ["7", "MF"], ["11", "FW"], ["8", "중앙 미드필더"], ["1", "GK"]] as const) {
      const profile = tacticsCardProfile(shirt, position);
      expect(profile.rating).toBeGreaterThanOrEqual(90);
      expect(profile.rating).toBeLessThanOrEqual(132);
      expect(profile.stats).toHaveLength(6);
      for (const stat of profile.stats) {
        expect(stat.value).toBeGreaterThanOrEqual(55);
        expect(stat.value).toBeLessThanOrEqual(135);
      }
    }
  });

  it("biases stats toward the player's role", () => {
    const defender = tacticsCardProfile("4", "DF");
    const striker = tacticsCardProfile("11", "FW");
    const defenderDefense = defender.stats.find((stat) => stat.key === "DEF")!.value;
    const defenderShot = defender.stats.find((stat) => stat.key === "SHO")!.value;
    const strikerShot = striker.stats.find((stat) => stat.key === "SHO")!.value;
    const strikerDefense = striker.stats.find((stat) => stat.key === "DEF")!.value;
    expect(defenderDefense).toBeGreaterThan(defenderShot);
    expect(strikerShot).toBeGreaterThan(strikerDefense);
  });
});

describe("FC-style tactics field cards", () => {
  let formation: CoreFormation;

  beforeEach(async () => {
    formation = await new FixtureCoreProductAdapter().getFormation();
  });

  afterEach(() => cleanup());

  it("shows a rating on every card", () => {
    render(<TeamTacticsField formation={formation} />);
    for (const marker of screen.getAllByTestId("tactics-marker")) {
      expect(marker.querySelector(".team-tactics-rating")?.textContent).toMatch(/^\d{2,3}$/);
    }
  });

  it("tags each card with its role for position coloring", () => {
    render(<TeamTacticsField formation={formation} />);
    expect(screen.getByRole("button", { name: "동료 등번호 4, DF" }).getAttribute("data-role")).toBe("DF");
    expect(screen.getByRole("button", { name: "동료 등번호 11, FW" }).getAttribute("data-role")).toBe("FW");
    expect(screen.getByRole("button", { name: "내 위치, 등번호 8, 중앙 미드필더" }).getAttribute("data-role")).toBe("MF");
  });

  it("opens the detail panel on my own card by default", () => {
    render(<TeamTacticsField formation={formation} />);
    const panel = screen.getByLabelText("선수 상세");
    expect(panel.getAttribute("data-panel-player")).toBe("OWN");
    expect(panel.querySelectorAll(".team-tactics-stat-row")).toHaveLength(6);
  });

  it("switches the detail panel to a tapped teammate", () => {
    render(<TeamTacticsField formation={formation} />);
    fireEvent.click(screen.getByRole("button", { name: "동료 등번호 11, FW" }));
    const panel = screen.getByLabelText("선수 상세");
    expect(panel.getAttribute("data-panel-player")).toBe("11");
    expect(panel.textContent).toContain("#11");
    expect(panel.textContent).toContain("FW");
  });
});
