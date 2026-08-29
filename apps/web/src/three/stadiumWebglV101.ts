import type { CoreVisualMode } from "../api/coreProductContracts";
import {
  createStadiumWebglRenderer as createPhysicalStadium,
  type StadiumWebglRenderer,
} from "./stadiumWebglV10";

export type { StadiumWebglRenderer } from "./stadiumWebglV10";

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

    physical.resize(width, height, dpr);
  };

  const drawBloom = (sx: number, sy: number, sw: number, sh: number) => {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = portrait ? 0.035 : 0.045;
    ctx.filter = "blur(4px) brightness(1.16)";
    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  const drawVignette = () => {
    const cx = canvas.width * 0.5;
    const cy = canvas.height * (portrait ? 0.54 : 0.55);
    const inner = canvas.width * (portrait ? 0.34 : 0.19);
    const outer = Math.max(canvas.width, canvas.height) * 0.76;
    const gradient = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(0.68, "rgba(0,0,0,0.015)");
    gradient.addColorStop(1, portrait ? "rgba(0,0,0,0.13)" : "rgba(0,0,0,0.10)");
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  const render = (orbit: number, zoom: number) => {
    physical.render(orbit, portrait ? Math.max(1.02, zoom) : Math.max(1.04, zoom));

    const sw = source.width;
    const sh = source.height;
    const sx = portrait ? Math.round(sw * 0.015) : Math.round(sw * 0.025);
    const sourceWidth = Math.max(1, sw - sx * 2);
    const sy = portrait ? Math.round(sh * 0.235) : Math.round(sh * 0.145);
    const cropBottom = portrait ? 0.205 : 0.245;
    const sourceHeight = Math.max(1, Math.round(sh * (1 - cropBottom) - sy));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.save();
    ctx.filter = portrait
      ? "contrast(1.07) saturate(0.97) brightness(1.04)"
      : "contrast(1.08) saturate(0.98) brightness(1.04)";
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
