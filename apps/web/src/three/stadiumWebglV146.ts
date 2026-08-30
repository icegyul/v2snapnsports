import type { CoreVisualMode } from "../api/coreProductContracts";
import {
  BASE_STADIUM_RECIPE,
  createStadiumWebglRenderer as createV14,
  type StadiumRecipe,
  type StadiumWebglRenderer,
} from "./stadiumWebglV14";

export type { StadiumWebglRenderer } from "./stadiumWebglV14";

const ACCEPTANCE_RECIPE: StadiumRecipe = {
  ...BASE_STADIUM_RECIPE,
  roofCoverage: 0.84,
  crowdDensity: 0.985,
  seatColor: 0x17344f,
  accentColor: 0x159bd2,
  columnStyle: "y",
};

export function createStadiumWebglRenderer(
  canvas: HTMLCanvasElement,
  mode: Exclude<CoreVisualMode, "STATIC">,
): StadiumWebglRenderer | null {
  const base = createV14(canvas, mode, ACCEPTANCE_RECIPE);
  if (!base) return null;
  let portrait = false;

  return {
    triangleCount: base.triangleCount,
    resize(width: number, height: number, dpr: number) {
      portrait = width / Math.max(1, height) < 0.82;
      base.resize(width, height, dpr);
    },
    render(orbit: number, zoom: number) {
      const compositionOrbit = portrait ? orbit - 34 : orbit - 5;
      const compositionZoom = portrait
        ? Math.min(0.985, Math.max(0.92, zoom * 0.965))
        : Math.min(1.015, Math.max(0.94, zoom));
      base.render(compositionOrbit, compositionZoom);
    },
    destroy() {
      base.destroy();
    },
  };
}
