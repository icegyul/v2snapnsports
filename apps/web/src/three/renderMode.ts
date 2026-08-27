export type RenderMode = "FULL" | "FAST" | "LIGHT" | "STATIC";

export interface RenderModeInput {
  requested: RenderMode;
  assetsReady: boolean;
  production: boolean;
  webgl: boolean;
  reducedMotion: boolean;
  thermal?: "LOW" | "NORMAL";
}

export function resolveRenderMode(input: RenderModeInput): RenderMode {
  if (input.production && !input.assetsReady) return "STATIC";
  if (!input.webgl || input.reducedMotion) return "STATIC";
  if (input.thermal === "LOW") return "LIGHT";
  if (!input.assetsReady) return "FAST";
  return input.requested;
}
