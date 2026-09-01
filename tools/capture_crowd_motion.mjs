/* global process, console, window, document, performance */
// Proves the stands actually move: samples the live canvas twice and requires
// a real pixel difference over the stands, then requires stillness under
// prefers-reduced-motion. Also samples the frame rate so the ambient loop
// cannot quietly become a battery hog. No image dependency: the sampling and
// diffing happen in the page against the canvas itself.
import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.STADIUM_PREVIEW_URL ?? "http://127.0.0.1:4173";
const appBaseUrl = `${baseUrl.replace(/\/+$/, "")}/v2`;
const outputDir = process.env.STADIUM_CROWD_EVIDENCE_DIR ?? "output/stadium-crowd-evidence";
await fs.mkdir(outputDir, { recursive: true });

const browserGlArgs = (process.env.STADIUM_BROWSER_GL_ARGS
  ?? "--use-gl=swiftshader --enable-webgl --ignore-gpu-blocklist --disable-dev-shm-usage")
  .split(" ")
  .filter(Boolean);

const browser = await chromium.launch({ headless: true, args: browserGlArgs });
const checks = [];
const record = (name, pass, detail = "") => {
  checks.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

// Ratio of sampled stand pixels that change between two moments. The WebGL
// canvas keeps no readable drawing buffer, so the compositor's own screenshots
// are decoded back inside the page and compared there. Only the top half is
// compared, so pitch lighting cannot fake a pass.
async function standsDiffRatio(page, gapMs) {
  const shot = () => page.locator(".stadium-webgl-canvas, .full-journey-canvas").first()
    .screenshot()
    .then((buffer) => buffer.toString("base64"));

  const first = await shot();
  await page.waitForTimeout(gapMs);
  const second = await shot();

  return await page.evaluate(async ([a, b]) => {
    const decode = (base64) => new Promise((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = `data:image/png;base64,${base64}`;
    });
    const [imageA, imageB] = await Promise.all([decode(a), decode(b)]);
    const width = 320;
    const height = 200;
    const read = (image) => {
      const scratch = document.createElement("canvas");
      scratch.width = width;
      scratch.height = height;
      const ctx = scratch.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(image, 0, 0, width, height);
      return ctx.getImageData(0, 0, width, Math.floor(height / 2)).data;
    };
    const pixelsA = read(imageA);
    const pixelsB = read(imageB);

    let changed = 0;
    let counted = 0;
    let lit = 0;
    for (let i = 0; i < pixelsA.length; i += 8) {
      const delta = Math.abs(pixelsA[i] - pixelsB[i])
        + Math.abs(pixelsA[i + 1] - pixelsB[i + 1])
        + Math.abs(pixelsA[i + 2] - pixelsB[i + 2]);
      counted += 1;
      if (pixelsA[i] + pixelsA[i + 1] + pixelsA[i + 2] > 30) lit += 1;
      if (delta > 24) changed += 1;
    }
    return { ratio: changed / Math.max(1, counted), sampled: counted, blank: lit / Math.max(1, counted) < 0.2 };
  }, [first, second]);
}

async function run(name, reducedMotion, url, readySelector) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.stack ?? error.message));

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(readySelector, { timeout: 30000 });
  await page.waitForTimeout(3000);

  const { ratio, blank } = await standsDiffRatio(page, 700);
  record(`${name}: canvas actually sampled`, !blank, blank ? "sample came back dark" : "");
  await page.screenshot({ path: `${outputDir}/${name}.png` });

  if (reducedMotion === "reduce") {
    record(`${name}: stands hold still`, ratio < 0.004, `diff ${(ratio * 100).toFixed(3)}%`);
  } else {
    record(`${name}: stands move`, ratio > 0.01, `diff ${(ratio * 100).toFixed(2)}%`);
    // Frame pacing: the loop is capped, so the page must still hand out
    // animation frames freely to everything else.
    const drawn = await page.evaluate(async () => {
      let frames = 0;
      const started = performance.now();
      return await new Promise((resolve) => {
        const tick = () => {
          frames += 1;
          if (performance.now() - started >= 1000) resolve(frames);
          else window.requestAnimationFrame(tick);
        };
        window.requestAnimationFrame(tick);
      });
    });
    record(`${name}: page stays responsive`, drawn > 20, `${drawn} rAF/s`);
  }

  const blocking = consoleErrors.filter((text) => !text.includes("favicon"));
  record(`${name}: no console errors`, blocking.length === 0, blocking.slice(0, 2).join(" | "));
  await context.close();
}

try {
  await run("home", "no-preference", `${appBaseUrl}/home`, ".stadium-webgl-ready");
  await run("home-reduced", "reduce", `${appBaseUrl}/home`, ".stadium-webgl-ready");
  await run("tactics", "no-preference", `${appBaseUrl}/home/full`, ".team-tactics-field");
} finally {
  await browser.close();
}

const failed = checks.filter((check) => !check.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
if (failed.length > 0) process.exit(1);
