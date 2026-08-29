import type { CoreVisualMode } from "../api/coreProductContracts";
import {
  BASE_STADIUM_RECIPE,
  createStadiumWebglRenderer as createPbrStadium,
  type StadiumRecipe,
  type StadiumWebglRenderer,
} from "./stadiumWebglV14";

export type { StadiumWebglRenderer } from "./stadiumWebglV14";

export const BASE_STADIUM_ACCEPTANCE_RECIPE: StadiumRecipe = {
  ...BASE_STADIUM_RECIPE,
  tierCount: 3,
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
  const base = createPbrStadium(canvas, mode, BASE_STADIUM_ACCEPTANCE_RECIPE);
  if (!base) return null;
  let portrait = false;

  return {
    triangleCount: base.triangleCount,
    resize(width: number, height: number, dpr: number) {
      portrait = width / Math.max(1, height) < 0.82;
      base.resize(width, height, dpr);
    },
    render(orbit: number, zoom: number) {
      if (portrait) {
        base.render(orbit - 34, Math.min(0.985, Math.max(0.92, zoom * 0.965)));
        return;
      }
      // V14.8 moved the physical camera inside the bowl-safe radius.
      // Keep desktop at neutral zoom so the eye remains in front of the lower tier.
      base.render(orbit - 5, 1.0);
    },
    destroy() {
      base.destroy();
    },
  };
}
