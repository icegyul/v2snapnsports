import type { CoreVisualMode } from "../api/coreProductContracts";
import {
  createStadiumWebglRenderer as createPhysicalStadium,
  type StadiumWebglRenderer,
} from "./stadiumWebglV11";

export type { StadiumWebglRenderer } from "./stadiumWebglV11";

export function createStadiumWebglRenderer(
  canvas: HTMLCanvasElement,
  mode: Exclude<CoreVisualMode, "STATIC">,
): StadiumWebglRenderer | null {
  const source = document.createElement("canvas");
  const physical = createPhysicalStadium(source, mode);
  if (!physical) return null;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    physical.destroy();
    return null;
  }

  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let portrait = false;

  const resize = (nextWidth: number, nextHeight: number, dpr: number) => {
    width = Math.max(1, nextWidth);
    height = Math.max(1, nextHeight);
    pixelRatio = Math.min(Math.max(dpr, 1), 2);
    portrait = width / height < 0.82;

    canvas.width = Math.max(1, Math.round(width * pixelRatio));
    canvas.height = Math.max(1, Math.round(height * pixelRatio));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    physical.resize(width, height, pixelRatio);
  };

  const drawBloom = (
    sx: number,
    sy: number,
    sourceWidth: number,
    sourceHeight: number,
  ) => {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = portrait ? 0.020 : 0.028;
    ctx.filter = "blur(3px) brightness(1.08)";
    ctx.drawImage(
      source,
      sx,
      sy,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    ctx.restore();
  };

  const drawVignette = () => {
    const centerX = canvas.width * 0.5;
    const centerY = canvas.height * 0.55;
    const inner = canvas.width * (portrait ? 0.36 : 0.21);
    const outer = Math.max(canvas.width, canvas.height) * 0.82;
    const vignette = ctx.createRadialGradient(
      centerX,
      centerY,
      inner,
      centerX,
      centerY,
      outer,
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(0.74, "rgba(0,0,0,0.006)");
    vignette.addColorStop(1, portrait ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.06)");
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  const render = (orbit: number, zoom: number) => {
    const baseZoom = portrait
      ? Math.max(0.93, zoom * 0.94)
      : Math.max(0.95, zoom * 0.97);
    physical.render(orbit, baseZoom);

    const sourceCanvasWidth = source.width;
    const sourceCanvasHeight = source.height;
    const sx = portrait
      ? Math.round(sourceCanvasWidth * 0.045)
      : Math.round(sourceCanvasWidth * 0.10);
    const sourceWidth = Math.max(1, sourceCanvasWidth - sx * 2);
    const sy = portrait
      ? Math.round(sourceCanvasHeight * 0.35)
      : Math.round(sourceCanvasHeight * 0.19);
    const cropBottom = 0.38;
    const sourceHeight = Math.max(
      1,
      Math.round(sourceCanvasHeight * (1 - cropBottom) - sy),
    );

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.save();
    ctx.filter = portrait
      ? "contrast(1.04) saturate(0.96) brightness(1.03)"
      : "contrast(1.05) saturate(0.97) brightness(1.03)";
    ctx.drawImage(
      source,
      sx,
      sy,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    ctx.restore();

    drawBloom(sx, sy, sourceWidth, sourceHeight);
    drawVignette();
  };

  const destroy = () => {
    physical.destroy();
    canvas.width = 1;
    canvas.height = 1;
  };

  return {
    triangleCount: physical.triangleCount,
    resize,
    render,
    destroy,
  };
}
