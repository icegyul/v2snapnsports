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
    const rows = portrait ? 24 : 28;
    const seatsPerRow = portrait ? 30 : 66;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let row = 0; row < rows; row += 1) {
      const t = row / Math.max(1, rows - 1);
      const yNorm = portrait ? 0.31 + t * 0.26 : 0.31 + t * 0.27;
      for (let s = 0; s < seatsPerRow; s += 1) {
        const q = s / Math.max(1, seatsPerRow - 1);
        const edge = Math.abs(q - 0.5) * 2;
        const seed = row * 1000 + s;
        if (hash(seed, 9) < 0.12) continue;
        const x = (q + (hash(seed, 2) - 0.5) * 0.004) * canvas.width;
        const y = (yNorm + edge * edge * (portrait ? 0.014 : 0.012) + (hash(seed, 3) - 0.5) * 0.003) * canvas.height;
        const bright = hash(seed, 4);
        const blue = hash(seed, 5) > 0.91;
        const alpha = bright > 0.97 ? 0.18 : bright > 0.86 ? 0.09 : 0.04;
        ctx.fillStyle = blue
          ? `rgba(58,132,220,${alpha})`
          : bright > 0.97
            ? `rgba(220,218,207,${alpha})`
            : `rgba(145,151,157,${alpha})`;
        const size = (0.72 + t * 0.36) * pixelRatio;
        ctx.fillRect(x, y, size, size * 1.3);
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
    base.render(orbit, portrait ? Math.max(0.99, zoom) : Math.max(1.06, zoom));
    const sw = frame.width;
    const sh = frame.height;
    const sx = portrait ? Math.round(sw * 0.02) : Math.round(sw * 0.045);
    const sWidth = Math.max(1, sw - sx * 2);
    const sy = portrait ? Math.round(sh * 0.255) : Math.round(sh * 0.065);
    const cropBottom = portrait ? 0.43 : 0.30;
    const sHeight = Math.max(1, Math.round(sh * (1 - cropBottom) - sy));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.save();
    ctx.filter = portrait
      ? "contrast(1.055) saturate(0.92) brightness(1.01)"
      : "contrast(1.06) saturate(0.93) brightness(1.02)";
    ctx.drawImage(frame, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    drawCrowd();

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = portrait ? 0.026 : 0.034;
    ctx.filter = "blur(4px) brightness(1.10)";
    ctx.drawImage(frame, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const radius = Math.max(canvas.width, canvas.height) * (portrait ? 0.095 : 0.08);
    drawLight(canvas.width * 0.10, canvas.height * 0.045, radius, portrait ? 0.06 : 0.10);
    drawLight(canvas.width * 0.90, canvas.height * 0.045, radius, portrait ? 0.06 : 0.10);
    drawLight(canvas.width * 0.24, canvas.height * 0.12, radius * 0.66, portrait ? 0.03 : 0.045);
    drawLight(canvas.width * 0.76, canvas.height * 0.12, radius * 0.66, portrait ? 0.03 : 0.045);
    ctx.restore();

    const vignette = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.54,
      canvas.width * 0.22,
      canvas.width * 0.5,
      canvas.height * 0.54,
      Math.max(canvas.width, canvas.height) * 0.78,
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(0.70, "rgba(0,0,0,0.008)");
    vignette.addColorStop(1, "rgba(0,0,0,0.11)");
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
