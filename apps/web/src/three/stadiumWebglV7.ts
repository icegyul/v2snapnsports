import type { CoreVisualMode } from "../api/coreProductContracts";
import { createStadiumWebglRenderer as createV6, type StadiumWebglRenderer } from "./stadiumWebglV6";

export type { StadiumWebglRenderer } from "./stadiumWebglV6";

export function createStadiumWebglRenderer(
  canvas: HTMLCanvasElement,
  mode: Exclude<CoreVisualMode, "STATIC">,
): StadiumWebglRenderer | null {
  const frame = document.createElement("canvas");
  const base = createV6(frame, mode);
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

    const sourceHeight = portrait ? height * 1.30 : height * 1.08;
    base.resize(width, sourceHeight, pixelRatio);
  };

  const render = (orbit: number, zoom: number) => {
    base.render(orbit, portrait ? Math.max(1.12, zoom) : Math.max(1.04, zoom));

    const sw = frame.width;
    const sh = frame.height;
    const sx = 0;
    const sy = portrait ? Math.round(sh * 0.32) : Math.round(sh * 0.12);
    const cropBottom = portrait ? 0.285 : 0.19;
    const sHeight = Math.max(1, Math.round(sh * (1 - cropBottom) - sy));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.save();
    ctx.filter = portrait
      ? "contrast(1.13) saturate(1.10) brightness(1.08)"
      : "contrast(1.11) saturate(1.08) brightness(1.06)";
    ctx.drawImage(frame, sx, sy, sw, sHeight, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = portrait ? 0.10 : 0.12;
    ctx.filter = "blur(7px) brightness(1.38) saturate(1.12)";
    ctx.drawImage(frame, sx, sy, sw, sHeight, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const vignette = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.53,
      canvas.width * 0.12,
      canvas.width * 0.5,
      canvas.height * 0.53,
      Math.max(canvas.width, canvas.height) * 0.72,
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(0.62, "rgba(0,0,0,0.03)");
    vignette.addColorStop(1, portrait ? "rgba(0,0,0,0.26)" : "rgba(0,0,0,0.20)");
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
