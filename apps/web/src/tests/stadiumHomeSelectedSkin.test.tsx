import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Stadium3DScene } from "../features/stadium/Stadium3DScene";
import {
  SERVICE_STADIUM_PRESETS,
  STADIUM_SELECTION_STORAGE_KEY,
} from "../features/stadium/stadiumSelection";
import { BASE_STADIUM_ACCEPTANCE_RECIPE } from "../three/stadiumWebglV151";

const mocks = vi.hoisted(() => {
  const renderer = {
    triangleCount: 1,
    resize: vi.fn(),
    render: vi.fn(),
    destroy: vi.fn(),
  };
  const createRenderer = vi.fn(() => renderer);
  return { createRenderer, renderer };
});

vi.mock("animejs", () => ({ animate: vi.fn(() => ({ cancel: vi.fn() })) }));
vi.mock("../three/stadiumWebgl", () => ({
  createStadiumWebglRenderer: mocks.createRenderer,
}));

describe("Stadium home renders the selected stadium skin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: true })),
    });
  });

  afterEach(() => cleanup());

  it("passes the default recipe when no stadium was chosen", async () => {
    render(<Stadium3DScene mode="FULL" onEnter={vi.fn()} />);
    await waitFor(() => expect(mocks.createRenderer).toHaveBeenCalled());
    const lastCall = mocks.createRenderer.mock.calls.at(-1) as unknown[];
    expect(lastCall[1]).toBe("FULL");
    expect(lastCall[2]).toEqual(BASE_STADIUM_ACCEPTANCE_RECIPE);
  });

  it("passes the stored preset recipe to the renderer", async () => {
    const target = SERVICE_STADIUM_PRESETS[1];
    window.localStorage.setItem(STADIUM_SELECTION_STORAGE_KEY, target.id);

    render(<Stadium3DScene mode="FULL" onEnter={vi.fn()} />);
    await waitFor(() => expect(mocks.createRenderer).toHaveBeenCalled());
    const lastCall = mocks.createRenderer.mock.calls.at(-1) as unknown[];
    expect(lastCall[2]).toEqual(target.recipe);
  });

  it("labels the scene with the selected preset id for acceptance checks", async () => {
    const target = SERVICE_STADIUM_PRESETS[1];
    window.localStorage.setItem(STADIUM_SELECTION_STORAGE_KEY, target.id);

    const { container } = render(<Stadium3DScene mode="FULL" onEnter={vi.fn()} />);
    await waitFor(() => expect(mocks.createRenderer).toHaveBeenCalled());
    const surface = container.querySelector(".stadium-interaction-surface");
    expect(surface?.getAttribute("data-stadium-preset")).toBe(target.id);
  });
});
