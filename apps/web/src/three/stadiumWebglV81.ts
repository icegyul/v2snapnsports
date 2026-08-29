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
    const count = portrait ? 1320 : 2350;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < count; i += 1) {
      const x = hash(i, 1) * canvas.width;
      const band = hash(i, 2);
      const yNorm = band < 0.30
        ? 0.13 + hash(i, 3) * 0.13
        : band < 0.67
          ? 0.275 + hash(i, 4) * 0.14
          : 0.425 + hash(i, 5) * 0.12;
      const y = yNorm * canvas.height;
      const centerGap = yNorm < 0.29 && x > canvas.width * 0.40 && x < canvas.width * 0.60;
      if (centerGap) continue;
      const brightness = hash(i, 6);
      const accent = hash(i, 7);
      const alpha = brightness > 0.965 ? 0.34 : brightness > 0.76 ? 0.15 : 0.070;
      ctx.fillStyle = accent > 0.91
        ? `rgba(86,149,235,${alpha})`
        : accent < 0.08
          ? `rgba(196,104,72,${alpha * 0.72})`
          : brightness > 0.965
            ? `rgba(245,238,218,${alpha})`
            : `rgba(166,174,181,${alpha})`;
      const size = (brightness > 0.95 ? 1.7 : brightness > 0.72 ? 1.12 : 0.82) * pixelRatio;
      ctx.fillRect(x, y, size, size * 1.5);
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

  const drawFieldGrade = () => {
    const start = canvas.height * (portrait ? 0.53 : 0.56);
    const gradient = ctx.createLinearGradient(0, start, 0, canvas.height);
    gradient.addColorStop(0, "rgba(18,28,20,0)");
    gradient.addColorStop(0.34, "rgba(16,26,18,0.035)");
    gradient.addColorStop(1, "rgba(8,18,10,0.12)");
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, start, canvas.width, canvas.height - start);
    ctx.restore();
  };

  const render = (orbit: number, zoom: number) => {
    base.render(orbit, portrait ? Math.max(1.08, zoom) : Math.max(1.14, zoom));
    const sw = frame.width;
    const sh = frame.height;
    const sy = portrait ? Math.round(sh * 0.205) : Math.round(sh * 0.09);
    const cropBottom = portrait ? 0.205 : 0.16;
    const sHeight = Math.max(1, Math.round(sh * (1 - cropBottom) - sy));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.save();
    ctx.filter = portrait
      ? "contrast(1.12) saturate(0.96) brightness(1.05)"
      : "contrast(1.11) saturate(0.95) brightness(1.04)";
    ctx.drawImage(frame, 0, sy, sw, sHeight, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    drawCrowd();
    drawFieldGrade();

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = portrait ? 0.065 : 0.075;
    ctx.filter = "blur(6px) brightness(1.22)";
    ctx.drawImage(frame, 0, sy, sw, sHeight, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const radius = Math.max(canvas.width, canvas.height) * (portrait ? 0.14 : 0.11);
    drawLight(canvas.width * 0.10, canvas.height * 0.04, radius, portrait ? 0.18 : 0.22);
    drawLight(canvas.width * 0.90, canvas.height * 0.04, radius, portrait ? 0.18 : 0.22);
    drawLight(canvas.width * 0.24, canvas.height * 0.11, radius * 0.70, portrait ? 0.09 : 0.11);
    drawLight(canvas.width * 0.76, canvas.height * 0.11, radius * 0.70, portrait ? 0.09 : 0.11);
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
    vignette.addColorStop(1, portrait ? "rgba(0,0,0,0.17)" : "rgba(0,0,0,0.16)");
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
