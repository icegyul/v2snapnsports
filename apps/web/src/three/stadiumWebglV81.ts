import type { CoreVisualMode } from "../api/coreProductContracts";
import { createStadiumWebglRenderer as createV8, type StadiumWebglRenderer } from "./stadiumWebglV8";

export type { StadiumWebglRenderer } from "./stadiumWebglV8";

function hash(index: number, salt: number): number {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

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
    base.resize(width, portrait ? height * 1.22 : height * 1.04, pixelRatio);
  };

  const drawCrowd = () => {
    const count = portrait ? 620 : 1080;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < count; i += 1) {
      const x = hash(i, 1) * canvas.width;
      const band = hash(i, 2);
      const yNorm = band < 0.34
        ? 0.13 + hash(i, 3) * 0.13
        : band < 0.72
          ? 0.27 + hash(i, 4) * 0.13
          : 0.41 + hash(i, 5) * 0.12;
      const y = yNorm * canvas.height;
      const centerGap = yNorm < 0.28 && x > canvas.width * 0.41 && x < canvas.width * 0.59;
      if (centerGap) continue;
      const brightness = hash(i, 6);
      const alpha = brightness > 0.94 ? 0.28 : brightness > 0.72 ? 0.12 : 0.055;
      const blue = hash(i, 7) > 0.84;
      ctx.fillStyle = blue
        ? `rgba(90,155,235,${alpha})`
        : brightness > 0.94
          ? `rgba(238,235,222,${alpha})`
          : `rgba(170,177,184,${alpha})`;
      const size = (brightness > 0.93 ? 1.55 : 0.9) * pixelRatio;
      ctx.fillRect(x, y, size, size * 1.45);
    }
    ctx.restore();
  };

  const drawLight = (x: number, y: number, radius: number, alpha: number) => {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, `rgba(255,250,232,${alpha})`);
    glow.addColorStop(0.10, `rgba(228,240,255,${alpha * 0.70})`);
    glow.addColorStop(0.40, `rgba(124,177,235,${alpha * 0.14})`);
    glow.addColorStop(1, "rgba(55,112,205,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  };

  const render = (orbit: number, zoom: number) => {
    base.render(orbit, portrait ? Math.max(1.18, zoom) : Math.max(1.14, zoom));
    const sw = frame.width;
    const sh = frame.height;
    const sy = portrait ? Math.round(sh * 0.255) : Math.round(sh * 0.09);
    const cropBottom = portrait ? 0.26 : 0.16;
    const sHeight = Math.max(1, Math.round(sh * (1 - cropBottom) - sy));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.save();
    ctx.filter = portrait
      ? "contrast(1.10) saturate(1.02) brightness(1.06)"
      : "contrast(1.10) saturate(1.01) brightness(1.05)";
    ctx.drawImage(frame, 0, sy, sw, sHeight, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    drawCrowd();

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = portrait ? 0.07 : 0.085;
    ctx.filter = "blur(6px) brightness(1.28)";
    ctx.drawImage(frame, 0, sy, sw, sHeight, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const radius = Math.max(canvas.width, canvas.height) * (portrait ? 0.15 : 0.11);
    drawLight(canvas.width * 0.10, canvas.height * 0.05, radius, portrait ? 0.15 : 0.20);
    drawLight(canvas.width * 0.90, canvas.height * 0.05, radius, portrait ? 0.15 : 0.20);
    drawLight(canvas.width * 0.24, canvas.height * 0.12, radius * 0.70, portrait ? 0.075 : 0.10);
    drawLight(canvas.width * 0.76, canvas.height * 0.12, radius * 0.70, portrait ? 0.075 : 0.10);
    ctx.restore();

    const vignette = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.55,
      canvas.width * 0.16,
      canvas.width * 0.5,
      canvas.height * 0.55,
      Math.max(canvas.width, canvas.height) * 0.73,
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(0.65, "rgba(0,0,0,0.02)");
    vignette.addColorStop(1, portrait ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.17)");
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

  return { triangleCount: base.triangleCount, resize, render, destroy };
}
