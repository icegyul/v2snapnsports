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
    const rows = portrait ? 30 : 36;
    const seatsPerRow = portrait ? 42 : 92;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let row = 0; row < rows; row += 1) {
      const t = row / Math.max(1, rows - 1);
      const yNorm = portrait ? 0.31 + t * 0.26 : 0.31 + t * 0.27;
      for (let s = 0; s < seatsPerRow; s += 1) {
        const q = s / Math.max(1, seatsPerRow - 1);
        const edge = Math.abs(q - 0.5) * 2;
        const seed = row * 1000 + s;
        if (hash(seed, 9) < 0.08) continue;
        const x = (q + (hash(seed, 2) - 0.5) * 0.0038) * canvas.width;
        const y = (yNorm + edge * edge * (portrait ? 0.014 : 0.011) + (hash(seed, 3) - 0.5) * 0.0026) * canvas.height;
        const bright = hash(seed, 4);
        const blue = hash(seed, 5) > 0.90;
        const alpha = bright > 0.965 ? 0.26 : bright > 0.84 ? 0.14 : 0.07;
        ctx.fillStyle = blue
          ? `rgba(58,132,220,${alpha})`
          : bright > 0.965
            ? `rgba(222,219,207,${alpha})`
            : `rgba(146,153,160,${alpha})`;
        const size = (0.82 + t * 0.46) * pixelRatio;
        ctx.fillRect(x, y, size, size * 1.42);
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
    base.render(orbit, portrait ? Math.max(0.99, zoom) : Math.max(1.05, zoom));
    const sw = frame.width;
    const sh = frame.height;
    const sx = portrait ? Math.round(sw * 0.02) : Math.round(sw * 0.07);
    const sWidth = Math.max(1, sw - sx * 2);
    const sy = portrait ? Math.round(sh * 0.255) : Math.round(sh * 0.065);
    const cropBottom = portrait ? 0.43 : 0.30;
    const sHeight = Math.max(1, Math.round(sh * (1 - cropBottom) - sy));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.save();
    ctx.filter = portrait
      ? "contrast(1.05) saturate(0.91) brightness(1.01)"
      : "contrast(1.055) saturate(0.92) brightness(1.02)";
    ctx.drawImage(frame, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    drawCrowd();

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = portrait ? 0.024 : 0.030;
    ctx.filter = "blur(4px) brightness(1.08)";
    ctx.drawImage(frame, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const radius = Math.max(canvas.width, canvas.height) * (portrait ? 0.09 : 0.075);
    drawLight(canvas.width * 0.10, canvas.height * 0.045, radius, portrait ? 0.05 : 0.08);
    drawLight(canvas.width * 0.90, canvas.height * 0.045, radius, portrait ? 0.05 : 0.08);
    drawLight(canvas.width * 0.24, canvas.height * 0.12, radius * 0.64, portrait ? 0.025 : 0.04);
    drawLight(canvas.width * 0.76, canvas.height * 0.12, radius * 0.64, portrait ? 0.025 : 0.04);
    ctx.restore();

    const vignette = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.54,
      canvas.width * 0.23,
      canvas.width * 0.5,
      canvas.height * 0.54,
      Math.max(canvas.width, canvas.height) * 0.79,
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(0.72, "rgba(0,0,0,0.006)");
    vignette.addColorStop(1, "rgba(0,0,0,0.10)");
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
