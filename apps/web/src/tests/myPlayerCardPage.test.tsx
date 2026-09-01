import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MyPlayerCardPage } from "../features/player/MyPlayerCardPage";

async function renderPage() {
  render(
    <MemoryRouter>
      <MyPlayerCardPage />
    </MemoryRouter>,
  );
  return await screen.findByLabelText("내 선수 카드");
}

describe("my player card", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    });
  });

  afterEach(() => cleanup());

  it("opens on the card front with my identity", async () => {
    const card = await renderPage();
    expect(card.getAttribute("data-card-face")).toBe("FRONT");
    expect(card.textContent).toContain("#8");
    expect(card.textContent).toContain("중앙 미드필더");
    expect(card.querySelector(".player-card-rating")?.textContent).toMatch(/^\d{2,3}$/);
  });

  it("grades the card and says so in words, not just colour", async () => {
    const card = await renderPage();
    const tier = card.getAttribute("data-card-tier");
    expect(["BRONZE", "SILVER", "GOLD"]).toContain(tier);
    expect(card.textContent).toContain(tier === "GOLD" ? "골드" : tier === "SILVER" ? "실버" : "브론즈");
  });

  it("shows the six ability gauges", async () => {
    await renderPage();
    expect(screen.getAllByTestId("player-card-stat")).toHaveLength(6);
  });

  it("turns over to the career record and back", async () => {
    const card = await renderPage();

    fireEvent.click(screen.getByRole("button", { name: "커리어 기록 보기" }));
    expect(card.getAttribute("data-card-face")).toBe("BACK");
    expect(await screen.findByText("FIXTURE U17 A팀 합류")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "카드 앞면 보기" }));
    expect(card.getAttribute("data-card-face")).toBe("FRONT");
    expect(await screen.findByText(/데모 능력치/)).toBeInTheDocument();
  });

  it("counts the career records and marks which are verified", async () => {
    await renderPage();
    fireEvent.click(screen.getByRole("button", { name: "커리어 기록 보기" }));
    const back = await screen.findByLabelText("커리어 기록");
    expect(Number(back.getAttribute("data-records"))).toBeGreaterThanOrEqual(1);
    expect(back.textContent).toContain("검증됨");
  });

  it("says plainly that the ability numbers are demo values", async () => {
    await renderPage();
    expect(screen.getByText(/데모 능력치/)).toBeInTheDocument();
  });

  it("links onward to the full career passport", async () => {
    await renderPage();
    expect(screen.getByRole("link", { name: /커리어 패스포트/ }).getAttribute("href")).toBe("/player/me/career");
  });
});
