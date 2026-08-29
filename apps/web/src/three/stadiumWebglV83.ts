import type { CoreVisualMode } from "../api/coreProductContracts";
import { createStadiumWebglRenderer as createV82, type StadiumWebglRenderer } from "./stadiumWebglV81";

export type { StadiumWebglRenderer } from "./stadiumWebglV81";

export function createStadiumWebglRenderer(
  canvas: HTMLCanvasElement,
  mode: Exclude<CoreVisualMode, "STATIC">,
): StadiumWebglRenderer | null {
  const base = createV82(canvas, mode);
  if (!base) return null;
  let portrait = false;

  return {
    triangleCount: base.triangleCount,
    resize(width: number, height: number, dpr: number) {
      portrait = width / Math.max(height, 1) < 0.82;
      base.resize(width, height, dpr);
    },
    render(orbit: number, zoom: number) {
      const cinematicBias = portrait ? 3.5 : 16.5;
      base.render(orbit + cinematicBias, zoom);
    },
    destroy() {
      base.destroy();
    },
  };
}
