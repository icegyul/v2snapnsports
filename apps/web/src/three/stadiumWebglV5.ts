import type { CoreVisualMode } from "../api/coreProductContracts";
import {
  createStadiumWebglRenderer as createBaseRenderer,
  type StadiumWebglRenderer,
} from "./stadiumWebglV4";

/**
 * Cinematic camera wrapper for the V4 stadium geometry.
 * Keeps the proven V4 mesh/shader path while moving the first-screen camera
 * closer and slightly off-axis so the bowl reads as a real space instead of
 * a perfectly symmetrical tabletop model.
 */
export function createStadiumWebglRenderer(
  canvas: HTMLCanvasElement,
  mode: Exclude<CoreVisualMode, "STATIC">,
): StadiumWebglRenderer | null {
  const base = createBaseRenderer(canvas, mode);
  if (!base) return null;

  return {
    triangleCount: base.triangleCount,
    resize: (width, height, dpr) => base.resize(width, height, dpr),
    render: (orbit, zoom) => {
      const cinematicOrbit = orbit + 6.5;
      const cinematicZoom = Math.min(1.16, Math.max(0.98, zoom * 1.16));
      base.render(cinematicOrbit, cinematicZoom);
    },
    destroy: () => base.destroy(),
  };
}

export type { StadiumWebglRenderer } from "./stadiumWebglV4";
