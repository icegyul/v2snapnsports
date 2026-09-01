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
  presentationProfile: "SERVICE_HOME",
  homeView: "INTERIOR",
};

export function createStadiumWebglRenderer(
  canvas: HTMLCanvasElement,
  mode: Exclude<CoreVisualMode, "STATIC">,
  recipe: StadiumRecipe = BASE_STADIUM_ACCEPTANCE_RECIPE,
): StadiumWebglRenderer | null {
  const base = createPbrStadium(canvas, mode, recipe);
  if (!base) return null;
  let portrait = false;

  return {
    triangleCount: base.triangleCount,
    resize(width: number, height: number, dpr: number) {
      portrait = width / Math.max(1, height) < 0.82;
      base.resize(width, height, dpr);
    },
    render(orbit: number, zoom: number, rise?: number) {
      if (portrait) {
        base.render(orbit, zoom, rise);
        return;
      }
      base.render(orbit - 5, zoom, rise);
    },
    renderApproach(progress: number) {
      base.renderApproach?.(progress);
    },
    renderPitchEntry(progress: number) {
      base.renderPitchEntry?.(progress);
    },
    renderPlayerPosition(progress: number, x: number, z: number) {
      base.renderPlayerPosition?.(progress, x, z);
    },
    renderTeamFormation(progress: number, ownX: number, ownZ: number, teammates) {
      base.renderTeamFormation?.(progress, ownX, ownZ, teammates);
    },
    renderDigitalProjection(progress: number) {
      base.renderDigitalProjection?.(progress);
    },
    updateScoreboard(state) {
      base.updateScoreboard?.(state);
    },
    advanceCrowd(seconds: number, waveSpeed: number, waveLift: number, sway: number) {
      base.advanceCrowd?.(seconds, waveSpeed, waveLift, sway);
    },
    destroy() {
      base.destroy();
    },
  };
}
