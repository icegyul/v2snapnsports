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
    base.resize(width, portrait ? height * 1.16 : height * 1.04, pixelRatio);
  };

  const drawCrowd = () => {
    const rows = portrait ? 26 : 30;
    const seatsPerRow = portrait ? 32 : 70;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let row = 0; row < rows; row += 1) {
      const t = row / Math.max(1, rows - 1);
      const yNorm = portrait ? 0.30 + t * 0.28 : 0.31 + t * 0.28;
      for (let s = 0; s < seatsPerRow; s += 1) {
        const q = s / Math.max(1, seatsPerRow - 1);
        const edge = Math.abs(q - 0.5) * 2;
        const seed = row * 1000 + s;
        if (hash(seed, 9) < 0.10) continue;
        const x = (q + (hash(seed, 2) - 0.5) * 0.005) * canvas.width;
        const y = (yNorm + edge * edge * (portrait ? 0.016 : 0.014) + (hash(seed, 3) - 0.5) * 0.003) * canvas.height;
        const bright = hash(seed, 4);
        const blue = hash(seed, 5) > 0.90;
        const alpha = bright > 0.97 ? 0.20 : bright > 0.84 ? 0.10 : 0.05;
        ctx.fillStyle = blue
          ? `rgba(58,132,220,${alpha})`
          : bright > 0.97
            ? `rgba(220,218,207,${alpha})`
            : `rgba(145,151,157,${alpha})`;
        const size = (0.76 + t * 0.40) * pixelRatio;
        ctx.fillRect(x, y, size, size * 1.35);
      }
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
    base.render(orbit, portrait ? Math.max(1.00, zoom) : Math.max(1.08, zoom));
    const sw = frame.width;
    const sh = frame.height;
    const sy = portrait ? Math.round(sh * 0.255) : Math.round(sh * 0.07);
    const cropBottom = portrait ? 0.235 : 0.285;
    const sHeight = Math.max(1, Math.round(sh * (1 - cropBottom) - sy));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.save();
    ctx.filter = portrait
      ? "contrast(1.06) saturate(0.93) brightness(1.01)"
      : "contrast(1.07) saturate(0.94) brightness(1.02)";
    ctx.drawImage(frame, 0, sy, sw, sHeight, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    drawCrowd();

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = portrait ? 0.030 : 0.040;
    ctx.filter = "blur(4px) brightness(1.12)";
    ctx.drawImage(frame, 0, sy, sw, sHeight, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const radius = Math.max(canvas.width, canvas.height) * (portrait ? 0.10 : 0.085);
    drawLight(canvas.width * 0.10, canvas.height * 0.045, radius, portrait ? 0.07 : 0.12);
    drawLight(canvas.width * 0.90, canvas.height * 0.045, radius, portrait ? 0.07 : 0.12);
    drawLight(canvas.width * 0.24, canvas.height * 0.12, radius * 0.68, portrait ? 0.035 : 0.055);
    drawLight(canvas.width * 0.76, canvas.height * 0.12, radius * 0.68, portrait ? 0.035 : 0.055);
    ctx.restore();

    const vignette = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.55,
      canvas.width * 0.20,
      canvas.width * 0.5,
      canvas.height * 0.55,
      Math.max(canvas.width, canvas.height) * 0.76,
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(0.68, "rgba(0,0,0,0.01)");
    vignette.addColorStop(1, portrait ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.12)");
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
