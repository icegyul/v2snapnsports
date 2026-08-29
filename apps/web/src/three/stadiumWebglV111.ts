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
    ctx.globalAlpha = portrait ? 0.018 : 0.025;
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

  const drawFloodGlow = (x: number, y: number, radius: number, alpha: number) => {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, `rgba(255,249,225,${alpha})`);
    glow.addColorStop(0.12, `rgba(225,238,255,${alpha * 0.62})`);
    glow.addColorStop(0.45, `rgba(110,165,225,${alpha * 0.10})`);
    glow.addColorStop(1, "rgba(70,120,190,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  };

  const drawLighting = () => {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const radius = Math.max(canvas.width, canvas.height) * (portrait ? 0.12 : 0.095);
    drawFloodGlow(canvas.width * 0.08, canvas.height * 0.055, radius, portrait ? 0.08 : 0.13);
    drawFloodGlow(canvas.width * 0.92, canvas.height * 0.055, radius, portrait ? 0.08 : 0.13);
    drawFloodGlow(canvas.width * 0.31, canvas.height * 0.09, radius * 0.62, portrait ? 0.035 : 0.055);
    drawFloodGlow(canvas.width * 0.69, canvas.height * 0.09, radius * 0.62, portrait ? 0.035 : 0.055);
    ctx.restore();
  };

  const drawVignette = () => {
    const centerX = canvas.width * 0.5;
    const centerY = canvas.height * 0.54;
    const inner = canvas.width * (portrait ? 0.37 : 0.22);
    const outer = Math.max(canvas.width, canvas.height) * 0.83;
    const vignette = ctx.createRadialGradient(
      centerX,
      centerY,
      inner,
      centerX,
      centerY,
      outer,
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(0.75, "rgba(0,0,0,0.005)");
    vignette.addColorStop(1, portrait ? "rgba(0,0,0,0.07)" : "rgba(0,0,0,0.055)");
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
      ? Math.round(sourceCanvasWidth * 0.06)
      : Math.round(sourceCanvasWidth * 0.12);
    const sourceWidth = Math.max(1, sourceCanvasWidth - sx * 2);
    const sy = portrait
      ? Math.round(sourceCanvasHeight * 0.33)
      : Math.round(sourceCanvasHeight * 0.17);
    const cropBottom = portrait ? 0.36 : 0.35;
    const sourceHeight = Math.max(
      1,
      Math.round(sourceCanvasHeight * (1 - cropBottom) - sy),
    );

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.save();
    ctx.filter = portrait
      ? "contrast(1.055) saturate(0.90) brightness(1.015)"
      : "contrast(1.065) saturate(0.91) brightness(1.015)";
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
    drawLighting();
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
