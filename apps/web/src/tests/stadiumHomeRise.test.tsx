import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Stadium3DScene } from "../features/stadium/Stadium3DScene";

const mocks = vi.hoisted(() => {
  const renderer = {
    triangleCount: 1,
    resize: vi.fn(),
    render: vi.fn(),
    destroy: vi.fn(),
  };
  return { renderer };
});

vi.mock("animejs", () => ({ animate: vi.fn(() => ({ cancel: vi.fn() })) }));
vi.mock("../three/stadiumWebgl", () => ({
  createStadiumWebglRenderer: () => mocks.renderer,
}));

afterEach(() => cleanup());

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

describe("Stadium Home camera rise", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: true })),
    });
  });

  it("raises the camera on an upward drag and passes rise to the renderer", async () => {
    const onEnter = vi.fn();
    render(<Stadium3DScene mode="FULL" onEnter={onEnter} />);
    const surface = screen.getByRole("button", { name: "경기장 입장" });
    await waitFor(() => expect(mocks.renderer.resize).toHaveBeenCalled());

    expect(surface.getAttribute("data-rise")).toBe("0.000");

    firePointer(surface, "pointerdown", { pointerId: 1, clientX: 200, clientY: 500 });
    firePointer(surface, "pointermove", { pointerId: 1, clientX: 200, clientY: 300 });
    firePointer(surface, "pointerup", { pointerId: 1, clientX: 200, clientY: 300 });

    const rise = Number(surface.getAttribute("data-rise"));
    expect(rise).toBeGreaterThan(0);
    const lastRender = mocks.renderer.render.mock.calls.at(-1)!;
    expect(lastRender[2]).toBeCloseTo(rise, 3);
    // A camera drag must never be treated as stadium entry.
    fireEvent.click(surface);
    expect(onEnter).not.toHaveBeenCalled();
  });

  it("lowers the camera on a downward drag and clamps at ground level", async () => {
    render(<Stadium3DScene mode="FULL" onEnter={vi.fn()} />);
    const surface = screen.getByRole("button", { name: "경기장 입장" });
    await waitFor(() => expect(mocks.renderer.resize).toHaveBeenCalled());

    firePointer(surface, "pointerdown", { pointerId: 1, clientX: 200, clientY: 200 });
    firePointer(surface, "pointermove", { pointerId: 1, clientX: 200, clientY: 640 });
    firePointer(surface, "pointerup", { pointerId: 1, clientX: 200, clientY: 640 });

    expect(Number(surface.getAttribute("data-rise"))).toBe(0);
  });

  it("supports keyboard rise control", async () => {
    render(<Stadium3DScene mode="FULL" onEnter={vi.fn()} />);
    const surface = screen.getByRole("button", { name: "경기장 입장" });
    await waitFor(() => expect(mocks.renderer.resize).toHaveBeenCalled());

    fireEvent.keyDown(surface, { key: "ArrowUp" });
    const up = Number(surface.getAttribute("data-rise"));
    expect(up).toBeGreaterThan(0);

    fireEvent.keyDown(surface, { key: "ArrowDown" });
    expect(Number(surface.getAttribute("data-rise"))).toBeLessThan(up);
  });
});
