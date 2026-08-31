import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_SERVICE_STADIUM_ID,
  SERVICE_STADIUM_PRESETS,
  STADIUM_SELECTION_STORAGE_KEY,
} from "../features/stadium/stadiumSelection";
import { StadiumSelectPage } from "../features/stadium/StadiumSelectPage";

const mocks = vi.hoisted(() => {
  const renderer = {
    triangleCount: 12,
    resize: vi.fn(),
    render: vi.fn(),
    destroy: vi.fn(),
  };
  const createRenderer = vi.fn(() => renderer);
  return { createRenderer, renderer };
});

vi.mock("../three/stadiumWebglV14", async () => {
  const actual = await vi.importActual<typeof import("../three/stadiumWebglV14")>("../three/stadiumWebglV14");
  return { ...actual, createStadiumWebglRenderer: mocks.createRenderer };
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/home/stadium"]}>
      <Routes>
        <Route path="/home/stadium" element={<StadiumSelectPage />} />
        <Route path="/home" element={<p>홈으로 돌아옴</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("StadiumSelectPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    });
  });

  afterEach(() => cleanup());

  it("renders one selectable card per service stadium preset", () => {
    renderPage();
    for (const preset of SERVICE_STADIUM_PRESETS) {
      expect(screen.getByRole("radio", { name: new RegExp(preset.label) })).toBeTruthy();
    }
  });

  it("marks the stored selection as checked by default", () => {
    window.localStorage.setItem(STADIUM_SELECTION_STORAGE_KEY, SERVICE_STADIUM_PRESETS[1].id);
    renderPage();
    const checked = screen.getByRole("radio", { checked: true });
    expect(checked.getAttribute("data-preset-id")).toBe(SERVICE_STADIUM_PRESETS[1].id);
  });

  it("focuses a tapped stadium and re-renders the live preview with its recipe", async () => {
    renderPage();
    const target = SERVICE_STADIUM_PRESETS[2];
    fireEvent.click(screen.getByRole("radio", { name: new RegExp(target.label) }));

    expect(screen.getByRole("radio", { checked: true }).getAttribute("data-preset-id")).toBe(target.id);
    await waitFor(() => {
      const lastCall = mocks.createRenderer.mock.calls.at(-1) as unknown[] | undefined;
      expect(lastCall?.[2]).toEqual(target.recipe);
    });
  });

  it("persists the choice and returns home on confirm", async () => {
    renderPage();
    const target = SERVICE_STADIUM_PRESETS[1];
    fireEvent.click(screen.getByRole("radio", { name: new RegExp(target.label) }));
    fireEvent.click(screen.getByRole("button", { name: "이 경기장 사용" }));

    expect(window.localStorage.getItem(STADIUM_SELECTION_STORAGE_KEY)).toBe(target.id);
    await waitFor(() => expect(screen.getByText("홈으로 돌아옴")).toBeTruthy());
  });

  it("keeps the default selection when confirming without changes", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "이 경기장 사용" }));
    expect(window.localStorage.getItem(STADIUM_SELECTION_STORAGE_KEY)).toBe(DEFAULT_SERVICE_STADIUM_ID);
    await waitFor(() => expect(screen.getByText("홈으로 돌아옴")).toBeTruthy());
  });

  it("offers a DIY entry into the stadium builder", () => {
    renderPage();
    const diy = screen.getByRole("link", { name: /직접 만들기/ });
    expect(diy.getAttribute("href")).toBe("/home/builder");
  });

  it("marks premium presets with a tier badge", () => {
    renderPage();
    expect(screen.getAllByText("프리미엄 · 출시 기념 무료").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("기본 제공").length).toBeGreaterThanOrEqual(1);
  });
});
