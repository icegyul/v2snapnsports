import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Stadium3DScene } from "../features/stadium/Stadium3DScene";

const mocks = vi.hoisted(() => {
  const animation = { cancel: vi.fn() };
  const renderer = {
    triangleCount: 1,
    resize: vi.fn(),
    render: vi.fn(),
    destroy: vi.fn(),
  };
  const animate = vi.fn((target: { orbit: number; zoom: number }, options: {
    orbit: number;
    zoom: number;
    onUpdate?: () => void;
  }) => {
    target.orbit = options.orbit;
    target.zoom = options.zoom;
    options.onUpdate?.();
    return animation;
  });
  return { animate, animation, renderer };
});

vi.mock("animejs", () => ({ animate: mocks.animate }));
vi.mock("../three/stadiumWebgl", () => ({
  createStadiumWebglRenderer: () => mocks.renderer,
}));

afterEach(() => cleanup());

describe("Stadium Home Anime.js camera lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: false })),
    });
  });

  it("runs one camera push and cancels it when the player takes pointer control", async () => {
    render(<Stadium3DScene mode="FULL" onEnter={vi.fn()} />);

    await waitFor(() => expect(mocks.animate).toHaveBeenCalledTimes(1));
    expect(mocks.renderer.render).toHaveBeenCalledWith(0, 1, 0);

    fireEvent.pointerDown(screen.getByRole("button", { name: "경기장 입장" }), {
      pointerId: 1,
      clientX: 80,
      clientY: 120,
    });
    expect(mocks.animation.cancel).toHaveBeenCalled();
  });

  it("does not start the spatial camera animation for reduced-motion users", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: true })),
    });

    render(<Stadium3DScene mode="FULL" onEnter={vi.fn()} />);

    await waitFor(() => expect(mocks.renderer.resize).toHaveBeenCalled());
    expect(mocks.animate).not.toHaveBeenCalled();
  });
});
