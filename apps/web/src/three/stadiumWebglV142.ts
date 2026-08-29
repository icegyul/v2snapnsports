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
      const compositionOrbit = portrait ? orbit - 48 : orbit - 7;
      const compositionZoom = portrait ? Math.min(0.93, zoom * 0.92) : Math.min(0.98, zoom * 0.98);
      base.render(compositionOrbit, compositionZoom);
    },
    destroy() {
      base.destroy();
    },
  };
}
