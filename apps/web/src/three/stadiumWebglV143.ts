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
  // Keep the full PBR/material/geometry path but avoid the large directional
  // shadow-map artifacts that cut across the bowl on first-screen framing.
  const renderMode: Exclude<CoreVisualMode, "STATIC"> = mode === "FULL" ? "FAST" : mode;
  const base = createV14(canvas, renderMode);
  if (!base) return null;
  let portrait = false;

  return {
    triangleCount: base.triangleCount,
    resize(width: number, height: number, dpr: number) {
      portrait = width / Math.max(1, height) < 0.82;
      base.resize(width, height, dpr);
    },
    render(orbit: number, zoom: number) {
      const compositionOrbit = portrait ? orbit - 36 : orbit - 5;
      const compositionZoom = portrait
        ? Math.min(0.98, Math.max(0.92, zoom * 0.96))
        : Math.min(1.01, Math.max(0.94, zoom * 0.99));
      base.render(compositionOrbit, compositionZoom);
    },
    destroy() {
      base.destroy();
    },
  };
}
