import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Stadium3DScene } from "../features/stadium/Stadium3DScene";
import { createStadiumScene } from "../three/stadiumScene";

vi.mock("animejs", () => ({ animate: vi.fn(() => ({ cancel: vi.fn() })) }));
vi.mock("../three/stadiumWebgl", () => ({
  createStadiumWebglRenderer: () => {
    throw new Error("no webgl in static zoom tests");
  },
}));

afterEach(() => cleanup());

function renderStaticScene(onEnter = vi.fn()) {
  render(<Stadium3DScene mode="STATIC" onEnter={onEnter} />);
  return { surface: screen.getByRole("button", { name: "경기장 입장" }), onEnter };
}

// jsdom has no PointerEvent and drops pointerId from fireEvent.pointer*,
// so dispatch native events that carry a real pointerId for pinch coverage.
function firePointer(
  target: Element,
  type: "pointerdown" | "pointermove" | "pointerup",
  init: { pointerId: number; clientX: number; clientY: number },
): void {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: init.clientX,
    clientY: init.clientY,
  });
  Object.defineProperty(event, "pointerId", { value: init.pointerId });
  act(() => {
    target.dispatchEvent(event);
  });
}

describe("P0-A STATIC Home zoom", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: false })),
    });
  });

  it("declares a usable STATIC zoom range instead of 1→1", () => {
    const scene = createStadiumScene("STATIC");
    expect(scene.zoomMax).toBeGreaterThan(scene.zoomMin);
  });

  it("changes zoom on wheel in STATIC and exposes it to the visual layer", () => {
    const { surface } = renderStaticScene();
    expect(surface.getAttribute("data-render-mode")).toBe("STATIC");
    expect(surface.getAttribute("data-zoom")).toBe("1.000");

    fireEvent.wheel(surface, { deltaY: -100 });

    expect(Number(surface.getAttribute("data-zoom"))).toBeGreaterThan(1);
    expect(surface.style.getPropertyValue("--stadium-zoom")).not.toBe("");
    expect(Number(surface.style.getPropertyValue("--stadium-zoom"))).toBeGreaterThan(1);
  });

  it("clamps wheel zoom to the declared STATIC range", () => {
    const scene = createStadiumScene("STATIC");
    const { surface } = renderStaticScene();

    for (let i = 0; i < 40; i += 1) {
      fireEvent.wheel(surface, { deltaY: -100 });
    }
    expect(Number(surface.getAttribute("data-zoom"))).toBeCloseTo(scene.zoomMax, 5);

    for (let i = 0; i < 80; i += 1) {
      fireEvent.wheel(surface, { deltaY: 100 });
    }
    expect(Number(surface.getAttribute("data-zoom"))).toBeCloseTo(scene.zoomMin, 5);
  });

  it("supports pinch zoom in STATIC", () => {
    const { surface } = renderStaticScene();

    firePointer(surface, "pointerdown", { pointerId: 1, clientX: 100, clientY: 200 });
    firePointer(surface, "pointerdown", { pointerId: 2, clientX: 200, clientY: 200 });
    firePointer(surface, "pointermove", { pointerId: 2, clientX: 260, clientY: 200 });

    expect(Number(surface.getAttribute("data-zoom"))).toBeGreaterThan(1);
  });

  it("does not treat a zoom gesture as stadium entry", () => {
    const { surface, onEnter } = renderStaticScene();

    firePointer(surface, "pointerdown", { pointerId: 1, clientX: 100, clientY: 200 });
    firePointer(surface, "pointerdown", { pointerId: 2, clientX: 200, clientY: 200 });
    firePointer(surface, "pointermove", { pointerId: 2, clientX: 260, clientY: 200 });
    firePointer(surface, "pointerup", { pointerId: 2, clientX: 260, clientY: 200 });
    firePointer(surface, "pointerup", { pointerId: 1, clientX: 100, clientY: 200 });
    fireEvent.click(surface);

    expect(onEnter).not.toHaveBeenCalled();
  });

  it("still enters on a clean click without a gesture", () => {
    const { surface, onEnter } = renderStaticScene();
    fireEvent.click(surface);
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it("supports keyboard zoom in, out, and reset in STATIC", () => {
    const { surface } = renderStaticScene();

    fireEvent.keyDown(surface, { key: "+" });
    const zoomedIn = Number(surface.getAttribute("data-zoom"));
    expect(zoomedIn).toBeGreaterThan(1);

    fireEvent.keyDown(surface, { key: "-" });
    expect(Number(surface.getAttribute("data-zoom"))).toBeCloseTo(1, 5);

    fireEvent.keyDown(surface, { key: "+" });
    fireEvent.keyDown(surface, { key: "+" });
    fireEvent.keyDown(surface, { key: "0" });
    expect(Number(surface.getAttribute("data-zoom"))).toBeCloseTo(1, 5);
  });

  it("keeps user-controlled zoom under prefers-reduced-motion", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: true })),
    });
    const { surface } = renderStaticScene();

    fireEvent.wheel(surface, { deltaY: -100 });

    expect(Number(surface.getAttribute("data-zoom"))).toBeGreaterThan(1);
  });

  it("keeps the STATIC poster fallback mounted while zooming", () => {
    const { surface } = renderStaticScene();

    fireEvent.wheel(surface, { deltaY: -100 });

    expect(surface.getAttribute("data-render-state")).toBe("FALLBACK");
    expect(surface.querySelector(".stadium-static-fallback")).not.toBeNull();
  });
});
