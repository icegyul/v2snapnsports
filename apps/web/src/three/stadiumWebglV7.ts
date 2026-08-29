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

    const sourceHeight = portrait ? height * 1.42 : height * 1.16;
    base.resize(width, sourceHeight, pixelRatio);
  };

  const render = (orbit: number, zoom: number) => {
    base.render(orbit, portrait ? Math.max(1.02, zoom) : Math.max(0.99, zoom));

    const sw = frame.width;
    const sh = frame.height;
    const sx = 0;
    const sy = portrait ? Math.round(sh * 0.055) : Math.round(sh * 0.035);
    const cropBottom = portrait ? 0.285 : 0.13;
    const sHeight = Math.max(1, Math.round(sh * (1 - cropBottom) - sy));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(frame, sx, sy, sw, sHeight, 0, 0, canvas.width, canvas.height);
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
