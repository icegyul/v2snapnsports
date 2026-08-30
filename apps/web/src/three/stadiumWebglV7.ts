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

  const drawLight = (x: number, y: number, radius: number, alpha: number) => {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, `rgba(255,248,222,${alpha})`);
    glow.addColorStop(0.12, `rgba(222,238,255,${alpha * 0.75})`);
    glow.addColorStop(0.42, `rgba(118,181,255,${alpha * 0.20})`);
    glow.addColorStop(1, "rgba(55,112,205,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
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

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const lightRadius = Math.max(canvas.width, canvas.height) * (portrait ? 0.18 : 0.13);
    drawLight(canvas.width * 0.10, canvas.height * 0.08, lightRadius, portrait ? 0.20 : 0.26);
    drawLight(canvas.width * 0.90, canvas.height * 0.08, lightRadius, portrait ? 0.20 : 0.26);
    drawLight(canvas.width * 0.20, canvas.height * 0.18, lightRadius * 0.72, portrait ? 0.10 : 0.14);
    drawLight(canvas.width * 0.80, canvas.height * 0.18, lightRadius * 0.72, portrait ? 0.10 : 0.14);
    const pitchGlow = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * (portrait ? 0.67 : 0.70),
      0,
      canvas.width * 0.5,
      canvas.height * (portrait ? 0.67 : 0.70),
      Math.max(canvas.width, canvas.height) * 0.32,
    );
    pitchGlow.addColorStop(0, portrait ? "rgba(210,235,255,0.11)" : "rgba(210,235,255,0.09)");
    pitchGlow.addColorStop(0.45, "rgba(120,188,255,0.04)");
    pitchGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = pitchGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
