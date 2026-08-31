import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StadiumBuilderPage } from "../features/stadium-builder/StadiumBuilderPage";
import {
  CUSTOM_STADIUM_ID,
  STADIUM_SELECTION_STORAGE_KEY,
  loadCustomStadiumRecipe,
} from "../features/stadium/stadiumSelection";

const mocks = vi.hoisted(() => {
  const renderer = {
    triangleCount: 10,
    resize: vi.fn(),
    render: vi.fn(),
    destroy: vi.fn(),
  };
  return { createRenderer: vi.fn(() => renderer) };
});

vi.mock("../three/stadiumWebglV14", async () => {
  const actual = await vi.importActual<typeof import("../three/stadiumWebglV14")>("../three/stadiumWebglV14");
  return { ...actual, createStadiumWebglRenderer: mocks.createRenderer };
});

describe("Builder DIY apply-to-home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    });
  });

  afterEach(() => cleanup());

  it("saves the current draft as the custom home stadium and returns home", async () => {
    render(
      <MemoryRouter initialEntries={["/home/builder"]}>
        <Routes>
          <Route path="/home/builder" element={<StadiumBuilderPage />} />
          <Route path="/home" element={<p>홈으로 돌아옴</p>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /이 경기장 사용/ }));

    await waitFor(() => expect(screen.getByText("홈으로 돌아옴")).toBeTruthy());
    expect(window.localStorage.getItem(STADIUM_SELECTION_STORAGE_KEY)).toBe(CUSTOM_STADIUM_ID);
    const recipe = loadCustomStadiumRecipe(window.localStorage);
    expect(recipe).not.toBeNull();
    expect(recipe?.presentationProfile).toBe("SERVICE_HOME");
    expect(recipe?.homeView).toBe("INTERIOR");
  });
});
