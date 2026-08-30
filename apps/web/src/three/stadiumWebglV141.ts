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
  const source = document.createElement("canvas");
  const base = createV14(source, mode);
  if (!base) return null;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    base.destroy();
    return null;
  }

  let width = 1;
  let height = 1;
  let dpr = 1;
  let portrait = false;

  const resize = (nextWidth: number, nextHeight: number, nextDpr: number) => {
    width = Math.max(1, nextWidth);
    height = Math.max(1, nextHeight);
    dpr = Math.min(Math.max(nextDpr, 1), 2);
    portrait = width / height < 0.82;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    base.resize(width, height, dpr);
  };

  const render = (orbit: number, zoom: number) => {
    base.render(orbit, portrait ? zoom * 0.92 : zoom * 0.96);
    const sourceWidth = source.width;
    const sourceHeight = source.height;
    const sx = Math.round(sourceWidth * (portrait ? 0.01 : 0.015));
    const sy = Math.round(sourceHeight * (portrait ? 0.015 : 0.015));
    const cropBottom = portrait ? 0.19 : 0.115;
    const sw = Math.max(1, sourceWidth - sx * 2);
    const sh = Math.max(1, Math.round(sourceHeight * (1 - cropBottom) - sy));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.save();
    ctx.filter = portrait
      ? "contrast(1.035) saturate(0.94) brightness(0.985)"
      : "contrast(1.035) saturate(0.95) brightness(0.99)";
    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const vignette = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.53,
      canvas.width * 0.24,
      canvas.width * 0.5,
      canvas.height * 0.53,
      Math.max(canvas.width, canvas.height) * 0.82,
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(0.72, "rgba(0,0,0,0.01)");
    vignette.addColorStop(1, "rgba(0,0,0,0.10)");
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  const destroy = () => {
    base.destroy();
    canvas.width = 1;
    canvas.height = 1;
  };

  return {
    triangleCount: base.triangleCount,
    resize,
    render,
    destroy,
  };
}
