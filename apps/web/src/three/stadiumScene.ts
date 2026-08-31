import type { CoreVisualMode } from "../api/coreProductContracts";

export interface StadiumSceneProjection {
  readonly renderer: "WEBGL" | "TWO_DIMENSIONAL";
  readonly interactive: true;
  readonly productionSafe: true;
}

export interface StadiumSceneDefinition {
  readonly mode: CoreVisualMode;
  readonly status: "READY";
  readonly renderer: "WEBGL" | "TWO_DIMENSIONAL";
  readonly assetStrategy: "PROCEDURAL_GEOMETRY" | "CSS_STATIC_FALLBACK";
  readonly interactive: true;
  readonly productionSafe: true;
  readonly orbitDegrees: number;
  readonly zoomMin: number;
  readonly zoomMax: number;
  readonly modeLabel: string;
}

const definitions: Record<CoreVisualMode, StadiumSceneDefinition> = {
  FULL: {
    mode: "FULL",
    status: "READY",
    renderer: "WEBGL",
    assetStrategy: "PROCEDURAL_GEOMETRY",
    interactive: true,
    productionSafe: true,
    orbitDegrees: 20,
    zoomMin: 0.92,
    zoomMax: 1.14,
    modeLabel: "고화질 3D",
  },
  FAST: {
    mode: "FAST",
    status: "READY",
    renderer: "WEBGL",
    assetStrategy: "PROCEDURAL_GEOMETRY",
    interactive: true,
    productionSafe: true,
    orbitDegrees: 20,
    zoomMin: 0.94,
    zoomMax: 1.12,
    modeLabel: "빠른 3D",
  },
  LIGHT: {
    mode: "LIGHT",
    status: "READY",
    renderer: "WEBGL",
    assetStrategy: "PROCEDURAL_GEOMETRY",
    interactive: true,
    productionSafe: true,
    orbitDegrees: 16,
    zoomMin: 0.96,
    zoomMax: 1.08,
    modeLabel: "경량 3D",
  },
  STATIC: {
    mode: "STATIC",
    status: "READY",
    renderer: "TWO_DIMENSIONAL",
    assetStrategy: "CSS_STATIC_FALLBACK",
    interactive: true,
    productionSafe: true,
    orbitDegrees: 0,
    zoomMin: 1,
    zoomMax: 1.6,
    modeLabel: "2D 안전 모드",
  },
};

export function projectSceneMode(mode: CoreVisualMode): StadiumSceneProjection {
  const definition = definitions[mode];
  return {
    renderer: definition.renderer,
    interactive: true,
    productionSafe: true,
  };
}

export function createStadiumScene(mode: CoreVisualMode): StadiumSceneDefinition {
  return definitions[mode];
}

export function nextStadiumMode(mode: CoreVisualMode): CoreVisualMode {
  if (mode === "FULL") return "FAST";
  if (mode === "FAST") return "LIGHT";
  if (mode === "LIGHT") return "STATIC";
  return "STATIC";
}

/** @deprecated Use createStadiumScene. Kept to avoid breaking older imports during the V2 migration. */
export function createDevelopmentScene(mode: Exclude<CoreVisualMode, "STATIC">): StadiumSceneDefinition {
  return createStadiumScene(mode);
}
