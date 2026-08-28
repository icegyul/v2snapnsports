import type { CoreVisualMode } from "../api/coreProductContracts";

export interface StadiumSceneProjection {
  readonly renderer: "DEVELOPMENT_SCENE" | "TWO_DIMENSIONAL";
  readonly interactive: boolean;
  readonly productionSafe: boolean;
}

export interface DevelopmentStadiumScene {
  readonly mode: CoreVisualMode;
  readonly status: "DEVELOPMENT_SCAFFOLD";
  readonly hasFinalAssets: false;
}

export function projectSceneMode(mode: CoreVisualMode): StadiumSceneProjection {
  return mode === "STATIC"
    ? { renderer: "TWO_DIMENSIONAL", interactive: true, productionSafe: true }
    : { renderer: "DEVELOPMENT_SCENE", interactive: true, productionSafe: false };
}

export function createDevelopmentScene(mode: Exclude<CoreVisualMode, "STATIC">): DevelopmentStadiumScene {
  return { mode, status: "DEVELOPMENT_SCAFFOLD", hasFinalAssets: false };
}
