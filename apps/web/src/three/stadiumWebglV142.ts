import type { CoreVisualMode } from "../api/coreProductContracts";
import {
  createStadiumWebglRenderer as createV14,
  type StadiumWebglRenderer,
} from "./stadiumWebglV14";

export type { StadiumWebglRenderer } from "./stadiumWebglV14";

export function createStadiumWebglRenderer(
  canvas: HTMLCanvasElement,
  mode: Exclude<CoreVisualMode, "STATIC">,
): StadiumWebglRenderer | null {
  const base = createV14(canvas, mode);
  if (!base) return null;
  let portrait = false;

  return {
    triangleCount: base.triangleCount,
    resize(width: number, height: number, dpr: number) {
      portrait = width / Math.max(1, height) < 0.82;
      base.resize(width, height, dpr);
    },
    render(orbit: number, zoom: number) {
      const compositionZoom = portrait ? Math.min(0.92, zoom * 0.90) : Math.min(0.97, zoom * 0.97);
      base.render(orbit, compositionZoom);
    },
    destroy() {
      base.destroy();
    },
  };
}
