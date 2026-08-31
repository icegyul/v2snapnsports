import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createStadiumBuilderDraft } from "../features/stadium-builder/stadiumBuilderModel";
import { StadiumBuilderPreview } from "../features/stadium-builder/StadiumBuilderPreview";

const mocks = vi.hoisted(() => {
  const animation = { cancel: vi.fn() };
  const renderer = {
    triangleCount: 184000,
    resize: vi.fn(),
    render: vi.fn(),
    destroy: vi.fn(),
  };
  const animate = vi.fn((target: Record<string, number>, parameters: Record<string, unknown>) => {
    target.orbit = parameters.orbit as number;
    target.zoom = parameters.zoom as number;
    (parameters.onUpdate as (() => void) | undefined)?.();
    return animation;
  });
  return { animation, renderer, animate };
});

vi.mock("animejs", () => ({ animate: mocks.animate }));
vi.mock("../three/stadiumWebglV14", () => ({
  createStadiumWebglRenderer: () => mocks.renderer,
}));

describe("Stadium Builder preview lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a one-shot showcase and cancels it when the user takes control", async () => {
    const { unmount } = render(<StadiumBuilderPreview draft={createStadiumBuilderDraft()} reducedMotion={false} />);

    await waitFor(() => expect(mocks.renderer.render).toHaveBeenCalledWith(11, 1.025));
    fireEvent.pointerDown(screen.getByLabelText("3D 프리뷰 회전"), { pointerId: 1, clientX: 120 });
    expect(mocks.animation.cancel).toHaveBeenCalledTimes(1);

    unmount();
    expect(mocks.renderer.destroy).toHaveBeenCalledTimes(1);
  });

  it("uses a stable frame instead of spatial motion for reduced-motion users", async () => {
    render(<StadiumBuilderPreview draft={createStadiumBuilderDraft()} reducedMotion />);

    await waitFor(() => expect(mocks.renderer.render).toHaveBeenCalledWith(0, 1));
    expect(mocks.animate).not.toHaveBeenCalled();
  });

  it("moves closer to the bowl when the user edits seat identity", async () => {
    render(<StadiumBuilderPreview draft={createStadiumBuilderDraft()} reducedMotion={false} activeStep="SEAT" />);

    await waitFor(() => {
      expect(mocks.renderer.render.mock.calls.some(([, zoom]) => zoom > 1.4)).toBe(true);
    });
  });
});
