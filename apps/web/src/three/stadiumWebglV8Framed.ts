import type { CoreVisualMode } from "../api/coreProductContracts";
import { createStadiumWebglRenderer as createV8, type StadiumWebglRenderer } from "./stadiumWebglV8";

export type { StadiumWebglRenderer } from "./stadiumWebglV8";

export function createStadiumWebglRenderer(
  canvas: HTMLCanvasElement,
  mode: Exclude<CoreVisualMode, "STATIC">,
): StadiumWebglRenderer | null {
  const frame = document.createElement("canvas");
  const base = createV8(frame, mode);
  if (!base) return null;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    base.destroy();
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

    const sourceHeight = portrait ? height * 1.27 : height * 1.07;
    base.resize(width, sourceHeight, pixelRatio);
  };

  const drawLight = (x: number, y: number, radius: number, alpha: number) => {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, `rgba(255,249,229,${alpha})`);
    glow.addColorStop(0.10, `rgba(232,242,255,${alpha * 0.72})`);
    glow.addColorStop(0.38, `rgba(124,176,230,${alpha * 0.16})`);
    glow.addColorStop(1, "rgba(55,112,205,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  };

  const render = (orbit: number, zoom: number) => {
    base.render(orbit, portrait ? Math.max(1.10, zoom) : Math.max(1.03, zoom));

    const sw = frame.width;
    const sh = frame.height;
    const sy = portrait ? Math.round(sh * 0.30) : Math.round(sh * 0.115);
    const cropBottom = portrait ? 0.28 : 0.19;
    const sHeight = Math.max(1, Math.round(sh * (1 - cropBottom) - sy));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.save();
    ctx.filter = portrait
      ? "contrast(1.10) saturate(1.03) brightness(1.06)"
      : "contrast(1.10) saturate(1.02) brightness(1.05)";
    ctx.drawImage(frame, 0, sy, sw, sHeight, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = portrait ? 0.075 : 0.09;
    ctx.filter = "blur(6px) brightness(1.30) saturate(1.04)";
    ctx.drawImage(frame, 0, sy, sw, sHeight, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const lightRadius = Math.max(canvas.width, canvas.height) * (portrait ? 0.15 : 0.11);
    drawLight(canvas.width * 0.10, canvas.height * 0.06, lightRadius, portrait ? 0.15 : 0.20);
    drawLight(canvas.width * 0.90, canvas.height * 0.06, lightRadius, portrait ? 0.15 : 0.20);
    drawLight(canvas.width * 0.24, canvas.height * 0.14, lightRadius * 0.70, portrait ? 0.07 : 0.10);
    drawLight(canvas.width * 0.76, canvas.height * 0.14, lightRadius * 0.70, portrait ? 0.07 : 0.10);
    ctx.restore();

    const haze = ctx.createLinearGradient(0, 0, 0, canvas.height);
    haze.addColorStop(0, "rgba(210,228,247,0.025)");
    haze.addColorStop(0.38, "rgba(125,164,209,0.012)");
    haze.addColorStop(0.70, "rgba(0,0,0,0)");
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    const vignette = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.54,
      canvas.width * 0.14,
      canvas.width * 0.5,
      canvas.height * 0.54,
      Math.max(canvas.width, canvas.height) * 0.73,
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(0.64, "rgba(0,0,0,0.025)");
    vignette.addColorStop(1, portrait ? "rgba(0,0,0,0.23)" : "rgba(0,0,0,0.18)");
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
