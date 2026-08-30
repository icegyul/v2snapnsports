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
  crowdDensity: 0.90,
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
        // V15.14: keep the mobile camera physically farther from the pitch.
        // The underlying PBR camera scales its radius/height by 1 / zoom,
        // so pinning the lowest supported zoom removes the oversized centre circle
        // without introducing a 2D crop or stretching the render.
        base.render(orbit - 34, 0.86);
        return;
      }
      base.render(orbit - 5, 1.0);
    },
    destroy() {
      base.destroy();
    },
  };
}
